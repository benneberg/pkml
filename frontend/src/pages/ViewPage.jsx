import { useState, useEffect } from “react”;
import { useParams, useNavigate } from “react-router-dom”;
import { toast } from “sonner”;
import {
Star, GitFork, Eye, ArrowLeft, Download, Copy,
Globe, Code2, CheckCircle2, Loader2, ExternalLink,
Clock, Package, Layers, Server, ShieldAlert, BookOpen,
GitBranch, AlertTriangle, Workflow,
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

const Section = ({ icon: Icon, title, children, accent }) => (

  <div className={`bg-zinc-900 border rounded-lg overflow-hidden ${accent ? "border-amber-500/30" : "border-zinc-800"}`}>
    <div className={`flex items-center gap-2 px-4 py-3 border-b ${accent ? "border-amber-500/20 bg-amber-500/5" : "border-zinc-800 bg-zinc-950/50"}`}>
      <Icon className={`w-4 h-4 ${accent ? "text-amber-400" : "text-indigo-400"}`} />
      <span className="text-sm font-semibold text-white">{title}</span>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const PriorityBadge = ({ priority }) => {
const map = {
p0: “bg-red-500/10 text-red-400 border-red-500/20”,
p1: “bg-orange-500/10 text-orange-400 border-orange-500/20”,
p2: “bg-yellow-500/10 text-yellow-400 border-yellow-500/20”,
p3: “bg-zinc-800 text-zinc-400 border-zinc-700”,
primary: “bg-indigo-500/10 text-indigo-400 border-indigo-500/20”,
secondary: “bg-purple-500/10 text-purple-400 border-purple-500/20”,
};
const cls = map[priority] || “bg-zinc-800 text-zinc-400 border-zinc-700”;
return <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${cls}`}>{priority}</span>;
};

const StatusBadge = ({ status }) => {
const map = {
live: “✅ live”,
wip: “🔧 in progress”,
planned: “📋 planned”,
deprecated: “❌ deprecated”,
};
return status ? (
<span className="text-[10px] text-zinc-500 font-mono">{map[status] || status}</span>
) : null;
};

const SevBadge = ({ severity }) => {
const map = { critical: “🔴”, high: “🟠”, medium: “🟡”, low: “🟢” };
return <span className="text-xs">{map[severity] || “⚪”} {severity}</span>;
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
setDoc(await res.json());
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
<Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading…</span>
</div>
);
if (!doc) return null;

const content = doc.content || {};
const product = content.product || {};
const features = content.features || [];
const workflows = content.workflows || [];
const stack = content.tech_stack || {};
const integrations = content.integrations || [];
const eng = content.engineering || {};

const handleCopy = () => {
navigator.clipboard.writeText(JSON.stringify(content, null, 2));
setCopied(true); setTimeout(() => setCopied(false), 2000);
toast.success(“Copied!”);
};

const handleDownload = () => {
const a = Object.assign(document.createElement(“a”), {
href: URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: “application/json” })),
download: `${slug}.pkml.json`,
});
a.click(); URL.revokeObjectURL(a.href);
toast.success(“Downloaded!”);
};

const handleFork = () => {
const forked = JSON.parse(JSON.stringify(content));
forked.meta = { …forked.meta, last_updated: new Date().toISOString(), version: “1.0.0” };
if (forked.product?.name) forked.product.name = `${forked.product.name} (fork)`;
onFork(JSON.stringify(forked, null, 2));
toast.success(“Forked! Switch to Editor to customize.”);
navigate(”/”);
};

const badgeMd = `[![PKML](https://pkml.dev/badge/${slug}.svg)](${window.location.href})`;

// Normalise tech_stack for rendering (handle both array and object formats)
const renderTechStack = () => {
if (Array.isArray(stack)) {
const byLayer = {};
stack.forEach(({ layer, technology }) => {
if (layer && technology) (byLayer[layer] = byLayer[layer] || []).push(technology);
});
return Object.entries(byLayer);
}
return Object.entries(stack).filter(([, v]) => v?.length);
};
const stackEntries = renderTechStack();

return (
<div className="h-[calc(100vh-4rem)] flex flex-col" data-testid="view-page">
{/* Header */}
<div className="border-b border-zinc-800 bg-zinc-950 px-6 py-3 flex items-center gap-4 flex-wrap">
<button onClick={() => navigate(-1)} className=“flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors”>
<ArrowLeft className="w-4 h-4" /> Back
</button>
<div className="flex-1" />
<div className="flex items-center gap-2">
<button onClick={() => setShowRaw(!showRaw)}
className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${showRaw ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-500 hover:text-zinc-300"}`}>
<Code2 className="w-3.5 h-3.5" /> {showRaw ? “Formatted” : “Raw JSON”}
</button>
<Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
<Copy className="w-3.5 h-3.5" />{copied ? “Copied!” : “Copy”}
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
            {JSON.stringify(content, null, 2)}
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
                  <span className="flex items-center gap-1 text-zinc-400"><Star className="w-4 h-4 text-yellow-500" /> {doc.stars || 0}</span>
                  <span className="flex items-center gap-1 text-zinc-500"><Eye className="w-4 h-4" /> {doc.views || 0}</span>
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
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-semibold text-white">{f.name}</span>
                        <PriorityBadge priority={f.priority} />
                        <StatusBadge status={f.status} />
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
          {stackEntries.length > 0 && (
            <Section icon={Server} title="Tech Stack">
              <div className="grid grid-cols-2 gap-3">
                {stackEntries.map(([layer, items]) => (
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
            <Section icon={Workflow} title={`Workflows (${workflows.length})`}>
              <div className="space-y-4">
                {workflows.map((w) => (
                  <div key={w.id} className="border border-zinc-800 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{w.name}</span>
                      {w.happy_path === false && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">error path</span>}
                      {w.estimated_time && <span className="text-xs text-zinc-600">{w.estimated_time}</span>}
                    </div>
                    <p className="text-xs text-zinc-500 mb-3">{w.description}</p>
                    {(w.steps || []).length > 0 && (
                      <ol className="space-y-1.5">
                        {w.steps.map((s) => (
                          <li key={s.order} className="flex items-start gap-2 text-xs">
                            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.order}</span>
                            <div>
                              <span className="text-zinc-300">{s.action}</span>
                              {s.actor && <span className="text-zinc-600"> ({s.actor})</span>}
                              {s.system_response && <div className="text-zinc-600 mt-0.5">↳ {s.system_response}</div>}
                            </div>
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

          {/* ── Engineering Section ─────────────────────────────────── */}
          {Object.keys(eng).length > 0 && (
            <>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 border-t border-zinc-800" />
                <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider px-2">Engineering Knowledge</span>
                <div className="flex-1 border-t border-zinc-800" />
              </div>

              {/* Architecture */}
              {(eng.architecture?.repositories || []).length > 0 && (
                <Section icon={GitBranch} title="Architecture">
                  <div className="space-y-3">
                    {eng.architecture.repositories.map((repo) => (
                      <div key={repo.id} className="border border-zinc-800 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold text-white">{repo.name || repo.id}</span>
                          {repo.language && <span className="text-xs px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 font-mono">{repo.language}{repo.framework ? `/${repo.framework}` : ""}</span>}
                          {repo.ownership?.primary_contact && <span className="text-xs text-zinc-600">{repo.ownership.primary_contact}</span>}
                        </div>
                        <p className="text-xs text-zinc-500">{repo.role}</p>
                        {repo.url && (
                          <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline mt-1 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> {repo.url}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Constraints */}
              {(eng.constraints || []).length > 0 && (
                <Section icon={ShieldAlert} title={`Constraints (${eng.constraints.length})`}>
                  <div className="space-y-3">
                    {eng.constraints.map((c) => (
                      <div key={c.id} className={`border rounded-md p-3 ${c.severity === "critical" ? "border-red-500/30 bg-red-500/5" : "border-zinc-800"}`}>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <code className="text-xs font-mono text-zinc-300">{c.id}</code>
                          <SevBadge severity={c.severity} />
                          {c.context && <span className="text-xs text-zinc-600">{c.context}</span>}
                        </div>
                        <p className="text-xs font-medium text-zinc-200 mb-1">{c.rule}</p>
                        <p className="text-xs text-zinc-500">{c.reason}</p>
                        {(c.approved_alternatives || []).length > 0 && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className="text-xs text-green-500 font-medium">Use instead:</span>
                            {c.approved_alternatives.map((a) => (
                              <span key={a.name} className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">{a.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Lessons Learned */}
              {(eng.lessons_learned || []).length > 0 && (
                <Section icon={BookOpen} title={`Lessons Learned (${eng.lessons_learned.length})`}
                  accent={(eng.lessons_learned || []).some((l) => l.never_forget)}>
                  <div className="space-y-3">
                    {eng.lessons_learned.map((l) => (
                      <div key={l.id} className={`border rounded-md p-3 ${l.never_forget ? "border-amber-500/30 bg-amber-500/5" : "border-zinc-800"}`}>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <code className="text-xs font-mono text-zinc-300">{l.id}</code>
                          {l.never_forget && <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ never forget</span>}
                          {l.date && <span className="text-xs text-zinc-600">{l.date}</span>}
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div><span className="text-zinc-500 font-medium">What happened: </span><span className="text-zinc-300">{l.what_happened}</span></div>
                          {l.why_it_failed && <div><span className="text-zinc-500 font-medium">Why: </span><span className="text-zinc-300">{l.why_it_failed}</span></div>}
                          <div className="pt-1 border-t border-zinc-800">
                            <span className="text-green-500 font-medium">Correct approach: </span>
                            <span className="text-zinc-200">{l.correct_approach}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Implementation Patterns (summary) */}
              {(eng.implementation_patterns || []).length > 0 && (
                <Section icon={Package} title={`Implementation Patterns (${eng.implementation_patterns.length})`}>
                  <div className="space-y-3">
                    {eng.implementation_patterns.map((p) => (
                      <div key={p.id} className="border border-zinc-800 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold text-white">{p.name}</span>
                          <code className="text-[10px] font-mono text-zinc-600">{p.id}</code>
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${p.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-zinc-800 text-zinc-500 border-zinc-700"}`}>{p.status}</span>
                        </div>
                        <p className="text-xs text-zinc-500 mb-2">{p.when_to_use}</p>
                        {(p.steps || []).length > 0 && (
                          <div className="text-xs text-zinc-600">{p.steps.length} steps across: {[...new Set(p.steps.map(s => s.repository))].join(", ")}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </>
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