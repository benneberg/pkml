import { useState, useEffect, useCallback } from “react”;
import { useNavigate } from “react-router-dom”;
import { toast } from “sonner”;
import {
Star, GitFork, Eye, Search, Globe, Tag,
ArrowRight, TrendingUp, Clock, Loader2, RefreshCw
} from “lucide-react”;
import { Button } from “../components/ui/button”;
import { ScrollArea } from “../components/ui/scroll-area”;

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CATEGORY_COLORS = {
productivity: “bg-indigo-500/10 text-indigo-400 border-indigo-500/20”,
“developer-tools”: “bg-purple-500/10 text-purple-400 border-purple-500/20”,
devtool: “bg-purple-500/10 text-purple-400 border-purple-500/20”,
saas: “bg-blue-500/10 text-blue-400 border-blue-500/20”,
ai: “bg-pink-500/10 text-pink-400 border-pink-500/20”,
api: “bg-orange-500/10 text-orange-400 border-orange-500/20”,
mobile: “bg-rose-500/10 text-rose-400 border-rose-500/20”,
security: “bg-red-500/10 text-red-400 border-red-500/20”,
fintech: “bg-emerald-500/10 text-emerald-400 border-emerald-500/20”,
collaboration: “bg-cyan-500/10 text-cyan-400 border-cyan-500/20”,
};

const timeAgo = (iso) => {
const diff = Date.now() - new Date(iso);
const d = Math.floor(diff / 86400000);
if (d < 1) return “today”;
if (d < 30) return `${d}d ago`;
if (d < 365) return `${Math.floor(d / 30)}mo ago`;
return `${Math.floor(d / 365)}y ago`;
};

const CategoryPill = ({ cat }) => {
const cls = CATEGORY_COLORS[cat] || “bg-zinc-800 text-zinc-400 border-zinc-700”;
return (
<span className={`text-[10px] px-2 py-0.5 rounded border ${cls} font-medium`}>{cat}</span>
);
};

const RegistryCard = ({ doc, onFork, onStar }) => {
const navigate = useNavigate();
const product = doc.content?.product || {};
const cats = product.category || [];
const stack = [
…(doc.content?.tech_stack?.frontend || []),
…(doc.content?.tech_stack?.backend || []),
…(doc.content?.tech_stack?.databases || []),
].slice(0, 4);

return (
<div
className=“gallery-card group flex flex-col cursor-pointer”
onClick={() => navigate(`/view/${doc.slug}`)}
data-testid={`registry-card-${doc.slug}`}
>
<div className="p-4 border-b border-zinc-800 flex-1">
<div className="flex items-start justify-between gap-2 mb-2">
<div className="flex-1 min-w-0">
<h3 className="text-sm font-bold text-white truncate">{product.name || doc.title}</h3>
<p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{product.tagline}</p>
</div>
<span className="text-[10px] text-zinc-600 whitespace-nowrap flex-shrink-0">{timeAgo(doc.updated_at)}</span>
</div>

```
    <div className="flex flex-wrap gap-1 mb-3">
      {cats.slice(0, 3).map((c) => <CategoryPill key={c} cat={c} />)}
    </div>

    {stack.length > 0 && (
      <div className="flex flex-wrap gap-1">
        {stack.map((t) => (
          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-800 font-mono">{t}</span>
        ))}
      </div>
    )}
  </div>

  <div className="p-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <button
        onClick={(e) => { e.stopPropagation(); onStar(doc.id); }}
        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-yellow-400 transition-colors"
      >
        <Star className="w-3.5 h-3.5" /> {doc.stars}
      </button>
      <span className="flex items-center gap-1 text-xs text-zinc-600">
        <Eye className="w-3.5 h-3.5" /> {doc.views}
      </span>
      {doc.author && (
        <span className="text-[10px] text-zinc-600">@{doc.author}</span>
      )}
    </div>
    <button
      onClick={(e) => { e.stopPropagation(); onFork(doc); }}
      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
    >
      <GitFork className="w-3.5 h-3.5" /> Fork
    </button>
  </div>
</div>
```

);
};

const SORT_OPTIONS = [
{ value: “stars”, label: “Most Starred”, icon: Star },
{ value: “views”, label: “Most Viewed”, icon: TrendingUp },
{ value: “updated_at”, label: “Recently Updated”, icon: Clock },
];

export const RegistryPage = ({ onForkTemplate }) => {
const [docs, setDocs] = useState([]);
const [total, setTotal] = useState(0);
const [loading, setLoading] = useState(true);
const [search, setSearch] = useState(””);
const [sort, setSort] = useState(“stars”);
const [searchInput, setSearchInput] = useState(””);

const fetchRegistry = useCallback(async () => {
setLoading(true);
try {
const params = new URLSearchParams({ sort, limit: “50” });
if (search) params.set(“search”, search);
const res = await fetch(`${BACKEND_URL}/api/pkml/registry?${params}`);
if (!res.ok) throw new Error(“Failed to fetch registry”);
const data = await res.json();
setDocs(data.items || []);
setTotal(data.total || 0);
} catch (err) {
toast.error(“Could not load registry”);
setDocs([]);
} finally {
setLoading(false);
}
}, [search, sort]);

useEffect(() => { fetchRegistry(); }, [fetchRegistry]);

const handleSearch = (e) => {
e.preventDefault();
setSearch(searchInput);
};

const handleStar = async (id) => {
try {
const res = await fetch(`${BACKEND_URL}/api/pkml/star/${id}`, { method: “POST” });
if (!res.ok) throw new Error();
const data = await res.json();
setDocs((prev) => prev.map((d) => d.id === id ? { …d, stars: data.stars } : d));
toast.success(“⭐ Starred!”);
} catch {
toast.error(“Could not star”);
}
};

const handleFork = (doc) => {
const forked = JSON.parse(JSON.stringify(doc.content));
forked.meta = { …forked.meta, last_updated: new Date().toISOString(), version: “1.0.0” };
if (forked.product?.name) forked.product.name = `${forked.product.name} (fork)`;
onForkTemplate(JSON.stringify(forked, null, 2));
toast.success(`Forked "${doc.title}" — switch to Editor to customize`);
};

return (
<div className="h-[calc(100vh-4rem)] flex flex-col" data-testid="registry-page">
{/* Hero */}
<div className="px-6 pt-8 pb-5 border-b border-zinc-800">
<div className="max-w-4xl mx-auto">
<div className="flex items-center gap-2 mb-3">
<Globe className="w-5 h-5 text-indigo-400" />
<span className="text-xs font-mono text-zinc-500">registry.pkml.dev</span>
</div>
<h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">PKML Registry</h1>
<p className="text-sm text-zinc-400">
Discover, fork, and publish structured product knowledge. {total > 0 && <span className="text-zinc-500">{total} {total === 1 ? “entry” : “entries”} published.</span>}
</p>

```
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mt-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products, categories, tech stack..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-600 outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Search className="w-4 h-4" /> Search
        </Button>
        {search && (
          <Button type="button" variant="outline" size="sm" onClick={() => { setSearch(""); setSearchInput(""); }}>
            Clear
          </Button>
        )}
      </form>

      {/* Sort tabs */}
      <div className="flex gap-1 mt-3">
        {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
          <button key={value} onClick={() => setSort(value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${sort === value ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "text-zinc-500 hover:text-zinc-300"}`}>
            <Icon className="w-3 h-3" /> {label}
          </button>
        ))}
        <button onClick={fetchRegistry} className="ml-auto text-zinc-600 hover:text-zinc-400 transition-colors p-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  </div>

  {/* Grid */}
  <ScrollArea className="flex-1">
    <div className="max-w-4xl mx-auto p-6">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm">Loading registry...</span>
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-20">
          <Globe className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 font-medium mb-1">
            {search ? `No results for "${search}"` : "The registry is empty"}
          </p>
          <p className="text-sm text-zinc-600">
            {search ? "Try a different search term" : "Save a PKML and publish it to be the first!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => (
            <RegistryCard key={doc.id} doc={doc} onFork={handleFork} onStar={handleStar} />
          ))}
        </div>
      )}
    </div>
  </ScrollArea>
</div>
```

);
};

export default RegistryPage;
