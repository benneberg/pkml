import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  FileJson, Trash2, Edit3, Globe, GlobeLock,
  Eye, Star, Clock, Plus, Loader2, AlertTriangle,
  ExternalLink, RefreshCw
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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso);
  const d = Math.floor(diff / 86400000);
  if (d < 1) return "today";
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
};

const EmptyState = ({ onNew }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4">
    <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
      <FileJson className="w-7 h-7 text-zinc-600" />
    </div>
    <div className="text-center">
      <p className="text-zinc-300 font-medium mb-1">No saved documents yet</p>
      <p className="text-sm text-zinc-600 max-w-xs">
        Create a PKML document in the Editor and click Save to store it here.
      </p>
    </div>
    <Button onClick={onNew} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
      <Plus className="w-4 h-4" /> New PKML
    </Button>
  </div>
);

const DeleteDialog = ({ doc, open, onOpenChange, onConfirm, isDeleting }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md bg-zinc-900 border-zinc-800">
      <DialogHeader>
        <DialogTitle className="text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Delete document
        </DialogTitle>
        <DialogDescription className="text-zinc-400">
          Are you sure you want to delete <span className="text-white font-medium">"{doc?.title}"</span>?
          {doc?.published && (
            <span className="block mt-2 text-amber-400 text-sm">
              ⚠ This document is published. Deleting it will remove it from the Registry.
            </span>
          )}
          <span className="block mt-1">This action cannot be undone.</span>
        </DialogDescription>
      </DialogHeader>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={isDeleting}
          className="gap-2"
        >
          {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
          Delete
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

const DocumentCard = ({ doc, onEdit, onDelete, onTogglePublish, isUpdating }) => {
  const navigate = useNavigate();
  const product = doc.content?.product || {};

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors group">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-white truncate">
                {product.name || doc.title || "Untitled"}
              </h3>
              <span className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                doc.published
                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : "bg-zinc-800 text-zinc-500 border-zinc-700"
              }`}>
                {doc.published ? "Published" : "Draft"}
              </span>
            </div>
            <p className="text-xs text-zinc-500 line-clamp-1">
              {product.tagline || "No tagline"}
            </p>
          </div>
        </div>

        {/* Categories */}
        {(product.category || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.category.slice(0, 3).map((c) => (
              <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 py-2.5 flex items-center gap-4 border-b border-zinc-800 bg-zinc-950/30">
        <span className="flex items-center gap-1 text-xs text-zinc-600">
          <Clock className="w-3 h-3" /> {timeAgo(doc.updated_at)}
        </span>
        {doc.published && (
          <>
            <span className="flex items-center gap-1 text-xs text-zinc-600">
              <Star className="w-3 h-3" /> {doc.stars || 0}
            </span>
            <span className="flex items-center gap-1 text-xs text-zinc-600">
              <Eye className="w-3 h-3" /> {doc.views || 0}
            </span>
          </>
        )}
        <span className="ml-auto font-mono text-[10px] text-zinc-700 truncate">
          /{doc.slug}
        </span>
      </div>

      {/* Actions */}
      <div className="p-3 flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => onEdit(doc)}
          className="gap-1.5 flex-1 bg-indigo-600 hover:bg-indigo-700 text-xs"
        >
          <Edit3 className="w-3.5 h-3.5" /> Edit
        </Button>

        {doc.published && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/view/${doc.slug}`)}
            className="gap-1.5 text-xs"
            title="View public page"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => onTogglePublish(doc)}
          disabled={isUpdating === doc.id}
          className={`gap-1.5 text-xs ${doc.published ? "text-amber-400 border-amber-500/30 hover:bg-amber-500/10" : "text-green-400 border-green-500/30 hover:bg-green-500/10"}`}
          title={doc.published ? "Unpublish from Registry" : "Publish to Registry"}
        >
          {isUpdating === doc.id
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : doc.published
              ? <GlobeLock className="w-3.5 h-3.5" />
              : <Globe className="w-3.5 h-3.5" />
          }
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(doc)}
          className="gap-1.5 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export const MyDocumentsPage = ({ onLoadDocument }) => {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/pkml/my-documents`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDocs(data);
    } catch {
      toast.error("Could not load your documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleEdit = (doc) => {
    // Load document into editor and store the doc ID so Save updates it
    const content = JSON.stringify(doc.content, null, 2);
    onLoadDocument(content, doc.id, doc.slug);
    navigate("/");
    toast.success(`Loaded "${doc.title}" — editing`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/pkml/document/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setDocs((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      toast.success(`Deleted "${deleteTarget.title}"`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (doc) => {
    setIsUpdating(doc.id);
    const endpoint = doc.published
      ? `/api/pkml/unpublish/${doc.id}`
      : `/api/pkml/publish/${doc.id}`;
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      setDocs((prev) =>
        prev.map((d) => d.id === doc.id ? { ...d, published: !d.published } : d)
      );
      toast.success(doc.published ? "Removed from Registry" : "Published to Registry! 🎉");
    } catch {
      toast.error("Could not update publish status");
    } finally {
      setIsUpdating(null);
    }
  };

  const stats = {
    total: docs.length,
    published: docs.filter((d) => d.published).length,
    drafts: docs.filter((d) => !d.published).length,
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col" data-testid="my-documents-page">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">My Documents</h2>
            {docs.length > 0 && (
              <p className="text-sm text-zinc-500 mt-0.5">
                {stats.total} document{stats.total !== 1 ? "s" : ""} —{" "}
                {stats.published} published, {stats.drafts} draft{stats.drafts !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchDocs}
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> New PKML
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-zinc-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading your documents...</span>
            </div>
          ) : docs.length === 0 ? (
            <EmptyState onNew={() => navigate("/")} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onEdit={handleEdit}
                  onDelete={(d) => setDeleteTarget(d)}
                  onTogglePublish={handleTogglePublish}
                  isUpdating={isUpdating}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <DeleteDialog
        doc={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default MyDocumentsPage;
