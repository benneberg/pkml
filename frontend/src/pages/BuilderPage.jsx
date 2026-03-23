import { useState, useEffect, useCallback } from “react”;
import { toast } from “sonner”;
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
Plug,
Layout,
GripVertical,
Sparkles,
AlertCircle,
ShieldAlert,
BookOpen,
GitBranch,
AlertTriangle,
ExternalLink,
} from “lucide-react”;
import { Button } from “../components/ui/button”;
import { Input } from “../components/ui/input”;
import { Textarea } from “../components/ui/textarea”;
import { Label } from “../components/ui/label”;
import { ScrollArea } from “../components/ui/scroll-area”;
import { Badge } from “../components/ui/badge”;
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from “../components/ui/select”;
import {
Collapsible,
CollapsibleContent,
CollapsibleTrigger,
} from “../components/ui/collapsible”;
import { DEFAULT_PKML } from “../lib/pkmlSchema”;

// ─── Section wrapper ────────────────────────────────────────────────────────
const FormSection = ({ title, icon: Icon, children, defaultOpen = false, badge }) => {
const [isOpen, setIsOpen] = useState(defaultOpen);

return (
<Collapsible open={isOpen} onOpenChange={setIsOpen}>
<CollapsibleTrigger asChild>
<button
className=“w-full flex items-center gap-3 p-4 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 rounded-lg transition-colors”
data-testid={`section-${title.toLowerCase().replace(/\s/g, "-")}`}
>
<Icon className="w-5 h-5 text-indigo-400 flex-shrink-0" />
<span className="flex-1 text-left font-medium text-white">{title}</span>
{badge !== undefined && (
<span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
{badge}
</span>
)}
{isOpen ? (
<ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
) : (
<ChevronRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
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

// ─── Form field wrapper ─────────────────────────────────────────────────────
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

// ─── Divider with label ─────────────────────────────────────────────────────
const SectionDivider = ({ label }) => (

  <div className="pt-4 border-t border-zinc-800">
    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">{label}</h4>
  </div>
);

// ─── Feature editor ─────────────────────────────────────────────────────────
const FeatureEditor = ({ feature, index, onUpdate, onRemove }) => {
const [isOpen, setIsOpen] = useState(index === 0);

const handleChange = (field, value) => onUpdate(index, { …feature, [field]: value });

return (
<Collapsible open={isOpen} onOpenChange={setIsOpen}>
<div className="border border-zinc-700 rounded-lg overflow-hidden">
<CollapsibleTrigger asChild>
<button
className=“w-full flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-800 transition-colors”
data-testid={`feature-${index}-trigger`}
>
<GripVertical className="w-4 h-4 text-zinc-600" />
<span className="flex-1 text-left text-sm font-medium text-white">
{feature.name || `Feature ${index + 1}`}
</span>
<span className={`text-xs px-2 py-0.5 rounded ${ feature.priority === "primary" ? "bg-indigo-500/20 text-indigo-400" : feature.priority === "secondary" ? "bg-purple-500/20 text-purple-400" : "bg-zinc-700 text-zinc-400" }`}>{feature.priority || “primary”}</span>
{isOpen ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
</button>
</CollapsibleTrigger>
<CollapsibleContent>
<div className="p-3 space-y-3 bg-zinc-900/50">
<div className="grid grid-cols-2 gap-3">
<FormField label="ID" required>
<Input value={feature.id || “”} onChange={(e) => handleChange(“id”, e.target.value)}
placeholder=“feat_my_feature” className=“bg-zinc-950 border-zinc-700 text-white font-mono text-sm”
data-testid={`feature-${index}-id`} />
</FormField>
<FormField label="Priority" required hint="p0=critical, p3=nice-to-have">
<Select value={feature.priority || “p1”} onValueChange={(v) => handleChange(“priority”, v)}>
<SelectTrigger className=“bg-zinc-950 border-zinc-700 text-white” data-testid={`feature-${index}-priority`}>
<SelectValue />
</SelectTrigger>
<SelectContent className="bg-zinc-900 border-zinc-700">
<SelectItem value="p0">p0 — Critical</SelectItem>
<SelectItem value="p1">p1 — High</SelectItem>
<SelectItem value="p2">p2 — Medium</SelectItem>
<SelectItem value="p3">p3 — Nice to have</SelectItem>
</SelectContent>
</Select>
</FormField>
</div>
<FormField label="Name" required>
<Input value={feature.name || “”} onChange={(e) => handleChange(“name”, e.target.value)}
placeholder=“Feature name” className=“bg-zinc-950 border-zinc-700 text-white”
data-testid={`feature-${index}-name`} />
</FormField>
<FormField label="Description" required>
<Textarea value={feature.description || “”} onChange={(e) => handleChange(“description”, e.target.value)}
placeholder=“What does this feature do?” className=“bg-zinc-950 border-zinc-700 text-white resize-none”
rows={2} data-testid={`feature-${index}-description`} />
</FormField>
<FormField label="User Benefit" required>
<Input value={feature.user_benefit || “”} onChange={(e) => handleChange(“user_benefit”, e.target.value)}
placeholder=“Why it matters to users” className=“bg-zinc-950 border-zinc-700 text-white”
data-testid={`feature-${index}-benefit`} />
</FormField>
<div className="grid grid-cols-2 gap-3">
<FormField label="Status">
<Select value={feature.status || “”} onValueChange={(v) => handleChange(“status”, v)}>
<SelectTrigger className="bg-zinc-950 border-zinc-700 text-white"><SelectValue placeholder="Select status" /></SelectTrigger>
<SelectContent className="bg-zinc-900 border-zinc-700">
<SelectItem value="planned">📋 Planned</SelectItem>
<SelectItem value="wip">🔧 In Progress</SelectItem>
<SelectItem value="live">✅ Live</SelectItem>
<SelectItem value="deprecated">❌ Deprecated</SelectItem>
</SelectContent>
</Select>
</FormField>
<FormField label="Introduced" hint="YYYY-MM-DD">
<Input value={feature.introduced || “”} onChange={(e) => handleChange(“introduced”, e.target.value)}
placeholder=“2024-01-15” className=“bg-zinc-950 border-zinc-700 text-white font-mono text-sm” />
</FormField>
</div>
<div className="grid grid-cols-2 gap-3">
<FormField label="Keywords" hint="Comma-separated">
<Input
value={(feature.keywords || []).join(”, “)}
onChange={(e) => handleChange(“keywords”, e.target.value.split(”,”).map((k) => k.trim()).filter(Boolean))}
placeholder=“keyword1, keyword2” className=“bg-zinc-950 border-zinc-700 text-white”
data-testid={`feature-${index}-keywords`} />
</FormField>
<FormField label="Technical Details">
<Input value={feature.technical_details || “”} onChange={(e) => handleChange(“technical_details”, e.target.value)}
placeholder=“Implementation notes” className=“bg-zinc-950 border-zinc-700 text-white” />
</FormField>
</div>
<div className="flex justify-end pt-1">
<Button variant=“destructive” size=“sm” onClick={() => onRemove(index)}
data-testid={`feature-${index}-remove`}>
<Trash2 className="w-4 h-4 mr-1" /> Remove
</Button>
</div>
</div>
</CollapsibleContent>
</div>
</Collapsible>
);
};

// ─── Workflow step editor ───────────────────────────────────────────────────
const WorkflowStepEditor = ({ step, index, onChange, onRemove }) => (

  <div className="border border-zinc-700/50 rounded-md p-3 space-y-2 bg-zinc-900/30">
    <div className="flex items-center gap-2">
      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
        {index + 1}
      </span>
      <Input
        value={step.action || ""}
        onChange={(e) => onChange(index, { ...step, action: e.target.value })}
        placeholder="Action to perform"
        className="bg-zinc-950 border-zinc-700 text-white text-sm"
      />
      <button onClick={() => onRemove(index)} className="text-zinc-600 hover:text-red-400 transition-colors flex-shrink-0">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
    <div className="grid grid-cols-2 gap-2 pl-8">
      <Input
        value={step.expected_outcome || ""}
        onChange={(e) => onChange(index, { ...step, expected_outcome: e.target.value })}
        placeholder="Expected outcome"
        className="bg-zinc-950 border-zinc-700 text-white text-xs"
      />
      <Input
        value={(step.tips || []).join(", ")}
        onChange={(e) => onChange(index, { ...step, tips: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
        placeholder="Tips (comma-separated)"
        className="bg-zinc-950 border-zinc-700 text-white text-xs"
      />
    </div>
  </div>
);

// ─── Workflow editor ────────────────────────────────────────────────────────
const WorkflowEditor = ({ workflow, index, onUpdate, onRemove }) => {
const [isOpen, setIsOpen] = useState(index === 0);

const handleChange = (field, value) => onUpdate(index, { …workflow, [field]: value });

const addStep = () => {
const steps = workflow.steps || [];
handleChange(“steps”, […steps, { order: steps.length + 1, action: “”, expected_outcome: “” }]);
};

const updateStep = (si, step) => {
const steps = […(workflow.steps || [])];
steps[si] = { …step, order: si + 1 };
handleChange(“steps”, steps);
};

const removeStep = (si) => {
const steps = […(workflow.steps || [])];
steps.splice(si, 1);
handleChange(“steps”, steps.map((s, i) => ({ …s, order: i + 1 })));
};

return (
<Collapsible open={isOpen} onOpenChange={setIsOpen}>
<div className="border border-zinc-700 rounded-lg overflow-hidden">
<CollapsibleTrigger asChild>
<button className="w-full flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
<GripVertical className="w-4 h-4 text-zinc-600" />
<span className="flex-1 text-left text-sm font-medium text-white">
{workflow.name || `Workflow ${index + 1}`}
</span>
<span className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-400">
{(workflow.steps || []).length} steps
</span>
<span className={`text-xs px-2 py-0.5 rounded ${ workflow.difficulty === "beginner" ? "bg-green-500/20 text-green-400" : workflow.difficulty === "advanced" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400" }`}>{workflow.difficulty || “beginner”}</span>
{isOpen ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
</button>
</CollapsibleTrigger>
<CollapsibleContent>
<div className="p-3 space-y-3 bg-zinc-900/50">
<div className="grid grid-cols-3 gap-3">
<FormField label="ID" required>
<Input value={workflow.id || “”} onChange={(e) => handleChange(“id”, e.target.value)}
placeholder=“workflow_onboarding” className=“bg-zinc-950 border-zinc-700 text-white font-mono text-sm” />
</FormField>
<FormField label="Difficulty" required>
<Select value={workflow.difficulty || “beginner”} onValueChange={(v) => handleChange(“difficulty”, v)}>
<SelectTrigger className="bg-zinc-950 border-zinc-700 text-white">
<SelectValue />
</SelectTrigger>
<SelectContent className="bg-zinc-900 border-zinc-700">
<SelectItem value="beginner">Beginner</SelectItem>
<SelectItem value="intermediate">Intermediate</SelectItem>
<SelectItem value="advanced">Advanced</SelectItem>
</SelectContent>
</Select>
</FormField>
<FormField label="Estimated Time">
<Input value={workflow.estimated_time || “”} onChange={(e) => handleChange(“estimated_time”, e.target.value)}
placeholder=“5 minutes” className=“bg-zinc-950 border-zinc-700 text-white” />
</FormField>
</div>
<FormField label="Name" required>
<Input value={workflow.name || “”} onChange={(e) => handleChange(“name”, e.target.value)}
placeholder=“Create Your First Task” className=“bg-zinc-950 border-zinc-700 text-white” />
</FormField>
<FormField label="Description" required>
<Textarea value={workflow.description || “”} onChange={(e) => handleChange(“description”, e.target.value)}
placeholder=“What this workflow accomplishes” className=“bg-zinc-950 border-zinc-700 text-white resize-none”
rows={2} />
</FormField>
<FormField label="Outcome" required hint="What the user achieves at the end">
<Input value={workflow.outcome || “”} onChange={(e) => handleChange(“outcome”, e.target.value)}
placeholder=“User has successfully created and assigned a task”
className=“bg-zinc-950 border-zinc-700 text-white” />
</FormField>

```
        {/* Steps */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Steps</span>
            <Button variant="ghost" size="sm" onClick={addStep} className="text-xs h-7 gap-1">
              <Plus className="w-3 h-3" /> Add Step
            </Button>
          </div>
          <div className="space-y-2">
            {(workflow.steps || []).map((step, si) => (
              <WorkflowStepEditor key={si} step={step} index={si}
                onChange={updateStep} onRemove={removeStep} />
            ))}
            {(workflow.steps || []).length === 0 && (
              <div className="text-xs text-zinc-600 text-center py-4 border border-dashed border-zinc-700 rounded-md">
                No steps yet — click Add Step
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button variant="destructive" size="sm" onClick={() => onRemove(index)}>
            <Trash2 className="w-4 h-4 mr-1" /> Remove Workflow
          </Button>
        </div>
      </div>
    </CollapsibleContent>
  </div>
</Collapsible>
```

);
};

// ─── Integration editor ─────────────────────────────────────────────────────
const IntegrationEditor = ({ integration, index, onUpdate, onRemove }) => {
const handleChange = (field, value) => onUpdate(index, { …integration, [field]: value });

return (
<div className="border border-zinc-700 rounded-lg p-3 space-y-3 bg-zinc-900/30">
<div className="flex items-center justify-between">
<span className="text-xs font-mono text-zinc-500">integration_{index + 1}</span>
<button onClick={() => onRemove(index)} className=“text-zinc-600 hover:text-red-400 transition-colors”>
<Trash2 className="w-4 h-4" />
</button>
</div>
<div className="grid grid-cols-3 gap-3">
<FormField label="ID" required>
<Input value={integration.id || “”} onChange={(e) => handleChange(“id”, e.target.value)}
placeholder=“int_github” className=“bg-zinc-950 border-zinc-700 text-white font-mono text-sm” />
</FormField>
<FormField label="Name" required>
<Input value={integration.name || “”} onChange={(e) => handleChange(“name”, e.target.value)}
placeholder=“GitHub” className=“bg-zinc-950 border-zinc-700 text-white” />
</FormField>
<FormField label="Category" required>
<Input value={integration.category || “”} onChange={(e) => handleChange(“category”, e.target.value)}
placeholder=“version-control” className=“bg-zinc-950 border-zinc-700 text-white” />
</FormField>
</div>
<FormField label="Description">
<Input value={integration.description || “”} onChange={(e) => handleChange(“description”, e.target.value)}
placeholder=“What this integration enables” className=“bg-zinc-950 border-zinc-700 text-white” />
</FormField>
<div className="flex items-center gap-3">
<label className="flex items-center gap-2 cursor-pointer">
<input type=“checkbox” checked={!!integration.required}
onChange={(e) => handleChange(“required”, e.target.checked)}
className=“accent-indigo-500” />
<span className="text-sm text-zinc-300">Required integration</span>
</label>
</div>
</div>
);
};

// ─── Color swatch input ─────────────────────────────────────────────────────
const ColorArrayInput = ({ label, value = [], onChange, hint }) => {
const rawValue = Array.isArray(value) ? value.join(”, “) : value;
return (
<FormField label={label} hint={hint}>
<div className="flex gap-2 items-center">
<Input
value={rawValue}
onChange={(e) => onChange(e.target.value.split(”,”).map((c) => c.trim()).filter(Boolean))}
placeholder=”#6366f1, #4f46e5”
className=“bg-zinc-950 border-zinc-700 text-white font-mono text-sm”
/>
<div className="flex gap-1 flex-shrink-0">
{(Array.isArray(value) ? value : []).slice(0, 4).map((c, i) => (
<div key={i} style={{ background: c }} className=“w-6 h-6 rounded border border-zinc-700” title={c} />
))}
</div>
</div>
</FormField>
);
};

// ─── Main Builder Page ──────────────────────────────────────────────────────
export const BuilderPage = ({ content, onContentChange }) => {
const [pkml, setPkml] = useState(() => {
try { return content ? JSON.parse(content) : { …DEFAULT_PKML }; }
catch { return { …DEFAULT_PKML }; }
});

// Sync content → pkml state (when editor changes)
useEffect(() => {
try {
if (content) {
const parsed = JSON.parse(content);
setPkml(parsed);
}
} catch { /* keep current state */ }
}, [content]);

const updatePkml = useCallback((updates) => {
const newPkml = { …pkml, …updates };
newPkml.meta = { …newPkml.meta, last_updated: new Date().toISOString() };
setPkml(newPkml);
onContentChange(JSON.stringify(newPkml, null, 2));
}, [pkml, onContentChange]);

const updateNested = (path, value) => {
const parts = path.split(”.”);
const newPkml = JSON.parse(JSON.stringify(pkml)); // deep clone
let current = newPkml;
for (let i = 0; i < parts.length - 1; i++) {
if (!current[parts[i]]) current[parts[i]] = {};
current = current[parts[i]];
}
current[parts[parts.length - 1]] = value;
newPkml.meta = { …newPkml.meta, last_updated: new Date().toISOString() };
setPkml(newPkml);
onContentChange(JSON.stringify(newPkml, null, 2));
};

// ── Features ──────────────────────────────────────────────────────────────
const addFeature = () => {
const features = pkml.features || [];
updatePkml({ features: […features, { id: `feat_${features.length + 1}`, name: “”, description: “”, user_benefit: “”, priority: “p1”, status: “planned” }] });
};
const updateFeature = (i, f) => { const a = […(pkml.features || [])]; a[i] = f; updatePkml({ features: a }); };
const removeFeature = (i) => { const a = […(pkml.features || [])]; a.splice(i, 1); updatePkml({ features: a }); toast.success(“Feature removed”); };

// ── Workflows ─────────────────────────────────────────────────────────────
const addWorkflow = () => {
const workflows = pkml.workflows || [];
updatePkml({ workflows: […workflows, { id: `workflow_${workflows.length + 1}`, name: “”, description: “”, difficulty: “beginner”, steps: [], outcome: “” }] });
};
const updateWorkflow = (i, w) => { const a = […(pkml.workflows || [])]; a[i] = w; updatePkml({ workflows: a }); };
const removeWorkflow = (i) => { const a = […(pkml.workflows || [])]; a.splice(i, 1); updatePkml({ workflows: a }); toast.success(“Workflow removed”); };

// ── Integrations ──────────────────────────────────────────────────────────
const addIntegration = () => {
const integrations = pkml.integrations || [];
updatePkml({ integrations: […integrations, { id: “”, name: “”, category: “”, description: “”, required: false }] });
};
const updateIntegration = (i, v) => { const a = […(pkml.integrations || [])]; a[i] = v; updatePkml({ integrations: a }); };
const removeIntegration = (i) => { const a = […(pkml.integrations || [])]; a.splice(i, 1); updatePkml({ integrations: a }); toast.success(“Integration removed”); };

const handleSave = () => {
onContentChange(JSON.stringify(pkml, null, 2));
toast.success(“Changes saved to editor!”);
};

const completenessHints = [];
if (!pkml.product?.positioning?.problem) completenessHints.push(“Add problem statement”);
if (!pkml.features?.length) completenessHints.push(“Add at least one feature”);
if (!pkml.workflows?.length) completenessHints.push(“Add a workflow”);
const hasTechStack = Array.isArray(pkml.tech_stack)
? pkml.tech_stack.length > 0
: (pkml.tech_stack?.frontend?.length || pkml.tech_stack?.backend?.length);
if (!hasTechStack) completenessHints.push(“Add tech stack”);

return (
<div className="h-[calc(100vh-4rem)] flex flex-col" data-testid="builder-page">
{/* Toolbar */}
<div className="toolbar flex items-center gap-3">
<div className="flex items-center gap-2 text-sm text-zinc-400">
<FileJson className="w-4 h-4 text-indigo-400" />
<span>Visual PKML Builder</span>
</div>
{completenessHints.length > 0 && (
<div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/5 border border-yellow-500/20 rounded-md">
<AlertCircle className="w-3 h-3 text-yellow-500" />
<span className="text-xs text-yellow-400">{completenessHints[0]}</span>
</div>
)}
<div className="flex-1" />
<Button onClick={handleSave} className="gap-2 bg-indigo-600 hover:bg-indigo-700" data-testid="save-builder-btn">
<Save className="w-4 h-4" /> Save to Editor
</Button>
</div>

```
  {/* Form Content */}
  <ScrollArea className="flex-1">
    <div className="max-w-3xl mx-auto p-6 space-y-4">

      {/* ── Meta ─────────────────────────────────────────────────────── */}
      <FormSection title="Meta Information" icon={FileJson} defaultOpen>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Document Version" required>
            <Input value={pkml.meta?.version || "1.0.0"} onChange={(e) => updateNested("meta.version", e.target.value)}
              placeholder="1.0.0" className="bg-zinc-950 border-zinc-700 text-white font-mono" data-testid="meta-version" />
          </FormField>
          <FormField label="PKML Version" required>
            <Input value={pkml.meta?.pkml_version || "0.2"} onChange={(e) => updateNested("meta.pkml_version", e.target.value)}
              placeholder="0.2" className="bg-zinc-950 border-zinc-700 text-white font-mono" data-testid="meta-pkml-version" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Author">
            <Input value={pkml.meta?.author || ""} onChange={(e) => updateNested("meta.author", e.target.value)}
              placeholder="Your name or team" className="bg-zinc-950 border-zinc-700 text-white" data-testid="meta-author" />
          </FormField>
          <FormField label="License">
            <Input value={pkml.meta?.license || ""} onChange={(e) => updateNested("meta.license", e.target.value)}
              placeholder="MIT or CC-BY-4.0" className="bg-zinc-950 border-zinc-700 text-white" data-testid="meta-license" />
          </FormField>
        </div>
      </FormSection>

      {/* ── Product ──────────────────────────────────────────────────── */}
      <FormSection title="Product Information" icon={Package} defaultOpen>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Product Name" required>
            <Input value={pkml.product?.name || ""} onChange={(e) => updateNested("product.name", e.target.value)}
              placeholder="My Product" className="bg-zinc-950 border-zinc-700 text-white" data-testid="product-name" />
          </FormField>
          <FormField label="Categories" hint="Comma-separated">
            <Input
              value={(pkml.product?.category || []).join(", ")}
              onChange={(e) => updateNested("product.category", e.target.value.split(",").map((c) => c.trim()).filter(Boolean))}
              placeholder="productivity, developer-tools" className="bg-zinc-950 border-zinc-700 text-white" data-testid="product-categories" />
          </FormField>
        </div>
        <FormField label="Tagline" required hint="One sentence description">
          <Input value={pkml.product?.tagline || ""} onChange={(e) => updateNested("product.tagline", e.target.value)}
            placeholder="Your product in one sentence" className="bg-zinc-950 border-zinc-700 text-white" data-testid="product-tagline" />
        </FormField>
        <FormField label="Description" hint="2-3 sentences">
          <Textarea value={pkml.product?.description || ""} onChange={(e) => updateNested("product.description", e.target.value)}
            placeholder="A longer description..." className="bg-zinc-950 border-zinc-700 text-white resize-none" rows={3} data-testid="product-description" />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Website">
            <Input value={pkml.product?.website || ""} onChange={(e) => updateNested("product.website", e.target.value)}
              placeholder="https://myproduct.com" className="bg-zinc-950 border-zinc-700 text-white" data-testid="product-website" />
          </FormField>
          <FormField label="Repository">
            <Input value={pkml.product?.repository || ""} onChange={(e) => updateNested("product.repository", e.target.value)}
              placeholder="https://github.com/..." className="bg-zinc-950 border-zinc-700 text-white" data-testid="product-repository" />
          </FormField>
        </div>
        <SectionDivider label="Positioning" />
        <FormField label="Problem">
          <Textarea value={pkml.product?.positioning?.problem || ""} onChange={(e) => updateNested("product.positioning.problem", e.target.value)}
            placeholder="What problem does your product solve?" className="bg-zinc-950 border-zinc-700 text-white resize-none" rows={2} data-testid="positioning-problem" />
        </FormField>
        <FormField label="Solution">
          <Textarea value={pkml.product?.positioning?.solution || ""} onChange={(e) => updateNested("product.positioning.solution", e.target.value)}
            placeholder="How does your product solve it?" className="bg-zinc-950 border-zinc-700 text-white resize-none" rows={2} data-testid="positioning-solution" />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Target Audience">
            <Input value={pkml.product?.positioning?.target_audience || ""} onChange={(e) => updateNested("product.positioning.target_audience", e.target.value)}
              placeholder="Who is this for?" className="bg-zinc-950 border-zinc-700 text-white" data-testid="positioning-audience" />
          </FormField>
          <FormField label="Competitive Advantage">
            <Input value={pkml.product?.positioning?.competitive_advantage || ""} onChange={(e) => updateNested("product.positioning.competitive_advantage", e.target.value)}
              placeholder="Your key edge" className="bg-zinc-950 border-zinc-700 text-white" />
          </FormField>
        </div>
        <FormField label="Differentiators" hint="Comma-separated">
          <Input
            value={(pkml.product?.positioning?.differentiators || []).join(", ")}
            onChange={(e) => updateNested("product.positioning.differentiators", e.target.value.split(",").map((d) => d.trim()).filter(Boolean))}
            placeholder="Real-time sync, Zero config, Open source" className="bg-zinc-950 border-zinc-700 text-white" data-testid="positioning-differentiators" />
        </FormField>
      </FormSection>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <FormSection title="Features" icon={Layers} badge={(pkml.features || []).length}>
        <div className="space-y-3">
          {(pkml.features || []).map((feature, index) => (
            <FeatureEditor key={index} feature={feature} index={index} onUpdate={updateFeature} onRemove={removeFeature} />
          ))}
          <Button variant="outline" onClick={addFeature}
            className="w-full border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
            data-testid="add-feature-btn">
            <Plus className="w-4 h-4 mr-2" /> Add Feature
          </Button>
        </div>
      </FormSection>

      {/* ── Workflows ────────────────────────────────────────────────── */}
      <FormSection title="Workflows" icon={Workflow} badge={(pkml.workflows || []).length}>
        <p className="text-xs text-zinc-500 -mt-1">
          Step-by-step sequences showing how users accomplish key tasks. Powers the interactive demo generator.
        </p>
        <div className="space-y-3">
          {(pkml.workflows || []).map((workflow, index) => (
            <WorkflowEditor key={index} workflow={workflow} index={index} onUpdate={updateWorkflow} onRemove={removeWorkflow} />
          ))}
          <Button variant="outline" onClick={addWorkflow}
            className="w-full border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
            data-testid="add-workflow-btn">
            <Plus className="w-4 h-4 mr-2" /> Add Workflow
          </Button>
        </div>
      </FormSection>

      {/* ── Tech Stack ───────────────────────────────────────────────── */}
      <FormSection title="Tech Stack" icon={Server}>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "frontend", placeholder: "React, TypeScript, Tailwind", testId: "tech-frontend" },
            { key: "backend", placeholder: "Node.js, Python, Go", testId: "tech-backend" },
            { key: "databases", placeholder: "PostgreSQL, Redis, MongoDB", testId: "tech-databases" },
            { key: "infrastructure", placeholder: "AWS, Vercel, Docker", testId: "tech-infrastructure" },
            { key: "monitoring", placeholder: "Sentry, Grafana, DataDog" },
            { key: "testing", placeholder: "Jest, Playwright, pytest" },
          ].map(({ key, placeholder, testId }) => (
            <FormField key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} hint="Comma-separated">
              <Input
                value={(pkml.tech_stack?.[key] || []).join(", ")}
                onChange={(e) => updateNested(`tech_stack.${key}`, e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                placeholder={placeholder} className="bg-zinc-950 border-zinc-700 text-white"
                data-testid={testId} />
            </FormField>
          ))}
        </div>
      </FormSection>

      {/* ── Integrations ─────────────────────────────────────────────── */}
      <FormSection title="Integrations" icon={Plug} badge={(pkml.integrations || []).length}>
        <p className="text-xs text-zinc-500 -mt-1">Third-party services and tools your product connects with.</p>
        <div className="space-y-3">
          {(pkml.integrations || []).map((integration, index) => (
            <IntegrationEditor key={index} integration={integration} index={index}
              onUpdate={updateIntegration} onRemove={removeIntegration} />
          ))}
          <Button variant="outline" onClick={addIntegration}
            className="w-full border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
            data-testid="add-integration-btn">
            <Plus className="w-4 h-4 mr-2" /> Add Integration
          </Button>
        </div>
      </FormSection>

      {/* ── Brand ────────────────────────────────────────────────────── */}
      <FormSection title="Brand & Voice" icon={Palette}>
        <SectionDivider label="Visual Identity" />
        <div className="space-y-4">
          <ColorArrayInput
            label="Primary Colors"
            value={pkml.brand?.visual?.colors?.primary || []}
            onChange={(v) => updateNested("brand.visual.colors.primary", v)}
            hint="Hex codes, comma-separated"
          />
          <ColorArrayInput
            label="Secondary Colors"
            value={pkml.brand?.visual?.colors?.secondary || []}
            onChange={(v) => updateNested("brand.visual.colors.secondary", v)}
          />
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Semantic: Success">
              <Input value={pkml.brand?.visual?.colors?.semantic?.success || ""}
                onChange={(e) => updateNested("brand.visual.colors.semantic.success", e.target.value)}
                placeholder="#22c55e" className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm" />
            </FormField>
            <FormField label="Semantic: Warning">
              <Input value={pkml.brand?.visual?.colors?.semantic?.warning || ""}
                onChange={(e) => updateNested("brand.visual.colors.semantic.warning", e.target.value)}
                placeholder="#f59e0b" className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm" />
            </FormField>
            <FormField label="Semantic: Error">
              <Input value={pkml.brand?.visual?.colors?.semantic?.error || ""}
                onChange={(e) => updateNested("brand.visual.colors.semantic.error", e.target.value)}
                placeholder="#ef4444" className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Heading Font">
              <Input value={pkml.brand?.visual?.typography?.headings || ""}
                onChange={(e) => updateNested("brand.visual.typography.headings", e.target.value)}
                placeholder="Inter, Poppins, Sora..." className="bg-zinc-950 border-zinc-700 text-white" />
            </FormField>
            <FormField label="Body Font">
              <Input value={pkml.brand?.visual?.typography?.body || ""}
                onChange={(e) => updateNested("brand.visual.typography.body", e.target.value)}
                placeholder="Inter, Roboto, DM Sans..." className="bg-zinc-950 border-zinc-700 text-white" />
            </FormField>
          </div>
        </div>

        <SectionDivider label="Brand Voice" />
        <div className="space-y-4">
          <FormField label="Tone" hint="Comma-separated descriptors">
            <Input
              value={(pkml.brand?.voice?.tone || []).join(", ")}
              onChange={(e) => updateNested("brand.voice.tone", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
              placeholder="professional, approachable, concise"
              className="bg-zinc-950 border-zinc-700 text-white" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Preferred Vocabulary" hint="Words to use">
              <Textarea
                value={(pkml.brand?.voice?.vocabulary?.preferred || []).join(", ")}
                onChange={(e) => updateNested("brand.voice.vocabulary.preferred", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                placeholder="workspace, collaborate, ship"
                className="bg-zinc-950 border-zinc-700 text-white resize-none" rows={2} />
            </FormField>
            <FormField label="Avoid" hint="Words to never use">
              <Textarea
                value={(pkml.brand?.voice?.vocabulary?.avoid || []).join(", ")}
                onChange={(e) => updateNested("brand.voice.vocabulary.avoid", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                placeholder="synergy, leverage, utilize"
                className="bg-zinc-950 border-zinc-700 text-white resize-none" rows={2} />
            </FormField>
          </div>
        </div>
      </FormSection>

      {/* ── Engineering ─────────────────────────────────────────────── */}
      <FormSection title="Architecture — Repositories" icon={GitBranch}
        badge={(pkml.engineering?.architecture?.repositories || []).length}>
        <p className="text-xs text-zinc-500 mb-3">
          Map your repositories and their roles. Developers edit this section directly in the JSON or their repo —
          use this form to bootstrap the structure.
        </p>
        <div className="space-y-3">
          {(pkml.engineering?.architecture?.repositories || []).map((repo, i) => (
            <div key={i} className="border border-zinc-700 rounded-lg p-3 space-y-3 bg-zinc-900/50">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="ID" hint="kebab-case">
                  <Input value={repo.id || ""}
                    onChange={(e) => { const a = [...(pkml.engineering?.architecture?.repositories || [])]; a[i] = {...repo, id: e.target.value}; updateNested("engineering.architecture.repositories", a); }}
                    placeholder="invoicing-service" className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm" />
                </FormField>
                <FormField label="Name">
                  <Input value={repo.name || ""}
                    onChange={(e) => { const a = [...(pkml.engineering?.architecture?.repositories || [])]; a[i] = {...repo, name: e.target.value}; updateNested("engineering.architecture.repositories", a); }}
                    placeholder="Invoicing Service" className="bg-zinc-950 border-zinc-700 text-white" />
                </FormField>
              </div>
              <FormField label="Role" hint="What is this repo responsible for?">
                <Input value={repo.role || ""}
                  onChange={(e) => { const a = [...(pkml.engineering?.architecture?.repositories || [])]; a[i] = {...repo, role: e.target.value}; updateNested("engineering.architecture.repositories", a); }}
                  placeholder="Primary business logic for invoice generation" className="bg-zinc-950 border-zinc-700 text-white" />
              </FormField>
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Language">
                  <Input value={repo.language || ""}
                    onChange={(e) => { const a = [...(pkml.engineering?.architecture?.repositories || [])]; a[i] = {...repo, language: e.target.value}; updateNested("engineering.architecture.repositories", a); }}
                    placeholder="Python" className="bg-zinc-950 border-zinc-700 text-white" />
                </FormField>
                <FormField label="Framework">
                  <Input value={repo.framework || ""}
                    onChange={(e) => { const a = [...(pkml.engineering?.architecture?.repositories || [])]; a[i] = {...repo, framework: e.target.value}; updateNested("engineering.architecture.repositories", a); }}
                    placeholder="Django" className="bg-zinc-950 border-zinc-700 text-white" />
                </FormField>
                <FormField label="Owner">
                  <Input value={repo.ownership?.primary_contact || ""}
                    onChange={(e) => { const a = [...(pkml.engineering?.architecture?.repositories || [])]; a[i] = {...repo, ownership: {...(repo.ownership||{}), primary_contact: e.target.value}}; updateNested("engineering.architecture.repositories", a); }}
                    placeholder="@username" className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm" />
                </FormField>
              </div>
              <div className="flex justify-end">
                <Button variant="destructive" size="sm"
                  onClick={() => { const a = [...(pkml.engineering?.architecture?.repositories || [])]; a.splice(i,1); updateNested("engineering.architecture.repositories", a); }}>
                  <Trash2 className="w-4 h-4 mr-1" /> Remove
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => {
            const a = [...(pkml.engineering?.architecture?.repositories || [])];
            a.push({ id: "", name: "", role: "", language: "", framework: "", ownership: { primary_contact: "" } });
            updateNested("engineering.architecture.repositories", a);
          }} className="gap-2 w-full">
            <Plus className="w-4 h-4" /> Add Repository
          </Button>
        </div>
      </FormSection>

      <FormSection title="Constraints" icon={ShieldAlert}
        badge={(pkml.engineering?.constraints || []).length}>
        <p className="text-xs text-zinc-500 mb-3">
          Rules that must not be violated — library restrictions, architecture rules, performance requirements.
          These are the most valuable entries for LLMs working on your codebase.
        </p>
        <div className="space-y-3">
          {(pkml.engineering?.constraints || []).map((c, i) => (
            <div key={i} className="border border-zinc-700 rounded-lg p-3 space-y-3 bg-zinc-900/50">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="ID" hint="snake_case">
                  <Input value={c.id || ""}
                    onChange={(e) => { const a = [...(pkml.engineering?.constraints||[])]; a[i]={...c,id:e.target.value}; updateNested("engineering.constraints",a); }}
                    placeholder="no_pdfkit" className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm" />
                </FormField>
                <FormField label="Severity">
                  <Select value={c.severity || "medium"} onValueChange={(v) => { const a=[...(pkml.engineering?.constraints||[])]; a[i]={...c,severity:v}; updateNested("engineering.constraints",a); }}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="critical">🔴 Critical</SelectItem>
                      <SelectItem value="high">🟠 High</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="low">🟢 Low</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <FormField label="Context" hint="Where does this apply?">
                <Input value={c.context || ""}
                  onChange={(e) => { const a=[...(pkml.engineering?.constraints||[])]; a[i]={...c,context:e.target.value}; updateNested("engineering.constraints",a); }}
                  placeholder="PDF generation, API endpoints, authentication..." className="bg-zinc-950 border-zinc-700 text-white" />
              </FormField>
              <FormField label="Rule" hint="State clearly what must / must not be done">
                <Input value={c.rule || ""}
                  onChange={(e) => { const a=[...(pkml.engineering?.constraints||[])]; a[i]={...c,rule:e.target.value}; updateNested("engineering.constraints",a); }}
                  placeholder="Do not use pdfkit for PDF generation" className="bg-zinc-950 border-zinc-700 text-white" />
              </FormField>
              <FormField label="Reason" hint="Why? What happened if you don't say?">
                <Textarea value={c.reason || ""}
                  onChange={(e) => { const a=[...(pkml.engineering?.constraints||[])]; a[i]={...c,reason:e.target.value}; updateNested("engineering.constraints",a); }}
                  placeholder="pdfkit has memory leaks that cause OOM errors in large batches. Led to outage INC-2847."
                  className="bg-zinc-950 border-zinc-700 text-white resize-none" rows={2} />
              </FormField>
              <div className="flex justify-end">
                <Button variant="destructive" size="sm"
                  onClick={() => { const a=[...(pkml.engineering?.constraints||[])]; a.splice(i,1); updateNested("engineering.constraints",a); }}>
                  <Trash2 className="w-4 h-4 mr-1" /> Remove
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => {
            const a = [...(pkml.engineering?.constraints||[])];
            a.push({ id: "", context: "", rule: "", reason: "", severity: "medium" });
            updateNested("engineering.constraints", a);
          }} className="gap-2 w-full">
            <Plus className="w-4 h-4" /> Add Constraint
          </Button>
        </div>
      </FormSection>

      <FormSection title="Lessons Learned" icon={BookOpen}
        badge={(pkml.engineering?.lessons_learned || []).length}>
        <p className="text-xs text-zinc-500 mb-3">
          Historical failures and what was learned. Never-forget entries are surfaced prominently
          so LLMs never repeat the same mistakes.
        </p>
        <div className="space-y-3">
          {(pkml.engineering?.lessons_learned || []).map((l, i) => (
            <div key={i} className={`border rounded-lg p-3 space-y-3 ${l.never_forget ? "border-amber-500/40 bg-amber-500/5" : "border-zinc-700 bg-zinc-900/50"}`}>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="ID" hint="snake_case">
                  <Input value={l.id || ""}
                    onChange={(e) => { const a=[...(pkml.engineering?.lessons_learned||[])]; a[i]={...l,id:e.target.value}; updateNested("engineering.lessons_learned",a); }}
                    placeholder="sync_export_timeout" className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm" />
                </FormField>
                <FormField label="Date">
                  <Input value={l.date || ""}
                    onChange={(e) => { const a=[...(pkml.engineering?.lessons_learned||[])]; a[i]={...l,date:e.target.value}; updateNested("engineering.lessons_learned",a); }}
                    placeholder="2024-03-15" className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm" />
                </FormField>
              </div>
              <FormField label="What happened">
                <Textarea value={l.what_happened || ""}
                  onChange={(e) => { const a=[...(pkml.engineering?.lessons_learned||[])]; a[i]={...l,what_happened:e.target.value}; updateNested("engineering.lessons_learned",a); }}
                  placeholder="Sync PDF export caused API timeouts for batches >100 invoices."
                  className="bg-zinc-950 border-zinc-700 text-white resize-none" rows={2} />
              </FormField>
              <FormField label="Correct approach" hint="Most important field — what should be done instead?">
                <Textarea value={l.correct_approach || ""}
                  onChange={(e) => { const a=[...(pkml.engineering?.lessons_learned||[])]; a[i]={...l,correct_approach:e.target.value}; updateNested("engineering.lessons_learned",a); }}
                  placeholder="Use async background job. User starts export, downloads when complete."
                  className="bg-zinc-950 border-zinc-700 text-white resize-none" rows={2} />
              </FormField>
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!l.never_forget}
                    onChange={(e) => { const a=[...(pkml.engineering?.lessons_learned||[])]; a[i]={...l,never_forget:e.target.checked}; updateNested("engineering.lessons_learned",a); }}
                    className="w-4 h-4 accent-amber-500" />
                  <span className="text-xs text-amber-400 font-medium">⚠ Never forget — always surface to LLMs</span>
                </label>
                <Button variant="destructive" size="sm"
                  onClick={() => { const a=[...(pkml.engineering?.lessons_learned||[])]; a.splice(i,1); updateNested("engineering.lessons_learned",a); }}>
                  <Trash2 className="w-4 h-4 mr-1" /> Remove
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => {
            const a = [...(pkml.engineering?.lessons_learned||[])];
            a.push({ id: "", what_happened: "", correct_approach: "", never_forget: false });
            updateNested("engineering.lessons_learned", a);
          }} className="gap-2 w-full">
            <Plus className="w-4 h-4" /> Add Lesson Learned
          </Button>
        </div>
      </FormSection>

      {/* ── Engineering: Architecture ────────────────────────────── */}
      <FormSection title="Architecture — Repositories" icon={GitBranch}
        badge={(pkml.engineering?.architecture?.repositories || []).length}>
        <p className="text-xs text-zinc-500 mb-3">
          Map your repositories and their roles. Use this to bootstrap the structure —
          developers continue refining it directly in JSON.
        </p>
        <div className="space-y-3">
          {(pkml.engineering?.architecture?.repositories || []).map((repo, i) => (
            <div key={i} className="border border-zinc-700 rounded-lg p-3 space-y-3 bg-zinc-900/50">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="ID" hint="kebab-case">
                  <Input value={repo.id || ""}
                    onChange={(e) => { const a=[...(pkml.engineering?.architecture?.repositories||[])]; a[i]={...repo,id:e.target.value}; updateNested("engineering.architecture.repositories",a); }}
                    placeholder="invoicing-service" className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm" />
                </FormField>
                <FormField label="Name">
                  <Input value={repo.name || ""}
                    onChange={(e) => { const a=[...(pkml.engineering?.architecture?.repositories||[])]; a[i]={...repo,name:e.target.value}; updateNested("engineering.architecture.repositories",a); }}
                    placeholder="Invoicing Service" className="bg-zinc-950 border-zinc-700 text-white" />
                </FormField>
              </div>
              <FormField label="Role" hint="What is this repo responsible for?">
                <Input value={repo.role || ""}
                  onChange={(e) => { const a=[...(pkml.engineering?.architecture?.repositories||[])]; a[i]={...repo,role:e.target.value}; updateNested("engineering.architecture.repositories",a); }}
                  placeholder="Primary business logic for invoice generation" className="bg-zinc-950 border-zinc-700 text-white" />
              </FormField>
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Language">
                  <Input value={repo.language || ""}
                    onChange={(e) => { const a=[...(pkml.engineering?.architecture?.repositories||[])]; a[i]={...repo,language:e.target.value}; updateNested("engineering.architecture.repositories",a); }}
                    placeholder="Python" className="bg-zinc-950 border-zinc-700 text-white" />
                </FormField>
                <FormField label="Framework">
                  <Input value={repo.framework || ""}
                    onChange={(e) => { const a=[...(pkml.engineering?.architecture?.repositories||[])]; a[i]={...repo,framework:e.target.value}; updateNested("engineering.architecture.repositories",a); }}
                    placeholder="Django" className="bg-zinc-950 border-zinc-700 text-white" />
                </FormField>
                <FormField label="Owner (@username)">
                  <Input value={repo.ownership?.primary_contact || ""}
                    onChange={(e) => { const a=[...(pkml.engineering?.architecture?.repositories||[])]; a[i]={...repo,ownership:{...(repo.ownership||{}),primary_contact:e.target.value}}; updateNested("engineering.architecture.repositories",a); }}
                    placeholder="@john" className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm" />
                </FormField>
              </div>
              <div className="flex justify-end">
                <Button variant="destructive" size="sm"
                  onClick={() => { const a=[...(pkml.engineering?.architecture?.repositories||[])]; a.splice(i,1); updateNested("engineering.architecture.repositories",a); }}>
                  <Trash2 className="w-4 h-4 mr-1" />Remove
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="gap-2 w-full"
            onClick={() => { const a=[...(pkml.engineering?.architecture?.repositories||[])]; a.push({id:"",name:"",role:"",language:"",framework:"",ownership:{primary_contact:""}}); updateNested("engineering.architecture.repositories",a); }}>
            <Plus className="w-4 h-4" />Add Repository
          </Button>
        </div>
      </FormSection>

      {/* ── Engineering: Constraints ─────────────────────────────── */}
      <FormSection title="Constraints" icon={ShieldAlert}
        badge={(pkml.engineering?.constraints || []).length}>
        <p className="text-xs text-zinc-500 mb-3">
          Rules that must not be violated. These are the highest-value entries for LLMs —
          they prevent repeating mistakes that your team already paid for.
        </p>
        <div className="space-y-3">
          {(pkml.engineering?.constraints || []).map((c, i) => (
            <div key={i} className="border border-zinc-700 rounded-lg p-3 space-y-3 bg-zinc-900/50">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="ID" hint="snake_case">
                  <Input value={c.id || ""}
                    onChange={(e) => { const a=[...(pkml.engineering?.constraints||[])]; a[i]={...c,id:e.target.value}; updateNested("engineering.constraints",a); }}
                    placeholder="no_pdfkit" className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm" />
                </FormField>
                <FormField label="Severity">
                  <Select value={c.severity || "medium"}
                    onValueChange={(v) => { const a=[...(pkml.engineering?.constraints||[])]; a[i]={...c,severity:v}; updateNested("engineering.constraints",a); }}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="critical">🔴 Critical</SelectItem>
                      <SelectItem value="high">🟠 High</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="low">🟢 Low</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <FormField label="Context" hint="Where does this constraint apply?">
                <Input value={c.context || ""}
                  onChange={(e) => { const a=[...(pkml.engineering?.constraints||[])]; a[i]={...c,context:e.target.value}; updateNested("engineering.constraints",a); }}
                  placeholder="PDF generation, API endpoints..." className="bg-zinc-950 border-zinc-700 text-white" />
              </FormField>
              <FormField label="Rule" hint="What must / must not be done?">
                <Input value={c.rule || ""}
                  onChange={(e) => { const a=[...(pkml.engineering?.constraints||[])]; a[i]={...c,rule:e.target.value}; updateNested("engineering.constraints",a); }}
                  placeholder="Do not use pdfkit for PDF generation" className="bg-zinc-950 border-zinc-700 text-white" />
              </FormField>
              <FormField label="Reason" hint="Why? What went wrong before?">
                <Textarea value={c.reason || ""}
                  onChange={(e) => { const a=[...(pkml.engineering?.constraints||[])]; a[i]={...c,reason:e.target.value}; updateNested("engineering.constraints",a); }}
                  placeholder="pdfkit has memory leaks causing OOM errors in large batches. Led to outage INC-2847."
                  className="bg-zinc-950 border-zinc-700 text-white resize-none" rows={2} />
              </FormField>
              <div className="flex justify-end">
                <Button variant="destructive" size="sm"
                  onClick={() => { const a=[...(pkml.engineering?.constraints||[])]; a.splice(i,1); updateNested("engineering.constraints",a); }}>
                  <Trash2 className="w-4 h-4 mr-1" />Remove
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="gap-2 w-full"
            onClick={() => { const a=[...(pkml.engineering?.constraints||[])]; a.push({id:"",context:"",rule:"",reason:"",severity:"medium"}); updateNested("engineering.constraints",a); }}>
            <Plus className="w-4 h-4" />Add Constraint
          </Button>
        </div>
      </FormSection>

      {/* ── Engineering: Lessons Learned ─────────────────────────── */}
      <FormSection title="Lessons Learned" icon={BookOpen}
        badge={(pkml.engineering?.lessons_learned || []).length}>
        <p className="text-xs text-zinc-500 mb-3">
          Historical failures and what was learned. Mark critical ones as "never forget" —
          these are always surfaced when an LLM works on related code.
        </p>
        <div className="space-y-3">
          {(pkml.engineering?.lessons_learned || []).map((l, i) => (
            <div key={i} className={`border rounded-lg p-3 space-y-3 ${l.never_forget ? "border-amber-500/40 bg-amber-500/5" : "border-zinc-700 bg-zinc-900/50"}`}>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="ID" hint="snake_case">
                  <Input value={l.id || ""}
                    onChange={(e) => { const a=[...(pkml.engineering?.lessons_learned||[])]; a[i]={...l,id:e.target.value}; updateNested("engineering.lessons_learned",a); }}
                    placeholder="sync_export_timeout" className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm" />
                </FormField>
                <FormField label="Date">
                  <Input value={l.date || ""}
                    onChange={(e) => { const a=[...(pkml.engineering?.lessons_learned||[])]; a[i]={...l,date:e.target.value}; updateNested("engineering.lessons_learned",a); }}
                    placeholder="2024-03-15" className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm" />
                </FormField>
              </div>
              <FormField label="What happened">
                <Textarea value={l.what_happened || ""}
                  onChange={(e) => { const a=[...(pkml.engineering?.lessons_learned||[])]; a[i]={...l,what_happened:e.target.value}; updateNested("engineering.lessons_learned",a); }}
                  placeholder="Sync PDF export caused API timeouts for batches >100 invoices."
                  className="bg-zinc-950 border-zinc-700 text-white resize-none" rows={2} />
              </FormField>
              <FormField label="Correct approach" hint="Most important — what should be done instead?">
                <Textarea value={l.correct_approach || ""}
                  onChange={(e) => { const a=[...(pkml.engineering?.lessons_learned||[])]; a[i]={...l,correct_approach:e.target.value}; updateNested("engineering.lessons_learned",a); }}
                  placeholder="Use async background job. User starts export, downloads when complete."
                  className="bg-zinc-950 border-zinc-700 text-white resize-none" rows={2} />
              </FormField>
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={!!l.never_forget}
                    onChange={(e) => { const a=[...(pkml.engineering?.lessons_learned||[])]; a[i]={...l,never_forget:e.target.checked}; updateNested("engineering.lessons_learned",a); }}
                    className="w-4 h-4 accent-amber-500" />
                  <span className="text-xs text-amber-400 font-medium">⚠ Never forget — always surface to LLMs</span>
                </label>
                <Button variant="destructive" size="sm"
                  onClick={() => { const a=[...(pkml.engineering?.lessons_learned||[])]; a.splice(i,1); updateNested("engineering.lessons_learned",a); }}>
                  <Trash2 className="w-4 h-4 mr-1" />Remove
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="gap-2 w-full"
            onClick={() => { const a=[...(pkml.engineering?.lessons_learned||[])]; a.push({id:"",what_happened:"",correct_approach:"",never_forget:false}); updateNested("engineering.lessons_learned",a); }}>
            <Plus className="w-4 h-4" />Add Lesson Learned
          </Button>
        </div>
      </FormSection>

      {/* ── Engineering: Architecture ────────────────────────────── */}
      <FormSection title="Architecture — Repositories" icon={GitBranch}
        badge={(pkml.engineering?.architecture?.repositories || []).length}>
        <p className="text-xs text-zinc-500 mb-3">
          Map your repositories and their roles. Use this to bootstrap the structure —
          developers continue refining directly in JSON.
        </p>
        <div className="space-y-3">
          {(pkml.engineering?.architecture?.repositories || []).map((repo, i) => (
            <div key={i} className="border border-zinc-700 rounded-lg p-3 space-y-3 bg-zinc-900/50">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="ID" hint="kebab-case">
                  <Input value={repo.id || ""}
                    onChange={(e) => { const a=[...(pkml.engineering?.architecture?.repositories||[])]; a[i]={...repo,id:e.target.value}; updateNested("engineering.architecture.repositories",a); }}
                    placeholder="invoicing-service" className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm" />
                </FormField>
                <FormField label="Name">
                  <Input value={repo.name || ""}
                    onChange={(e) => { const a=[...(pkml.engineering?.architecture?.repositories||[])]; a[i]={...repo,name:e.target.value}; updateNested("engineering.architecture.repositories",a); }}
                    placeholder="Invoicing Service" className="bg-zinc-950 border-zinc-700 text-white" />
                </FormField>
              </div>
              <FormField label="Role" hint="What is this repo responsible for?">
                <Input value={repo.role || ""}
                  onChange={(e) => { const a=[...(pkml.engineering?.architecture?.repositories||[])]; a[i]={...repo,role:e.target.value}; updateNested("engineering.architecture.repositories",a); }}
                  placeholder="Primary business logic for invoice generation" className="bg-zinc-950 border-zinc-700 text-white" />
              </FormField>
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Language">
                  <Input value={repo.language || ""}
                    onChange={(e) => { const a=[...(pkml.engineering?.architecture?.repositories||[])]; a[i]={...repo,language:e.target.value}; updateNested("engineering.architecture.repositories",a); }}
                    placeholder="Python" className="bg-zinc-950 border-zinc-700 text-white" />
                </FormField>
                <FormField label="Framework">
                  <Input value={repo.framework || ""}
                    onChange={(e) => { const a=[...(pkml.engineering?.architecture?.repositories||[])]; a[i]={...repo,framework:e.target.value}; updateNested("engineering.architecture.repositories",a); }}
                    placeholder="Django" className="bg-zinc-950 border-zinc-700 text-white" />
                </FormField>
                <FormField label="Owner (@username)">
                  <Input value={repo.ownership?.primary_contact || ""}
                    onChange={(e) => { const a=[...(pkml.engineering?.architecture?.repositories||[])]; a[i]={...repo,ownership:{...(repo.ownership||{}),primary_contact:e.target.value}}; updateNested("engineering.architecture.repositories",a); }}
                    placeholder="@john" className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm" />
                </FormField>
              </div>
              <div className="flex justify-end">
                <Button variant="destructive" size="sm"
                  onClick={() => { const a=[...(pkml.engineering?.architecture?.repositories||[])]; a.splice(i,1); updateNested("engineering.architecture.repositories",a); }}>
                  <Trash2 className="w-4 h-4 mr-1" />Remove
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="gap-2 w-full"
            onClick={() => { const a=[...(pkml.engineering?.architecture?.repositories||[])]; a.push({id:"",name:"",role:"",language:"",framework:"",ownership:{primary_contact:""}}); updateNested("engineering.architecture.repositories",a); }}>
            <Plus className="w-4 h-4" />Add Repository
          </Button>
        </div>
      </FormSection>

      {/* ── Engineering: Constraints ─────────────────────────────── */}
      <FormSection title="Constraints" icon={ShieldAlert}
        badge={(pkml.engineering?.constraints || []).length}>
        <p className="text-xs text-zinc-500 mb-3">
          Rules that must not be violated — library restrictions, architecture rules, performance requirements.
          The highest-value entries for LLMs: they prevent repeating mistakes your team already paid for.
        </p>
        <div className="space-y-3">
          {(pkml.engineering?.constraints || []).map((c, i) => (
            <div key={i} className="border border-zinc-700 rounded-lg p-3 space-y-3 bg-zinc-900/50">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="ID" hint="snake_case">
                  <Input value={c.id || ""}
                    onChange={(e) => { const a=[...(pkml.engineering?.constraints||[])]; a[i]={...c,id:e.target.value}; updateNested("engineering.constraints",a); }}
                    placeholder="no_pdfkit" className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm" />
                </FormField>
                <FormField label="Severity">
                  <Select value={c.severity || "medium"}
                    onValueChange={(v) => { const a=[...(pkml.engineering?.constraints||[])]; a[i]={...c,severity:v}; updateNested("engineering.constraints",a); }}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="critical">🔴 Critical</SelectItem>
                      <SelectItem value="high">🟠 High</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="low">🟢 Low</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <FormField label="Context" hint="Where does this constraint apply?">
                <Input value={c.context || ""}
                  onChange={(e) => { const a=[...(pkml.engineering?.constraints||[])]; a[i]={...c,context:e.target.value}; updateNested("engineering.constraints",a); }}
                  placeholder="PDF generation, API endpoints..." className="bg-zinc-950 border-zinc-700 text-white" />
              </FormField>
              <FormField label="Rule" hint="What must / must not be done?">
                <Input value={c.rule || ""}
                  onChange={(e) => { const a=[...(pkml.engineering?.constraints||[])]; a[i]={...c,rule:e.target.value}; updateNested("engineering.constraints",a); }}
                  placeholder="Do not use pdfkit for PDF generation" className="bg-zinc-950 border-zinc-700 text-white" />
              </FormField>
              <FormField label="Reason" hint="Why? What went wrong before?">
                <Textarea value={c.reason || ""}
                  onChange={(e) => { const a=[...(pkml.engineering?.constraints||[])]; a[i]={...c,reason:e.target.value}; updateNested("engineering.constraints",a); }}
                  placeholder="pdfkit has memory leaks causing OOM errors in large batches. Led to outage INC-2847."
                  className="bg-zinc-950 border-zinc-700 text-white resize-none" rows={2} />
              </FormField>
              <div className="flex justify-end">
                <Button variant="destructive" size="sm"
                  onClick={() => { const a=[...(pkml.engineering?.constraints||[])]; a.splice(i,1); updateNested("engineering.constraints",a); }}>
                  <Trash2 className="w-4 h-4 mr-1" />Remove
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="gap-2 w-full"
            onClick={() => { const a=[...(pkml.engineering?.constraints||[])]; a.push({id:"",context:"",rule:"",reason:"",severity:"medium"}); updateNested("engineering.constraints",a); }}>
            <Plus className="w-4 h-4" />Add Constraint
          </Button>
        </div>
      </FormSection>

      {/* ── Engineering: Lessons Learned ─────────────────────────── */}
      <FormSection title="Lessons Learned" icon={BookOpen}
        badge={(pkml.engineering?.lessons_learned || []).length}>
        <p className="text-xs text-zinc-500 mb-3">
          Historical failures and what was learned. Mark critical ones as "never forget" —
          these are always surfaced to LLMs working on related code.
        </p>
        <div className="space-y-3">
          {(pkml.engineering?.lessons_learned || []).map((l, i) => (
            <div key={i} className={`border rounded-lg p-3 space-y-3 ${l.never_forget ? "border-amber-500/40 bg-amber-500/5" : "border-zinc-700 bg-zinc-900/50"}`}>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="ID" hint="snake_case">
                  <Input value={l.id || ""}
                    onChange={(e) => { const a=[...(pkml.engineering?.lessons_learned||[])]; a[i]={...l,id:e.target.value}; updateNested("engineering.lessons_learned",a); }}
                    placeholder="sync_export_timeout" className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm" />
                </FormField>
                <FormField label="Date">
                  <Input value={l.date || ""}
                    onChange={(e) => { const a=[...(pkml.engineering?.lessons_learned||[])]; a[i]={...l,date:e.target.value}; updateNested("engineering.lessons_learned",a); }}
                    placeholder="2024-03-15" className="bg-zinc-950 border-zinc-700 text-white font-mono text-sm" />
                </FormField>
              </div>
              <FormField label="What happened">
                <Textarea value={l.what_happened || ""}
                  onChange={(e) => { const a=[...(pkml.engineering?.lessons_learned||[])]; a[i]={...l,what_happened:e.target.value}; updateNested("engineering.lessons_learned",a); }}
                  placeholder="Sync PDF export caused API timeouts for batches >100 invoices."
                  className="bg-zinc-950 border-zinc-700 text-white resize-none" rows={2} />
              </FormField>
              <FormField label="Correct approach" hint="Most important — what should have been done instead?">
                <Textarea value={l.correct_approach || ""}
                  onChange={(e) => { const a=[...(pkml.engineering?.lessons_learned||[])]; a[i]={...l,correct_approach:e.target.value}; updateNested("engineering.lessons_learned",a); }}
                  placeholder="Use async background job. User starts export, downloads when complete."
                  className="bg-zinc-950 border-zinc-700 text-white resize-none" rows={2} />
              </FormField>
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={!!l.never_forget}
                    onChange={(e) => { const a=[...(pkml.engineering?.lessons_learned||[])]; a[i]={...l,never_forget:e.target.checked}; updateNested("engineering.lessons_learned",a); }}
                    className="w-4 h-4 accent-amber-500" />
                  <span className="text-xs text-amber-400 font-medium">⚠ Never forget — always surface to LLMs</span>
                </label>
                <Button variant="destructive" size="sm"
                  onClick={() => { const a=[...(pkml.engineering?.lessons_learned||[])]; a.splice(i,1); updateNested("engineering.lessons_learned",a); }}>
                  <Trash2 className="w-4 h-4 mr-1" />Remove
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="gap-2 w-full"
            onClick={() => { const a=[...(pkml.engineering?.lessons_learned||[])]; a.push({id:"",what_happened:"",correct_approach:"",never_forget:false}); updateNested("engineering.lessons_learned",a); }}>
            <Plus className="w-4 h-4" />Add Lesson Learned
          </Button>
        </div>
      </FormSection>

      <div className="h-8" />
    </div>
  </ScrollArea>
</div>
```

);
};

export default BuilderPage;
