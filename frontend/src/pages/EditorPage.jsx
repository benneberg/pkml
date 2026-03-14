import { useState, useEffect, useCallback, useRef } from "react";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Download, 
  Upload, 
  FileText, 
  RefreshCw,
  Wand2,
  Copy,
  FileDown,
  Loader2,
  ChevronRight,
  Info
} from "lucide-react";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from "../components/ui/resizable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { DEFAULT_PKML, MONACO_OPTIONS, configureMonaco } from "../lib/pkmlSchema";
import { PKML_EXAMPLES, generateFreshExample } from "../lib/pkmlExamples";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Validation Result Component
const ValidationPanel = ({ validation, isValidating }) => {
  const { valid, errors, warnings, completeness_score } = validation || {};
  
  // Calculate ring progress
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - ((completeness_score || 0) / 100) * circumference;

  return (
    <div className="h-full flex flex-col bg-zinc-950" data-testid="validation-panel">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Validation</h3>
          {isValidating && (
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
            {valid === undefined ? (
              <>
                <Info className="w-5 h-5 text-zinc-500" />
                <span className="text-sm text-zinc-400">Enter PKML to validate</span>
              </>
            ) : valid ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-400 font-medium">Valid PKML</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-400 font-medium">Invalid PKML</span>
              </>
            )}
          </div>

          {/* Completeness Score */}
          {completeness_score !== undefined && (
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Completeness</span>
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-zinc-800"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={`score-ring ${
                      completeness_score >= 80 ? 'text-green-500' :
                      completeness_score >= 50 ? 'text-yellow-500' : 'text-red-500'
                    }`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{completeness_score}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          {errors && errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-2">
                <XCircle className="w-3 h-3" />
                Errors ({errors.length})
              </h4>
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div 
                    key={index}
                    className="validation-item validation-error p-3 rounded-r-md text-sm"
                    data-testid={`validation-error-${index}`}
                  >
                    <div className="font-mono text-xs text-red-400 mb-1">{error.path}</div>
                    <div className="text-zinc-300">{error.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings && warnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                Warnings ({warnings.length})
              </h4>
              <div className="space-y-2">
                {warnings.map((warning, index) => (
                  <div 
                    key={index}
                    className="validation-item validation-warning p-3 rounded-r-md text-sm"
                    data-testid={`validation-warning-${index}`}
                  >
                    <div className="font-mono text-xs text-yellow-400 mb-1">{warning.path}</div>
                    <div className="text-zinc-300">{warning.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success state */}
          {valid && errors?.length === 0 && (
            <div className="validation-success p-4 rounded-r-md text-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-green-400 font-medium">All checks passed!</p>
              <p className="text-xs text-zinc-500 mt-1">Your PKML is valid and ready to use</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// Import README Dialog
const ImportReadmeDialog = ({ onImport }) => {
  const [readmeContent, setReadmeContent] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleImport = async () => {
    if (!readmeContent.trim()) {
      toast.error("Please enter README content");
      return;
    }

    setIsImporting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/pkml/parse-readme`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readme_content: readmeContent }),
      });
      
      if (!response.ok) throw new Error("Failed to parse README");
      
      const data = await response.json();
      onImport(JSON.stringify(data.pkml, null, 2));
      toast.success("README imported successfully!");
      setOpen(false);
      setReadmeContent("");
    } catch (error) {
      toast.error("Failed to import README");
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="import-readme-btn">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Import README</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800" data-testid="import-readme-dialog">
        <DialogHeader>
          <DialogTitle className="text-white">Import from README</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Paste your README.md content below to generate a draft PKML document
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={readmeContent}
            onChange={(e) => setReadmeContent(e.target.value)}
            placeholder="# My Product&#10;&#10;A brief description of your product...&#10;&#10;## Features&#10;- Feature 1&#10;- Feature 2"
            className="h-64 font-mono text-sm bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
            data-testid="readme-textarea"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} data-testid="cancel-import-btn">
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={isImporting} data-testid="confirm-import-btn">
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Generate Example Dialog
const GenerateExampleDialog = ({ onGenerate }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (exampleId) => {
    const content = generateFreshExample(exampleId);
    if (content) {
      onGenerate(JSON.stringify(content, null, 2));
      toast.success("Example loaded!");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="generate-example-btn">
          <Wand2 className="w-4 h-4" />
          <span className="hidden sm:inline">Generate Example</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-zinc-900 border-zinc-800" data-testid="generate-example-dialog">
        <DialogHeader>
          <DialogTitle className="text-white">Generate Example PKML</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Choose a template to start with
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {PKML_EXAMPLES.map((example) => (
            <button
              key={example.id}
              onClick={() => handleSelect(example.id)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-colors text-left group"
              data-testid={`example-${example.id}`}
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{example.name}</div>
                <div className="text-xs text-zinc-500">{example.description}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Editor Page
export const EditorPage = ({ content, onContentChange }) => {
  const [validation, setValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const editorRef = useRef(null);
  const validationTimeoutRef = useRef(null);

  // Configure Monaco on mount
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    configureMonaco(monaco);
    monaco.editor.setTheme('pkml-dark');
  };

  // Validate content
  const validateContent = useCallback(async (contentToValidate) => {
    if (!contentToValidate?.trim()) {
      setValidation(null);
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/pkml/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentToValidate }),
      });
      
      if (!response.ok) throw new Error("Validation failed");
      
      const result = await response.json();
      setValidation(result);
    } catch (error) {
      console.error("Validation error:", error);
      // Try to parse JSON locally if backend fails
      try {
        JSON.parse(contentToValidate);
        setValidation({
          valid: false,
          errors: [{ path: "root", message: "Backend validation unavailable", severity: "warning" }],
          warnings: [],
          completeness_score: 0
        });
      } catch (parseError) {
        setValidation({
          valid: false,
          errors: [{ path: "root", message: `Invalid JSON: ${parseError.message}`, severity: "error" }],
          warnings: [],
          completeness_score: 0
        });
      }
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Debounced validation on content change
  useEffect(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    
    validationTimeoutRef.current = setTimeout(() => {
      validateContent(content);
    }, 500);

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [content, validateContent]);

  // Handle content change from editor
  const handleEditorChange = (value) => {
    onContentChange(value || "");
  };

  // Download PKML as JSON
  const handleDownload = () => {
    if (!content) {
      toast.error("No content to download");
      return;
    }

    try {
      // Validate JSON before download
      const parsed = JSON.parse(content);
      const blob = new Blob([JSON.stringify(parsed, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${parsed.product?.name || "pkml"}.pkml.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PKML downloaded!");
    } catch (error) {
      toast.error("Invalid JSON - fix errors before downloading");
    }
  };

  // Export to Markdown
  const handleExportMarkdown = async () => {
    if (!content) {
      toast.error("No content to export");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/pkml/export-markdown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pkml_content: content }),
      });
      
      if (!response.ok) throw new Error("Export failed");
      
      const data = await response.json();
      const blob = new Blob([data.markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "product-documentation.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Markdown exported!");
    } catch (error) {
      toast.error("Failed to export Markdown");
      console.error(error);
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!content) {
      toast.error("No content to copy");
      return;
    }
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  // Format JSON
  const handleFormat = () => {
    if (!content) return;
    try {
      const formatted = JSON.stringify(JSON.parse(content), null, 2);
      onContentChange(formatted);
      toast.success("Formatted!");
    } catch (error) {
      toast.error("Cannot format invalid JSON");
    }
  };

  // Create new PKML
  const handleNew = () => {
    const newContent = JSON.stringify(DEFAULT_PKML, null, 2);
    onContentChange(newContent);
    toast.success("New PKML created!");
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col" data-testid="editor-page">
      {/* Toolbar */}
      <div className="toolbar flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleNew} className="gap-2" data-testid="new-pkml-btn">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </Button>
          <ImportReadmeDialog onImport={onContentChange} />
          <GenerateExampleDialog onGenerate={onContentChange} />
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleFormat} title="Format JSON" data-testid="format-btn">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy to clipboard" data-testid="copy-btn">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportMarkdown} className="gap-2" data-testid="export-md-btn">
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Export MD</span>
          </Button>
          <Button size="sm" onClick={handleDownload} className="gap-2 bg-indigo-600 hover:bg-indigo-700" data-testid="download-btn">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>

      {/* Editor + Validation Panel */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={70} minSize={40}>
            <div className="h-full monaco-container" data-testid="monaco-editor-container">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={content}
                onChange={handleEditorChange}
                onMount={handleEditorMount}
                options={{
                  ...MONACO_OPTIONS,
                  theme: 'pkml-dark'
                }}
                loading={
                  <div className="h-full flex items-center justify-center text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                }
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle className="bg-zinc-800 hover:bg-indigo-600/50 transition-colors" />
          
          <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
            <ValidationPanel validation={validation} isValidating={isValidating} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <div className="status-bar flex items-center px-4 text-zinc-500">
        <span className="flex items-center gap-2">
          {validation?.valid === true && (
            <>
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span className="text-green-500">Valid</span>
            </>
          )}
          {validation?.valid === false && (
            <>
              <XCircle className="w-3 h-3 text-red-500" />
              <span className="text-red-500">{validation.errors?.length} error(s)</span>
            </>
          )}
          {validation === null && "Ready"}
        </span>
        <span className="flex-1" />
        <span>PKML v0.1.0</span>
      </div>
    </div>
  );
};

export default EditorPage;
