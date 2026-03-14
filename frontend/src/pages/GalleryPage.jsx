import { useState } from "react";
import { 
  FileCode, 
  CheckSquare, 
  Terminal, 
  Server, 
  Smartphone,
  ArrowRight,
  Copy,
  Eye
} from "lucide-react";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { PKML_EXAMPLES, generateFreshExample } from "../lib/pkmlExamples";
import { toast } from "sonner";

// Icon map for examples
const iconMap = {
  FileCode,
  CheckSquare,
  Terminal,
  Server,
  Smartphone
};

// Category labels
const categoryLabels = {
  starter: "Starter",
  saas: "SaaS",
  devtool: "Developer Tool",
  api: "API Service",
  mobile: "Mobile App"
};

// Category colors
const categoryColors = {
  starter: "bg-green-500/10 text-green-400 border-green-500/20",
  saas: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  devtool: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  api: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  mobile: "bg-pink-500/10 text-pink-400 border-pink-500/20"
};

// Template Card Component
const TemplateCard = ({ example, onSelect, onPreview }) => {
  const Icon = iconMap[example.icon] || FileCode;
  
  return (
    <div 
      className="gallery-card group"
      data-testid={`gallery-card-${example.id}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{example.name}</h3>
            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{example.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] px-2 py-0.5 rounded border ${categoryColors[example.category]}`}>
            {categoryLabels[example.category]}
          </span>
          {example.content.features && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {example.content.features.length} features
            </span>
          )}
        </div>

        {/* Quick preview */}
        <div className="bg-zinc-950 rounded-md p-2 mb-3 font-mono text-[10px] text-zinc-500 overflow-hidden">
          <div className="truncate">
            <span className="text-indigo-400">"product"</span>
            <span className="text-zinc-600">: {"{"}</span>
          </div>
          <div className="truncate pl-3">
            <span className="text-indigo-400">"name"</span>
            <span className="text-zinc-600">: </span>
            <span className="text-green-400">"{example.content.product?.name}"</span>
          </div>
          <div className="truncate pl-3">
            <span className="text-indigo-400">"tagline"</span>
            <span className="text-zinc-600">: </span>
            <span className="text-green-400">"{example.content.product?.tagline?.substring(0, 30)}..."</span>
          </div>
          <div className="text-zinc-600">{"}"}</div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={() => onPreview(example)}
            data-testid={`preview-${example.id}`}
          >
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </Button>
          <Button 
            size="sm" 
            className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700"
            onClick={() => onSelect(example)}
            data-testid={`use-template-${example.id}`}
          >
            Use Template
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Preview Dialog
const PreviewDialog = ({ example, open, onOpenChange, onSelect }) => {
  if (!example) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(example.content, null, 2));
    toast.success("Copied to clipboard!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] bg-zinc-900 border-zinc-800 overflow-hidden flex flex-col" data-testid="preview-dialog">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            {example.name}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {example.description}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
          <pre className="bg-zinc-950 rounded-lg p-4 text-xs font-mono overflow-x-auto">
            <code className="text-zinc-300">
              {JSON.stringify(example.content, null, 2)}
            </code>
          </pre>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
          <Button variant="outline" onClick={handleCopy} data-testid="copy-preview">
            <Copy className="w-4 h-4 mr-2" />
            Copy JSON
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => {
              onSelect(example);
              onOpenChange(false);
            }}
            data-testid="use-preview-template"
          >
            Use This Template
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Gallery Page
export const GalleryPage = ({ onSelectTemplate }) => {
  const [previewExample, setPreviewExample] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleSelect = (example) => {
    const content = generateFreshExample(example.id);
    if (content) {
      onSelectTemplate(content);
    }
  };

  const handlePreview = (example) => {
    setPreviewExample(example);
    setPreviewOpen(true);
  };

  // Group examples by category
  const categories = [...new Set(PKML_EXAMPLES.map(e => e.category))];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col" data-testid="gallery-page">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white mb-1">PKML Templates</h2>
        <p className="text-sm text-zinc-400">
          Start with a template to quickly create your PKML document
        </p>
      </div>

      {/* Gallery Grid */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  category === 'starter' ? 'bg-green-500' :
                  category === 'saas' ? 'bg-blue-500' :
                  category === 'devtool' ? 'bg-purple-500' :
                  category === 'api' ? 'bg-orange-500' : 'bg-pink-500'
                }`} />
                {categoryLabels[category]}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PKML_EXAMPLES.filter(e => e.category === category).map(example => (
                  <TemplateCard
                    key={example.id}
                    example={example}
                    onSelect={handleSelect}
                    onPreview={handlePreview}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Bottom padding */}
          <div className="h-8" />
        </div>
      </ScrollArea>

      {/* Preview Dialog */}
      <PreviewDialog
        example={previewExample}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default GalleryPage;
