import { useState, useEffect } from “react”;
import { useParams, useNavigate } from “react-router-dom”;
import { toast } from “sonner”;
import {
Star, GitFork, Eye, ArrowLeft, Download, Copy,
Globe, Code2, CheckCircle2, XCircle, Loader2,
ExternalLink, Tag, Clock, Package, Layers, Server
} from “lucide-react”;
import { Button } from “../components/ui/button”;
import { ScrollArea } from “../components/ui/scroll-area”;

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const timeAgo = (iso) => {
const diff = Date.now() - new Date(iso);
const d = Math.floor(diff / 86400000);
if (d < 1) return “today”;
if (d < 30) return `${d}d ago`;
return `${Math.floor(d / 30)}mo ago`;
};

const Section = ({ icon: Icon, title, children }) => (

  <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-950/50">
      <Icon className="w-4 h-4 text-indigo-400" />
      <span className="text-sm font-semibold text-white">{title}</span>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const PriorityBadge = ({ priority }) => {
const cls = priority === “primary” ? “bg-indigo-500/10 text-indigo-400 border-indigo-500/20”
: priority === “secondary” ? “bg-purple-500/10 text-purple-400 border-purple-500/20”
: “bg-zinc-800 text-zinc-400 border-zinc-700”;
return <span className={`text-[10px] px-2 py-0.5 rounded border ${cls}`}>{priority}</span>;
};

export const ViewPage = ({ onFork }) => {
const { slug } = useParams();
const navigate = useNavigate();
const [doc, setDoc] = useState(null);
const [loading, setLoading] = useState(true);
const [copied, setCopied] = useState(false);
const [showRaw, setShowRaw] = useState(false);

useEffect(() => {
const fetchDoc = async () => {
try {
const res = await fetch(`${BACKEND_URL}/api/pkml/document/${slug}`);
if (!res.ok) throw new Error(“Not found”);
const data = await res.json();
setDoc(data);
} catch {
toast.error(“Document not found”);
navigate(”/registry”);
} finally {
setLoading(false);
}
};
fetchDoc();
}, [slug, navigate]);

if (loading) return (
<div className="h-[calc(100vh-4rem)] flex items-center justify-center text-zinc-600 gap-3">
<Loader2 className="w-5 h-5 animate-spin" />
<span className="text-sm">Loading…</span>
</div>
);

if (!doc) return null;

const product = doc.content?.product || {};
const features = doc.content?.features || [];
const workflows = doc.content?.workflows || [];
const stack = doc.content?.tech_stack || {};
const integrations = doc.content?.integrations || [];

const handleCopy = () => {
navigator.clipboard.writeText(JSON.stringify(doc.content, null, 2));
setCopied(true);
setTimeout(() => setCopied(false), 2000);
toast.success(“Copied to clipboard!”);
};

const handleDownload = () => {
const blob = new Blob([JSON.stringify(doc.content, null, 2)], { type: “application/json” });
const url = URL.createObjectURL(blob);
const a = document.createElement(“a”);
a.href = url;
a.download = `${slug}.pkml.json`;
a.click();
URL.revokeObjectURL(url);
toast.success(“Downloaded!”);
};

const handleFork = () => {
const forked = JSON.parse(JSON.stringify(doc.content));
forked.meta = { …forked.meta, last_updated: new Date().toISOString(), version: “1.0.0” };
if (forked.product?.name) forked.product.name = `${forked.product.name} (fork)`;
onFork(JSON.stringify(forked, null, 2));
toast.success(“Forked! Switch to Editor to customize.”);
navigate(”/”);
};

const badgeMd = `[![PKML](https://pkml.dev/badge/${slug}.svg)](${window.location.href})`;

return (
<div className="h-[calc(100vh-4rem)] flex flex-col" data-testid="view-page">
{/* Header bar */}
<div className="border-b border-zinc-800 bg-zinc-950 px-6 py-3 flex items-center gap-4 flex-wrap">
<button onClick={() => navigate(-1)} className=“flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors”>
<ArrowLeft className="w-4 h-4" /> Back
</button>
<div className="flex-1" />
<div className="flex items-center gap-2">
<button
onClick={() => setShowRaw(!showRaw)}
className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${showRaw ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-500 hover:text-zinc-300"}`}
>
<Code2 className="w-3.5 h-3.5" /> {showRaw ? “Formatted” : “Raw JSON”}
</button>
<Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
<Copy className="w-3.5 h-3.5" />
{copied ? “Copied!” : “Copy”}
</Button>
<Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
<Download className="w-3.5 h-3.5" /> Download
</Button>
<Button size="sm" onClick={handleFork} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
<GitFork className="w-3.5 h-3.5" /> Fork & Customize
</Button>
</div>
</div>

```
  <ScrollArea className="flex-1">
    <div className="max-w-3xl mx-auto p-6 space-y-5">

      {showRaw ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-zinc-800 text-xs font-mono text-zinc-500">{slug}.pkml.json</div>
          <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto max-h-[600px] overflow-y-auto">
            {JSON.stringify(doc.content, null, 2)}
          </pre>
        </div>
      ) : (
        <>
          {/* Hero */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{product.name}</h1>
                <p className="text-zinc-400 mt-1">{product.tagline}</p>
                {product.description && <p className="text-sm text-zinc-500 mt-2">{product.description}</p>}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(product.category || []).map((c) => (
                    <span key={c} className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{c}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  {product.website && (
                    <a href={product.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-indigo-400 transition-colors">
                      <Globe className="w-3 h-3" /> {product.website}
                    </a>
                  )}
                  {product.repository && (
                    <a href={product.repository} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-indigo-400 transition-colors">
                      <ExternalLink className="w-3 h-3" /> Repository
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="flex gap-3 text-sm">
                  <span className="flex items-center gap-1 text-zinc-400"><Star className="w-4 h-4 text-yellow-500" /> {doc.stars}</span>
                  <span className="flex items-center gap-1 text-zinc-500"><Eye className="w-4 h-4" /> {doc.views}</span>
                </div>
                {doc.author && <span className="text-xs text-zinc-600">@{doc.author}</span>}
                <span className="text-xs text-zinc-700 flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(doc.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Positioning */}
          {product.positioning && (product.positioning.problem || product.positioning.solution) && (
            <Section icon={Package} title="Positioning">
              <div className="space-y-3">
                {product.positioning.problem && (
                  <div>
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Problem</div>
                    <p className="text-sm text-zinc-300">{product.positioning.problem}</p>
                  </div>
                )}
                {product.positioning.solution && (
                  <div>
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Solution</div>
                    <p className="text-sm text-zinc-300">{product.positioning.solution}</p>
                  </div>
                )}
                {product.positioning.target_audience && (
                  <div>
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Target Audience</div>
                    <p className="text-sm text-zinc-300">{product.positioning.target_audience}</p>
                  </div>
                )}
                {(product.positioning.differentiators || []).length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Differentiators</div>
                    <ul className="space-y-1">
                      {product.positioning.differentiators.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Features */}
          {features.length > 0 && (
            <Section icon={Layers} title={`Features (${features.length})`}>
              <div className="space-y-3">
                {features.map((f) => (
                  <div key={f.id} className="flex items-start gap-3 py-2 border-b border-zinc-800 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-white">{f.name}</span>
                        <PriorityBadge priority={f.priority} />
                      </div>
                      <p className="text-xs text-zinc-500">{f.description}</p>
                      {f.user_benefit && <p className="text-xs text-indigo-400 mt-1">↳ {f.user_benefit}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Tech Stack */}
          {Object.values(stack).some((v) => v?.length > 0) && (
            <Section icon={Server} title="Tech Stack">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(stack).filter(([, v]) => v?.length > 0).map(([layer, items]) => (
                  <div key={layer}>
                    <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">{layer}</div>
                    <div className="flex flex-wrap gap-1">
                      {items.map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 font-mono">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Workflows */}
          {workflows.length > 0 && (
            <Section icon={Package} title={`Workflows (${workflows.length})`}>
              <div className="space-y-4">
                {workflows.map((w) => (
                  <div key={w.id} className="border border-zinc-800 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-white">{w.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${
                        w.difficulty === "beginner" ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : w.difficulty === "advanced" ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      }`}>{w.difficulty}</span>
                      {w.estimated_time && <span className="text-xs text-zinc-600">{w.estimated_time}</span>}
                    </div>
                    <p className="text-xs text-zinc-500 mb-3">{w.description}</p>
                    {(w.steps || []).length > 0 && (
                      <ol className="space-y-1.5">
                        {w.steps.map((s) => (
                          <li key={s.order} className="flex items-start gap-2 text-xs">
                            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.order}</span>
                            <span className="text-zinc-300">{s.action}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                    {w.outcome && <p className="text-xs text-green-400 mt-2">✓ {w.outcome}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* GitHub Badge */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">GitHub Badge</div>
            <code className="block text-xs text-zinc-400 bg-zinc-950 p-3 rounded border border-zinc-800 break-all">{badgeMd}</code>
            <button onClick={() => { navigator.clipboard.writeText(badgeMd); toast.success("Badge copied!"); }}
              className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Copy badge markdown</button>
          </div>
        </>
      )}
    </div>
  </ScrollArea>
</div>
```

);
};

export default ViewPage;
