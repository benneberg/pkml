from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import re
import httpx
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(**file**).parent
load_dotenv(ROOT_DIR / “.env”)

logging.basicConfig(level=logging.INFO, format=”%(asctime)s - %(name)s - %(levelname)s - %(message)s”)
logger = logging.getLogger(**name**)

# ── MongoDB ───────────────────────────────────────────────────────────────────

mongo_url = os.environ.get(“MONGO_URL”)
db_name = os.environ.get(“DB_NAME”)
if not mongo_url or not db_name:
raise RuntimeError(“Missing MONGO_URL or DB_NAME in .env”)

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# ── FastAPI ───────────────────────────────────────────────────────────────────

app = FastAPI(title=“PKML Platform API”, version=“0.2.0”)
api_router = APIRouter(prefix=”/api”)

# ── Models ────────────────────────────────────────────────────────────────────

class ValidationError(BaseModel):
path: str
message: str
severity: str = “error”

class ValidationResult(BaseModel):
valid: bool
errors: List[ValidationError] = Field(default_factory=list)
warnings: List[ValidationError] = Field(default_factory=list)
completeness_score: int = 0

class PKMLValidateRequest(BaseModel):
content: str

class ReadmeImportRequest(BaseModel):
readme_content: str

class ExportMarkdownRequest(BaseModel):
pkml_content: str

class SavePKMLRequest(BaseModel):
content: str
title: Optional[str] = None
published: bool = False
tags: List[str] = Field(default_factory=list)

class PKMLExample(BaseModel):
id: str
name: str
description: str
category: str
content: Dict[str, Any]

# ── Utilities ─────────────────────────────────────────────────────────────────

def safe_json_load(content: str):
try:
return json.loads(content)
except json.JSONDecodeError as e:
raise HTTPException(status_code=400, detail=f”Invalid JSON: {e}”)

def make_slug(name: str, doc_id: str) -> str:
slug = re.sub(r”[^a-z0-9]+”, “-”, name.lower()).strip(”-”)
return slug or doc_id[:8]

def doc_to_response(doc: dict) -> dict:
if “_id” in doc:
doc[“id”] = str(doc[”_id”])
del doc[”_id”]
return doc

# ── Validation ────────────────────────────────────────────────────────────────

def validate_pkml(data: dict) -> ValidationResult:
“”“Validate a PKML v0.2 document with rich error messages and completeness scoring.”””
errors: List[ValidationError] = []
warnings: List[ValidationError] = []

```
# Required top-level fields
if "$schema" not in data:
    errors.append(ValidationError(path="$schema", message="Missing required field: $schema", severity="error"))

if "meta" not in data:
    errors.append(ValidationError(path="meta", message="Missing required field: meta", severity="error"))
else:
    meta = data["meta"]
    for field in ("version", "pkml_version", "last_updated"):
        if field not in meta:
            errors.append(ValidationError(path=f"meta.{field}", message=f"Missing required field: meta.{field}", severity="error"))
    pv = meta.get("pkml_version", "")
    if pv and pv not in ("0.2", "0.1.0", "0.1"):
        warnings.append(ValidationError(path="meta.pkml_version", message=f"Unknown pkml_version '{pv}'. Current version is '0.2'.", severity="warning"))

if "product" not in data:
    errors.append(ValidationError(path="product", message="Missing required field: product", severity="error"))
else:
    product = data["product"]
    if not product.get("name"):
        errors.append(ValidationError(path="product.name", message="Missing required field: product.name", severity="error"))
    if not product.get("tagline"):
        errors.append(ValidationError(path="product.tagline", message="Missing required field: product.tagline", severity="error"))
    if product.get("positioning"):
        pos = product["positioning"]
        for field in ("problem", "solution"):
            if not pos.get(field):
                warnings.append(ValidationError(path=f"product.positioning.{field}", message=f"positioning.{field} is strongly recommended", severity="warning"))

# Features validation
valid_priorities = {"p0", "p1", "p2", "p3"}
legacy_priorities = {"primary", "secondary", "tertiary"}
valid_statuses = {"planned", "wip", "live", "deprecated"}

for i, feature in enumerate(data.get("features", [])):
    if "id" not in feature:
        errors.append(ValidationError(path=f"features[{i}].id", message=f"Feature at index {i} missing required field: id", severity="error"))
    if "name" not in feature:
        errors.append(ValidationError(path=f"features[{i}].name", message=f"Feature at index {i} missing required field: name", severity="error"))
    priority = feature.get("priority")
    if priority:
        if priority in legacy_priorities:
            warnings.append(ValidationError(path=f"features[{i}].priority", message=f"Priority '{priority}' is v0.1 format. Use p0–p3 in v0.2 (p0=critical, p3=nice-to-have).", severity="warning"))
        elif priority not in valid_priorities:
            errors.append(ValidationError(path=f"features[{i}].priority", message=f"Invalid priority '{priority}'. Use p0, p1, p2, or p3.", severity="error"))
    if feature.get("status") and feature["status"] not in valid_statuses:
        errors.append(ValidationError(path=f"features[{i}].status", message=f"Invalid status '{feature['status']}'. Use: planned, wip, live, deprecated.", severity="error"))
    # Validate bridge references if engineering section exists
    eng = data.get("engineering", {})
    related = feature.get("related", {})
    if related and eng:
        pattern_ids = {p["id"] for p in eng.get("implementation_patterns", [])}
        constraint_ids = {c["id"] for c in eng.get("constraints", [])}
        for ref in related.get("patterns", []):
            if ref.get("id") and ref["id"] not in pattern_ids:
                warnings.append(ValidationError(path=f"features[{i}].related.patterns", message=f"Pattern '{ref['id']}' not found in engineering.implementation_patterns", severity="warning"))
        for ref in related.get("constraints", []):
            if ref.get("id") and ref["id"] not in constraint_ids:
                warnings.append(ValidationError(path=f"features[{i}].related.constraints", message=f"Constraint '{ref['id']}' not found in engineering.constraints", severity="warning"))

# Engineering section validation
eng = data.get("engineering", {})
if eng:
    valid_severities = {"critical", "high", "medium", "low"}
    valid_dep_rels = {"publishes_to", "subscribes_to", "calls", "depends_on", "imports"}
    repo_ids = {r["id"] for r in eng.get("architecture", {}).get("repositories", [])}

    for dep in eng.get("architecture", {}).get("dependencies", []):
        for side in ("from", "to"):
            if dep.get(side) and dep[side] not in repo_ids:
                warnings.append(ValidationError(path="engineering.architecture.dependencies", message=f"Dependency references unknown repository id '{dep[side]}'", severity="warning"))
        if dep.get("relationship") and dep["relationship"] not in valid_dep_rels:
            errors.append(ValidationError(path="engineering.architecture.dependencies", message=f"Invalid dependency relationship '{dep['relationship']}'", severity="error"))

    for i, c in enumerate(eng.get("constraints", [])):
        if not c.get("id"):
            errors.append(ValidationError(path=f"engineering.constraints[{i}]", message="Constraint missing required field: id", severity="error"))
        if not c.get("rule"):
            errors.append(ValidationError(path=f"engineering.constraints[{i}].rule", message="Constraint missing required field: rule", severity="error"))
        if not c.get("reason"):
            warnings.append(ValidationError(path=f"engineering.constraints[{i}].reason", message=f"Constraint '{c.get('id', i)}' has no reason — add context so future developers understand why", severity="warning"))
        if c.get("severity") and c["severity"] not in valid_severities:
            errors.append(ValidationError(path=f"engineering.constraints[{i}].severity", message=f"Invalid severity '{c['severity']}'. Use: critical, high, medium, low.", severity="error"))

    for i, lesson in enumerate(eng.get("lessons_learned", [])):
        if not lesson.get("id"):
            errors.append(ValidationError(path=f"engineering.lessons_learned[{i}]", message="Lesson missing required field: id", severity="error"))
        if not lesson.get("correct_approach"):
            warnings.append(ValidationError(path=f"engineering.lessons_learned[{i}].correct_approach", message=f"Lesson '{lesson.get('id', i)}' missing correct_approach — this is the most important field", severity="warning"))

# Completeness score
score = 0
if "$schema" in data: score += 5
if "meta" in data: score += 5
if "product" in data:
    score += 10
    p = data["product"]
    if p.get("description"): score += 5
    if p.get("category"): score += 3
    pos = p.get("positioning", {})
    if pos.get("problem"): score += 4
    if pos.get("solution"): score += 4
    if pos.get("target_audience"): score += 4
if data.get("features"): score += 12
if data.get("workflows"): score += 8
if data.get("brand"): score += 5
if data.get("tech_stack"): score += 5
if data.get("integrations"): score += 5
# Engineering bonuses
if eng.get("architecture", {}).get("repositories"): score += 8
if eng.get("constraints"): score += 8
if eng.get("lessons_learned"): score += 5
if eng.get("implementation_patterns"): score += 5

return ValidationResult(valid=len(errors) == 0, errors=errors, warnings=warnings, completeness_score=min(score, 100))
```

# ── Markdown export ───────────────────────────────────────────────────────────

def export_pkml_to_markdown(pkml: dict) -> str:
“”“Export PKML v0.2 document to human-readable Markdown.”””
lines = []
product = pkml.get(“product”, {})

```
lines += [f"# {product.get('name', 'Product')}", "", f"**{product.get('tagline', '')}**", ""]

if product.get("description"):
    lines += [product["description"], ""]

if product.get("category"):
    lines += [f"**Categories:** {', '.join(product['category'])}", ""]

if product.get("website"):
    lines += [f"**Website:** [{product['website']}]({product['website']})"]
if product.get("repository"):
    lines += [f"**Repository:** [{product['repository']}]({product['repository']})"]
if product.get("website") or product.get("repository"):
    lines.append("")

pos = product.get("positioning", {})
if pos:
    lines += ["## Problem & Solution", ""]
    if pos.get("problem"): lines += [f"**Problem:** {pos['problem']}", ""]
    if pos.get("solution"): lines += [f"**Solution:** {pos['solution']}", ""]
    if pos.get("target_audience"): lines += [f"**Target Audience:** {pos['target_audience']}", ""]
    if pos.get("differentiators"):
        lines += ["**Differentiators:**"] + [f"- {d}" for d in pos["differentiators"]] + [""]

features = pkml.get("features", [])
if features:
    lines += ["## Features", ""]
    priority_labels = {"p0": "P0 — Critical", "p1": "P1 — High", "p2": "P2 — Medium", "p3": "P3 — Nice to have",
                      "primary": "Primary", "secondary": "Secondary"}
    status_icons = {"live": "✅", "wip": "🔧", "planned": "📋", "deprecated": "❌"}
    for f in features:
        priority = priority_labels.get(f.get("priority", ""), "")
        status = status_icons.get(f.get("status", ""), "")
        badge = f" [{priority}]" if priority else ""
        icon = f" {status}" if status else ""
        lines += [f"### {f.get('name', 'Feature')}{badge}{icon}", ""]
        if f.get("description"): lines += [f.get("description"), ""]
        if f.get("user_benefit"): lines += [f"**Benefit:** {f['user_benefit']}", ""]
        if f.get("introduced"): lines += [f"**Introduced:** {f['introduced']}", ""]

workflows = pkml.get("workflows", [])
if workflows:
    lines += ["## Workflows", ""]
    for w in workflows:
        lines += [f"### {w.get('name', 'Workflow')}", "", w.get("description", ""), ""]
        steps = w.get("steps", [])
        if steps:
            for step in steps:
                actor = f" *(Actor: {step['actor']})*" if step.get("actor") else ""
                lines.append(f"{step.get('order', '')}. {step.get('action', '')}{actor}")
            lines.append("")
        if w.get("outcome"): lines += [f"**Outcome:** {w['outcome']}", ""]

tech_stack = pkml.get("tech_stack", {})
if tech_stack:
    lines += ["## Tech Stack", ""]
    if isinstance(tech_stack, list):
        by_layer: Dict[str, list] = {}
        for item in tech_stack:
            by_layer.setdefault(item.get("layer", "other"), []).append(item.get("technology", ""))
        for layer, techs in by_layer.items():
            lines.append(f"**{layer.title()}:** {', '.join(t for t in techs if t)}")
    else:
        for cat, items in tech_stack.items():
            if items:
                lines.append(f"**{cat.replace('_', ' ').title()}:** {', '.join(items)}")
    lines.append("")

integrations = pkml.get("integrations", [])
if integrations:
    lines += ["## Integrations", ""]
    for intg in integrations:
        name = intg.get("service") or intg.get("name", "")
        purpose = intg.get("purpose") or intg.get("description", "")
        critical = " *(required)*" if intg.get("critical") or intg.get("required") else ""
        lines.append(f"- **{name}**{critical}: {purpose}")
    lines.append("")

# Engineering section
eng = pkml.get("engineering", {})
if eng:
    lines += ["---", "", "## Engineering Knowledge", ""]

    repos = eng.get("architecture", {}).get("repositories", [])
    if repos:
        lines += ["### Architecture", ""]
        for repo in repos:
            owner = repo.get("ownership", {})
            lang = f" · {repo['language']}" if repo.get("language") else ""
            fw = f"/{repo['framework']}" if repo.get("framework") else ""
            contact = f" · {owner['primary_contact']}" if owner.get("primary_contact") else ""
            channel = f" ({owner['slack_channel']})" if owner.get("slack_channel") else ""
            lines += [f"**{repo.get('name', repo.get('id'))}**{lang}{fw}{contact}{channel}",
                      f"  {repo.get('role', '')}", ""]

    constraints = eng.get("constraints", [])
    if constraints:
        lines += ["### Constraints", ""]
        sev_icons = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢"}
        for c in constraints:
            icon = sev_icons.get(c.get("severity", "medium"), "⚪")
            lines += [f"{icon} **`{c.get('id')}`** — {c.get('context', '')}",
                      f"  **Rule:** {c.get('rule', '')}",
                      f"  **Reason:** {c.get('reason', '')}"]
            alts = [a.get("name", "") for a in c.get("approved_alternatives", [])]
            if alts: lines.append(f"  **Use instead:** {', '.join(alts)}")
            lines.append("")

    lessons = eng.get("lessons_learned", [])
    if lessons:
        lines += ["### Lessons Learned", ""]
        for l in lessons:
            flag = " ⚠️ **NEVER FORGET**" if l.get("never_forget") else ""
            lines += [f"**`{l.get('id')}`**{flag}" + (f" · {l['date']}" if l.get("date") else ""),
                      f"- **What happened:** {l.get('what_happened', '')}",
                      f"- **Correct approach:** {l.get('correct_approach', '')}", ""]

    patterns = eng.get("implementation_patterns", [])
    if patterns:
        lines += ["### Implementation Patterns", ""]
        for p in patterns:
            status = p.get("status", "active")
            lines += [f"**{p.get('name')}** (`{p.get('id')}`) — *{status}*",
                      f"  When to use: {p.get('when_to_use', '')}"]
            if p.get("steps"):
                lines.append(f"  Steps ({len(p['steps'])}): " + " → ".join(
                    f"[{s.get('repository','')}] {s.get('action','')[:40]}" for s in p["steps"][:3]))
            lines.append("")

meta = pkml.get("meta", {})
lines += ["---", "",
          f"*v{meta.get('version', '1.0.0')} · PKML {meta.get('pkml_version', '0.2')} · {meta.get('last_updated', '')}*"]

return "\n".join(lines)
```

# ── README parsing ────────────────────────────────────────────────────────────

async def parse_readme_to_pkml_ai(readme: str) -> dict:
now = datetime.now(timezone.utc).isoformat()
api_key = os.environ.get(“ANTHROPIC_API_KEY”)
if not api_key:
return parse_readme_to_pkml_regex(readme)
try:
system = (
“You are a PKML v0.2 expert. Extract structured product knowledge from the README and return ONLY “
“valid JSON matching the PKML v0.2 schema. Required: $schema (must be ‘https://pkml.dev/schema/v0.2.json’), “
“meta (version, pkml_version=‘0.2’, last_updated), product (name, tagline). “
“Include features with priority (p0-p3), status (planned/wip/live/deprecated), and positioning if inferable. “
“Return ONLY JSON — no prose, no markdown fences.”
)
async with httpx.AsyncClient(timeout=30.0) as http:
response = await http.post(
“https://api.anthropic.com/v1/messages”,
headers={“x-api-key”: api_key, “anthropic-version”: “2023-06-01”, “content-type”: “application/json”},
json={“model”: “claude-haiku-4-5-20251001”, “max_tokens”: 4000, “system”: system,
“messages”: [{“role”: “user”, “content”: readme[:8000]}]},
)
response.raise_for_status()
raw = response.json()[“content”][0][“text”].strip()
raw = re.sub(r”^`[a-z]*\n?", "", raw) raw = re.sub(r"\n?`$”, “”, raw.strip())
return json.loads(raw)
except Exception as e:
logger.warning(f”AI README parsing failed ({e}), falling back to regex”)
return parse_readme_to_pkml_regex(readme)

def parse_readme_to_pkml_regex(readme: str) -> dict:
lines = readme.split(”\n”)
name, tagline, description, features = “MyProduct”, “”, “”, []
for line in lines:
if line.startswith(”# “): name = line[2:].strip(); break
for line in lines:
stripped = line.strip()
if stripped and not stripped.startswith(”#”) and not tagline:
tagline = stripped[:120]
elif stripped and not stripped.startswith(”#”) and tagline and not description:
description = stripped
if stripped.startswith(”- “) or stripped.startswith(”* “):
text = stripped[2:].strip()
if text and len(features) < 8:
features.append({“id”: f”feat_{len(features)+1}”, “name”: text[:60],
“description”: text, “user_benefit”: “Improves productivity”,
“priority”: “p1” if len(features) < 3 else “p2”})
now = datetime.now(timezone.utc).isoformat()
return {
“$schema”: “https://pkml.dev/schema/v0.2.json”,
“meta”: {“version”: “1.0.0”, “pkml_version”: “0.2”, “last_updated”: now},
“product”: {“name”: name, “tagline”: tagline or f”{name} — describe your product”,
“description”: description, “category”: [“productivity”]},
“features”: features or [{“id”: “feat_1”, “name”: “Core Feature”,
“description”: “Describe your main feature”,
“user_benefit”: “What users gain”, “priority”: “p0”}]
}

# ── Registry seeding ──────────────────────────────────────────────────────────

SEED_DOCUMENTS = [
{
“title”: “TaskFlow”,
“slug”: “taskflow”,
“tags”: [“saas”, “productivity”, “collaboration”],
“stars”: 24, “views”: 312,
“content”: {
“$schema”: “https://pkml.dev/schema/v0.2.json”,
“meta”: {“version”: “1.2.0”, “pkml_version”: “0.2”, “last_updated”: “2025-03-01T10:00:00Z”, “authors”: [”@sarah”]},
“product”: {
“name”: “TaskFlow”, “tagline”: “Project management for remote teams”,
“description”: “Real-time collaboration for project management. See what teammates are working on, update tasks instantly.”,
“category”: [“productivity”, “collaboration”],
“positioning”: {“problem”: “Remote teams lose context working asynchronously”, “solution”: “Real-time task visibility with live updates”, “target_audience”: “Remote-first software teams of 5-50 people”}
},
“features”: [
{“id”: “feat_kanban”, “name”: “Real-time Kanban Board”, “description”: “Collaborative board with live cursors”, “user_benefit”: “Eliminate status meetings”, “priority”: “p0”, “status”: “live”},
{“id”: “feat_assignments”, “name”: “Smart Assignments”, “description”: “Workload-balanced task assignment”, “user_benefit”: “Distribute work evenly”, “priority”: “p1”, “status”: “live”},
],
“tech_stack”: {“frontend”: [“React”, “TypeScript”], “backend”: [“Node.js”, “Express”], “databases”: [“PostgreSQL”, “Redis”]},
}
},
{
“title”: “CCC — Code Context Compiler”,
“slug”: “ccc-contextcompiler”,
“tags”: [“devtool”, “ai”, “cli”],
“stars”: 11, “views”: 89,
“content”: {
“$schema”: “https://pkml.dev/schema/v0.2.json”,
“meta”: {“version”: “0.1.0”, “pkml_version”: “0.2”, “last_updated”: “2025-03-10T10:00:00Z”, “authors”: [”@benneberg”], “generated”: True},
“product”: {
“name”: “CCC”, “tagline”: “Turn any codebase into structured, LLM-ready knowledge”,
“description”: “CCC scans repositories and generates .llm-context/ files — structured context that lets LLMs understand your code.”,
“category”: [“developer-tool”, “cli”],
“repository”: “https://github.com/benneberg/contextcompiler”,
“positioning”: {“problem”: “LLMs need the right context to help with code, but codebases are too large”, “solution”: “Automated extraction of routes, schemas, dependencies, symbols”, “target_audience”: “Developers using AI coding tools”}
},
“features”: [
{“id”: “feat_index”, “name”: “Single-scan File Index”, “description”: “One filesystem scan shared by all generators”, “user_benefit”: “Fast even on 100k+ file repos”, “priority”: “p0”, “status”: “live”},
{“id”: “feat_pkml”, “name”: “PKML Bootstrap”, “description”: “ccc pkml generates a pkml.json draft from code”, “user_benefit”: “One command to start your PKML”, “priority”: “p1”, “status”: “live”},
{“id”: “feat_workspace”, “name”: “Workspace Mode”, “description”: “Coordinate across multiple repositories”, “user_benefit”: “Understand cross-service dependencies”, “priority”: “p1”, “status”: “live”},
],
“tech_stack”: {“backend”: [“Python”], “testing”: [“pytest”]},
}
},
{
“title”: “InvoiceFlow”,
“slug”: “invoiceflow”,
“tags”: [“saas”, “fintech”, “b2b”],
“stars”: 7, “views”: 54,
“content”: {
“$schema”: “https://pkml.dev/schema/v0.2.json”,
“meta”: {“version”: “1.4.2”, “pkml_version”: “0.2”, “last_updated”: “2025-02-20T10:00:00Z”, “authors”: [”@john”]},
“product”: {
“name”: “InvoiceFlow”, “tagline”: “Automated invoicing for B2B SaaS companies”,
“description”: “Automates invoice generation, delivery, and payment tracking. Integrates with your billing system.”,
“category”: [“SaaS”, “B2B”, “FinTech”],
“positioning”: {“problem”: “B2B companies waste 10+ hours/week on manual invoicing”, “solution”: “Fully automated invoicing with async PDF generation”, “target_audience”: “Finance teams at B2B SaaS companies with 50+ customers”}
},
“features”: [
{“id”: “bulk_export”, “name”: “Bulk Invoice Export”, “description”: “Export hundreds of invoices at once”, “user_benefit”: “Monthly billing in seconds not hours”, “priority”: “p1”, “status”: “live”},
{“id”: “reconciliation”, “name”: “Auto Payment Reconciliation”, “description”: “Match payments to invoices automatically”, “user_benefit”: “Saves 5+ hours per week”, “priority”: “p0”, “status”: “live”},
],
“tech_stack”: {“backend”: [“Python”, “Django”, “Celery”], “databases”: [“PostgreSQL”, “Redis”]},
}
},
]

async def seed_registry() -> None:
count = await db.pkml_documents.count_documents({“published”: True})
if count > 0:
return
logger.info(“Seeding registry with example documents…”)
now = datetime.now(timezone.utc).isoformat()
for seed in SEED_DOCUMENTS:
if await db.pkml_documents.find_one({“slug”: seed[“slug”]}):
continue
doc_id = str(uuid.uuid4())
await db.pkml_documents.insert_one({
“_id”: doc_id, “title”: seed[“title”], “slug”: seed[“slug”],
“content”: seed[“content”], “published”: True,
“tags”: seed[“tags”], “stars”: seed[“stars”], “views”: seed[“views”],
“created_at”: now, “updated_at”: now,
})
logger.info(f”  Seeded: {seed[‘title’]}”)

# ── API Routes ────────────────────────────────────────────────────────────────

@api_router.get(”/”)
async def root():
return {“message”: “PKML Platform API v0.2.0”, “status”: “operational”}

@api_router.get(”/pkml/schema”)
async def get_schema():
return {“schema_url”: “https://pkml.dev/schema/v0.2.json”, “version”: “0.2”}

@api_router.post(”/pkml/validate”, response_model=ValidationResult)
async def validate_pkml_endpoint(request: PKMLValidateRequest):
data = safe_json_load(request.content)
return validate_pkml(data)

@api_router.post(”/pkml/parse-readme”)
async def parse_readme(request: ReadmeImportRequest):
pkml = await parse_readme_to_pkml_ai(request.readme_content)
return {“pkml”: pkml, “ai_powered”: bool(os.environ.get(“ANTHROPIC_API_KEY”))}

@api_router.post(”/pkml/export-markdown”)
async def export_markdown(request: ExportMarkdownRequest):
data = safe_json_load(request.pkml_content)
return {“markdown”: export_pkml_to_markdown(data)}

@api_router.post(”/pkml/save”)
async def save_pkml(request: SavePKMLRequest):
content = safe_json_load(request.content)
now = datetime.now(timezone.utc).isoformat()
doc_id = str(uuid.uuid4())
product_name = content.get(“product”, {}).get(“name”, “Untitled”)
slug = make_slug(product_name, doc_id)
if await db.pkml_documents.find_one({“slug”: slug}):
slug = f”{slug}-{doc_id[:6]}”
await db.pkml_documents.insert_one({
“_id”: doc_id, “title”: request.title or product_name, “slug”: slug,
“content”: content, “published”: request.published, “tags”: request.tags,
“stars”: 0, “views”: 0, “created_at”: now, “updated_at”: now,
})
return {“id”: doc_id, “slug”: slug, “share_url”: f”/view/{slug}”}

@api_router.put(”/pkml/save/{doc_id}”)
async def update_pkml(doc_id: str, request: SavePKMLRequest):
content = safe_json_load(request.content)
now = datetime.now(timezone.utc).isoformat()
product_name = content.get(“product”, {}).get(“name”, “Untitled”)
result = await db.pkml_documents.update_one(
{”_id”: doc_id},
{”$set”: {“content”: content, “title”: request.title or product_name,
“published”: request.published, “updated_at”: now}}
)
if result.matched_count == 0:
raise HTTPException(status_code=404, detail=“Document not found”)
doc = await db.pkml_documents.find_one({”_id”: doc_id})
return {“id”: doc_id, “slug”: doc[“slug”], “share_url”: f”/view/{doc[‘slug’]}”}

@api_router.get(”/pkml/document/{slug}”)
async def get_pkml(slug: str):
doc = (await db.pkml_documents.find_one({“slug”: slug}) or
await db.pkml_documents.find_one({”_id”: slug}))
if not doc:
raise HTTPException(status_code=404, detail=“Document not found”)
await db.pkml_documents.update_one({”_id”: doc[”_id”]}, {”$inc”: {“views”: 1}})
return doc_to_response(doc)

@api_router.get(”/pkml/my-documents”)
async def my_documents():
docs = await db.pkml_documents.find({}).sort(“updated_at”, -1).limit(100).to_list(100)
return [doc_to_response(d) for d in docs]

@api_router.delete(”/pkml/document/{doc_id}”)
async def delete_pkml(doc_id: str):
result = await db.pkml_documents.delete_one({”_id”: doc_id})
if result.deleted_count == 0:
raise HTTPException(status_code=404, detail=“Document not found”)
return {“deleted”: True}

@api_router.post(”/pkml/publish/{doc_id}”)
async def publish_pkml(doc_id: str):
result = await db.pkml_documents.update_one({”_id”: doc_id}, {”$set”: {“published”: True}})
if result.matched_count == 0:
raise HTTPException(status_code=404, detail=“Document not found”)
doc = await db.pkml_documents.find_one({”_id”: doc_id})
return {“published”: True, “slug”: doc[“slug”]}

@api_router.post(”/pkml/unpublish/{doc_id}”)
async def unpublish_pkml(doc_id: str):
result = await db.pkml_documents.update_one({”_id”: doc_id}, {”$set”: {“published”: False}})
if result.matched_count == 0:
raise HTTPException(status_code=404, detail=“Document not found”)
return {“published”: False}

@api_router.post(”/pkml/star/{doc_id}”)
async def star_pkml(doc_id: str):
await db.pkml_documents.update_one({”_id”: doc_id}, {”$inc”: {“stars”: 1}})
doc = await db.pkml_documents.find_one({”_id”: doc_id})
return {“stars”: doc[“stars”] if doc else 0}

@api_router.get(”/pkml/registry”)
async def get_registry(search: Optional[str] = None, category: Optional[str] = None,
sort: str = “stars”, limit: int = 50, skip: int = 0):
query: Dict[str, Any] = {“published”: True}
if search:
query[”$or”] = [
{“title”: {”$regex”: search, “$options”: “i”}},
{“tags”: {”$in”: [search.lower()]}},
{“content.product.tagline”: {”$regex”: search, “$options”: “i”}},
{“content.product.category”: {”$in”: [search.lower()]}},
]
if category and category != “all”:
query[“content.product.category”] = {”$in”: [category]}
sort_key = sort if sort in (“stars”, “views”) else “updated_at”
docs = await db.pkml_documents.find(query).sort(sort_key, -1).skip(skip).limit(limit).to_list(limit)
return [doc_to_response(d) for d in docs]

# ── Startup / Shutdown ────────────────────────────────────────────────────────

@app.on_event(“startup”)
async def startup():
await db.pkml_documents.create_index(“slug”, unique=True)
await db.pkml_documents.create_index(“published”)
await db.pkml_documents.create_index(“updated_at”)
await db.pkml_documents.create_index(“stars”)
await seed_registry()

@app.on_event(“shutdown”)
async def shutdown():
client.close()

# ── App setup ─────────────────────────────────────────────────────────────────

app.include_router(api_router)
app.add_middleware(
CORSMiddleware,
allow_origins=os.environ.get(“CORS_ORIGINS”, “*”).split(”,”),
allow_credentials=True, allow_methods=[”*”], allow_headers=[”*”],
)