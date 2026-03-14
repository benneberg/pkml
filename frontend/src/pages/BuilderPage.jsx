import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { 
  Plus, 
  Trash2, 
  Save, 
  ChevronDown,
  ChevronRight,
  FileJson,
  Package,
  Layers,
  Workflow,
  Palette,
  Server,
  Plug
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import { DEFAULT_PKML } from "../lib/pkmlSchema";

// Section wrapper component
const FormSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button 
          className="w-full flex items-center gap-3 p-4 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 rounded-lg transition-colors"
          data-testid={`section-${title.toLowerCase().replace(/\s/g, '-')}`}
        >
          <Icon className="w-5 h-5 text-indigo-400" />
          <span className="flex-1 text-left font-medium text-white">{title}</span>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg space-y-4">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Input field with label
const FormField = ({ label, children, required, hint }) => (
  <div className="space-y-1.5">
    <Label className="text-sm text-zinc-300">
      {label}
      {required && <span className="text-red-400 ml-1">*</span>}
    </Label>
    {children}
    {hint && <p className="text-xs text-zinc-500">{hint}</p>}
  </div>
);

// Feature item editor
const FeatureEditor = ({ feature, index, onUpdate, onRemove }) => {
  const [isOpen, setIsOpen] = useState(index === 0);

  const handleChange = (field, value) => {
    onUpdate(index, { ...feature, [field]: value });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-zinc-700 rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <button 
            className="w-full flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
            data-testid={`feature-${index}-trigger`}
          >
            <span className="flex-1 text-left text-sm font-medium text-white">
              {feature.name || `Feature ${index + 1}`}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              feature.priority === 'primary' ? 'bg-indigo-500/20 text-indigo-400' :
              feature.priority === 'secondary' ? 'bg-purple-500/20 text-purple-400' :
              'bg-zinc-700 text-zinc-400'
            }`}>
              {feature.priority || 'primary'}
            </span>
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-3 space-y-3 bg-zinc-900/50">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="ID" required>
                <Input
                  value={feature.id || ""}
                  onChange={(e) => handleChange("id", e.target.value)}
                  placeholder="feat_my_feature"
                  className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm"
                  data-testid={`feature-${index}-id`}
                />
              </FormField>
              <FormField label="Priority" required>
                <Select value={feature.priority || "primary"} onValueChange={(v) => handleChange("priority", v)}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white" data-testid={`feature-${index}-priority`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="tertiary">Tertiary</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <FormField label="Name" required>
              <Input
                value={feature.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Feature name"
                className="bg-zinc-950 border-zinc-700 text-white"
                data-testid={`feature-${index}-name`}
              />
            </FormField>
            <FormField label="Description" required>
              <Textarea
                value={feature.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="What does this feature do?"
                className="bg-zinc-950 border-zinc-700 text-white resize-none"
                rows={2}
                data-testid={`feature-${index}-description`}
              />
            </FormField>
            <FormField label="User Benefit" required>
              <Input
                value={feature.user_benefit || ""}
                onChange={(e) => handleChange("user_benefit", e.target.value)}
                placeholder="Why it matters to users"
                className="bg-zinc-950 border-zinc-700 text-white"
                data-testid={`feature-${index}-benefit`}
              />
            </FormField>
            <FormField label="Keywords" hint="Comma-separated">
              <Input
                value={(feature.keywords || []).join(", ")}
                onChange={(e) => handleChange("keywords", e.target.value.split(",").map(k => k.trim()).filter(Boolean))}
                placeholder="keyword1, keyword2"
                className="bg-zinc-950 border-zinc-700 text-white"
                data-testid={`feature-${index}-keywords`}
              />
            </FormField>
            <div className="flex justify-end">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onRemove(index)}
                data-testid={`feature-${index}-remove`}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

// Main Builder Page
export const BuilderPage = ({ content, onContentChange }) => {
  const [pkml, setPkml] = useState(() => {
    try {
      return content ? JSON.parse(content) : { ...DEFAULT_PKML };
    } catch {
      return { ...DEFAULT_PKML };
    }
  });

  // Sync content changes to pkml state
  useEffect(() => {
    try {
      if (content) {
        const parsed = JSON.parse(content);
        setPkml(parsed);
      }
    } catch {
      // Keep current state if content is invalid JSON
    }
  }, [content]);

  // Update parent with changes
  const updatePkml = useCallback((updates) => {
    const newPkml = { ...pkml, ...updates };
    newPkml.meta = {
      ...newPkml.meta,
      last_updated: new Date().toISOString()
    };
    setPkml(newPkml);
    onContentChange(JSON.stringify(newPkml, null, 2));
  }, [pkml, onContentChange]);

  // Update nested object
  const updateNested = (path, value) => {
    const parts = path.split(".");
    const newPkml = { ...pkml };
    let current = newPkml;
    
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = current[parts[i]] ? { ...current[parts[i]] } : {};
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
    updatePkml(newPkml);
  };

  // Feature management
  const addFeature = () => {
    const features = pkml.features || [];
    const newFeature = {
      id: `feat_${features.length + 1}`,
      name: "",
      description: "",
      user_benefit: "",
      priority: "primary"
    };
    updatePkml({ features: [...features, newFeature] });
  };

  const updateFeature = (index, feature) => {
    const features = [...(pkml.features || [])];
    features[index] = feature;
    updatePkml({ features });
  };

  const removeFeature = (index) => {
    const features = [...(pkml.features || [])];
    features.splice(index, 1);
    updatePkml({ features });
    toast.success("Feature removed");
  };

  // Save to editor
  const handleSave = () => {
    onContentChange(JSON.stringify(pkml, null, 2));
    toast.success("Changes saved to editor!");
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col" data-testid="builder-page">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <FileJson className="w-4 h-4 text-indigo-400" />
          <span>Visual PKML Builder</span>
        </div>
        <div className="flex-1" />
        <Button onClick={handleSave} className="gap-2 bg-indigo-600 hover:bg-indigo-700" data-testid="save-builder-btn">
          <Save className="w-4 h-4" />
          Save to Editor
        </Button>
      </div>

      {/* Form Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-6 space-y-4">
          {/* Meta Section */}
          <FormSection title="Meta Information" icon={FileJson} defaultOpen>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Document Version" required>
                <Input
                  value={pkml.meta?.version || "1.0.0"}
                  onChange={(e) => updateNested("meta.version", e.target.value)}
                  placeholder="1.0.0"
                  className="bg-zinc-950 border-zinc-700 text-white font-mono"
                  data-testid="meta-version"
                />
              </FormField>
              <FormField label="PKML Version" required>
                <Input
                  value={pkml.meta?.pkml_version || "0.1.0"}
                  onChange={(e) => updateNested("meta.pkml_version", e.target.value)}
                  placeholder="0.1.0"
                  className="bg-zinc-950 border-zinc-700 text-white font-mono"
                  data-testid="meta-pkml-version"
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Author">
                <Input
                  value={pkml.meta?.author || ""}
                  onChange={(e) => updateNested("meta.author", e.target.value)}
                  placeholder="Your name or team"
                  className="bg-zinc-950 border-zinc-700 text-white"
                  data-testid="meta-author"
                />
              </FormField>
              <FormField label="License">
                <Input
                  value={pkml.meta?.license || ""}
                  onChange={(e) => updateNested("meta.license", e.target.value)}
                  placeholder="CC-BY-4.0"
                  className="bg-zinc-950 border-zinc-700 text-white"
                  data-testid="meta-license"
                />
              </FormField>
            </div>
          </FormSection>

          {/* Product Section */}
          <FormSection title="Product Information" icon={Package} defaultOpen>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Product Name" required>
                <Input
                  value={pkml.product?.name || ""}
                  onChange={(e) => updateNested("product.name", e.target.value)}
                  placeholder="My Product"
                  className="bg-zinc-950 border-zinc-700 text-white"
                  data-testid="product-name"
                />
              </FormField>
              <FormField label="Categories" hint="Comma-separated">
                <Input
                  value={(pkml.product?.category || []).join(", ")}
                  onChange={(e) => updateNested("product.category", e.target.value.split(",").map(c => c.trim()).filter(Boolean))}
                  placeholder="productivity, developer-tools"
                  className="bg-zinc-950 border-zinc-700 text-white"
                  data-testid="product-categories"
                />
              </FormField>
            </div>
            <FormField label="Tagline" required hint="One sentence description">
              <Input
                value={pkml.product?.tagline || ""}
                onChange={(e) => updateNested("product.tagline", e.target.value)}
                placeholder="Your product in one sentence"
                className="bg-zinc-950 border-zinc-700 text-white"
                data-testid="product-tagline"
              />
            </FormField>
            <FormField label="Description" hint="2-3 sentences">
              <Textarea
                value={pkml.product?.description || ""}
                onChange={(e) => updateNested("product.description", e.target.value)}
                placeholder="A longer description of your product..."
                className="bg-zinc-950 border-zinc-700 text-white resize-none"
                rows={3}
                data-testid="product-description"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Website">
                <Input
                  value={pkml.product?.website || ""}
                  onChange={(e) => updateNested("product.website", e.target.value)}
                  placeholder="https://myproduct.com"
                  className="bg-zinc-950 border-zinc-700 text-white"
                  data-testid="product-website"
                />
              </FormField>
              <FormField label="Repository">
                <Input
                  value={pkml.product?.repository || ""}
                  onChange={(e) => updateNested("product.repository", e.target.value)}
                  placeholder="https://github.com/..."
                  className="bg-zinc-950 border-zinc-700 text-white"
                  data-testid="product-repository"
                />
              </FormField>
            </div>

            {/* Positioning */}
            <div className="pt-4 border-t border-zinc-800">
              <h4 className="text-sm font-medium text-zinc-300 mb-3">Positioning</h4>
              <div className="space-y-3">
                <FormField label="Problem">
                  <Textarea
                    value={pkml.product?.positioning?.problem || ""}
                    onChange={(e) => updateNested("product.positioning.problem", e.target.value)}
                    placeholder="What problem does your product solve?"
                    className="bg-zinc-950 border-zinc-700 text-white resize-none"
                    rows={2}
                    data-testid="positioning-problem"
                  />
                </FormField>
                <FormField label="Solution">
                  <Textarea
                    value={pkml.product?.positioning?.solution || ""}
                    onChange={(e) => updateNested("product.positioning.solution", e.target.value)}
                    placeholder="How does your product solve it?"
                    className="bg-zinc-950 border-zinc-700 text-white resize-none"
                    rows={2}
                    data-testid="positioning-solution"
                  />
                </FormField>
                <FormField label="Target Audience">
                  <Input
                    value={pkml.product?.positioning?.target_audience || ""}
                    onChange={(e) => updateNested("product.positioning.target_audience", e.target.value)}
                    placeholder="Who is this for?"
                    className="bg-zinc-950 border-zinc-700 text-white"
                    data-testid="positioning-audience"
                  />
                </FormField>
                <FormField label="Differentiators" hint="Comma-separated">
                  <Input
                    value={(pkml.product?.positioning?.differentiators || []).join(", ")}
                    onChange={(e) => updateNested("product.positioning.differentiators", e.target.value.split(",").map(d => d.trim()).filter(Boolean))}
                    placeholder="What makes you unique?"
                    className="bg-zinc-950 border-zinc-700 text-white"
                    data-testid="positioning-differentiators"
                  />
                </FormField>
              </div>
            </div>
          </FormSection>

          {/* Features Section */}
          <FormSection title="Features" icon={Layers}>
            <div className="space-y-3">
              {(pkml.features || []).map((feature, index) => (
                <FeatureEditor
                  key={index}
                  feature={feature}
                  index={index}
                  onUpdate={updateFeature}
                  onRemove={removeFeature}
                />
              ))}
              
              <Button 
                variant="outline" 
                onClick={addFeature}
                className="w-full border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
                data-testid="add-feature-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>
          </FormSection>

          {/* Tech Stack Section */}
          <FormSection title="Tech Stack" icon={Server}>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Frontend" hint="Comma-separated">
                <Input
                  value={(pkml.tech_stack?.frontend || []).join(", ")}
                  onChange={(e) => updateNested("tech_stack.frontend", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                  placeholder="React, TypeScript, Tailwind"
                  className="bg-zinc-950 border-zinc-700 text-white"
                  data-testid="tech-frontend"
                />
              </FormField>
              <FormField label="Backend" hint="Comma-separated">
                <Input
                  value={(pkml.tech_stack?.backend || []).join(", ")}
                  onChange={(e) => updateNested("tech_stack.backend", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                  placeholder="Node.js, Python, Go"
                  className="bg-zinc-950 border-zinc-700 text-white"
                  data-testid="tech-backend"
                />
              </FormField>
              <FormField label="Databases" hint="Comma-separated">
                <Input
                  value={(pkml.tech_stack?.databases || []).join(", ")}
                  onChange={(e) => updateNested("tech_stack.databases", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                  placeholder="PostgreSQL, Redis, MongoDB"
                  className="bg-zinc-950 border-zinc-700 text-white"
                  data-testid="tech-databases"
                />
              </FormField>
              <FormField label="Infrastructure" hint="Comma-separated">
                <Input
                  value={(pkml.tech_stack?.infrastructure || []).join(", ")}
                  onChange={(e) => updateNested("tech_stack.infrastructure", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                  placeholder="AWS, Vercel, Docker"
                  className="bg-zinc-950 border-zinc-700 text-white"
                  data-testid="tech-infrastructure"
                />
              </FormField>
            </div>
          </FormSection>

          {/* Bottom padding */}
          <div className="h-8" />
        </div>
      </ScrollArea>
    </div>
  );
};

export default BuilderPage;
