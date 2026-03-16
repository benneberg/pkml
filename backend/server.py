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
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(**file**).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix

app = FastAPI(title=“PKML Platform API”, version=“0.1.0”)

# Create a router with the /api prefix

api_router = APIRouter(prefix=”/api”)

# PKML JSON Schema v0.1

PKML_SCHEMA = {
“$schema”: “https://pkml.dev/schema/v0.1.json”,
“type”: “object”,
“required”: [”$schema”, “meta”, “product”],
“properties”: {
“$schema”: {
“type”: “string”,
“description”: “PKML schema URL”
},
“meta”: {
“type”: “object”,
“required”: [“version”, “pkml_version”, “last_updated”],
“properties”: {
“version”: {“type”: “string”, “pattern”: “^\d+\.\d+\.\d+$”},
“pkml_version”: {“type”: “string”, “pattern”: “^\d+\.\d+\.\d+$”},
“last_updated”: {“type”: “string”, “format”: “date-time”},
“created_at”: {“type”: “string”, “format”: “date-time”},
“author”: {“type”: “string”},
“license”: {“type”: “string”}
}
},
“product”: {
“type”: “object”,
“required”: [“name”, “tagline”],
“properties”: {
“name”: {“type”: “string”, “minLength”: 1},
“tagline”: {“type”: “string”, “minLength”: 1},
“description”: {“type”: “string”},
“category”: {“type”: “array”, “items”: {“type”: “string”}},
“website”: {“type”: “string”, “format”: “uri”},
“repository”: {“type”: “string”, “format”: “uri”},
“positioning”: {
“type”: “object”,
“properties”: {
“problem”: {“type”: “string”},
“solution”: {“type”: “string”},
“target_audience”: {“type”: “string”},
“competitive_advantage”: {“type”: “string”},
“differentiators”: {“type”: “array”, “items”: {“type”: “string”}}
}
}
}
},
“features”: {
“type”: “array”,
“items”: {
“type”: “object”,
“required”: [“id”, “name”, “description”, “user_benefit”, “priority”],
“properties”: {
“id”: {“type”: “string”},
“name”: {“type”: “string”},
“description”: {“type”: “string”},
“user_benefit”: {“type”: “string”},
“priority”: {“type”: “string”, “enum”: [“primary”, “secondary”, “tertiary”]},
“evidence”: {
“type”: “object”,
“properties”: {
“screenshots”: {“type”: “array”, “items”: {“type”: “string”}},
“videos”: {“type”: “array”},
“documentation”: {“type”: “string”}
}
},
“technical_details”: {“type”: “string”},
“keywords”: {“type”: “array”, “items”: {“type”: “string”}},
“related_features”: {“type”: “array”, “items”: {“type”: “string”}}
}
}
},
“workflows”: {
“type”: “array”,
“items”: {
“type”: “object”,
“required”: [“id”, “name”, “description”, “difficulty”, “steps”, “outcome”],
“properties”: {
“id”: {“type”: “string”},
“name”: {“type”: “string”},
“description”: {“type”: “string”},
“difficulty”: {“type”: “string”, “enum”: [“beginner”, “intermediate”, “advanced”]},
“estimated_time”: {“type”: “string”},
“steps”: {“type”: “array”},
“outcome”: {“type”: “string”}
}
}
},
“ui_patterns”: {
“type”: “array”,
“items”: {
“type”: “object”,
“required”: [“id”, “name”, “type”, “description”, “evidence”],
“properties”: {
“id”: {“type”: “string”},
“name”: {“type”: “string”},
“type”: {“type”: “string”},
“description”: {“type”: “string”},
“evidence”: {“type”: “object”},
“context”: {“type”: “string”},
“interaction”: {“type”: “string”}
}
}
},
“brand”: {
“type”: “object”,
“properties”: {
“visual”: {“type”: “object”},
“voice”: {“type”: “object”}
}
},
“tech_stack”: {
“type”: “object”,
“properties”: {
“frontend”: {“type”: “array”, “items”: {“type”: “string”}},
“backend”: {“type”: “array”, “items”: {“type”: “string”}},
“infrastructure”: {“type”: “array”, “items”: {“type”: “string”}},
“databases”: {“type”: “array”, “items”: {“type”: “string”}},
“monitoring”: {“type”: “array”, “items”: {“type”: “string”}},
“testing”: {“type”: “array”, “items”: {“type”: “string”}}
}
},
“integrations”: {
“type”: “array”,
“items”: {
“type”: “object”,
“required”: [“id”, “name”, “category”],
“properties”: {
“id”: {“type”: “string”},
“name”: {“type”: “string”},
“category”: {“type”: “string”},
“description”: {“type”: “string”},
“required”: {“type”: “boolean”}
}
}
},
“evidence”: {
“type”: “object”,
“properties”: {
“screenshots”: {“type”: “array”},
“videos”: {“type”: “array”},
“recordings”: {“type”: “array”}
}
}
}
}

# Pydantic Models

class ValidationError(BaseModel):
path: str
message: str
severity: str = “error”

class ValidationResult(BaseModel):
valid: bool
errors: List[ValidationError] = []
warnings: List[ValidationError] = []
completeness_score: int = 0

class PKMLValidateRequest(BaseModel):
content: str

class ReadmeImportRequest(BaseModel):
readme_content: str

class ExportMarkdownRequest(BaseModel):
pkml_content: str

class PKMLExample(BaseModel):
id: str
name: str
description: str
category: str
content: Dict[str, Any]

def validate_pkml(data: dict) -> ValidationResult:
“”“Validate PKML document against schema”””
errors = []
warnings = []

```
# Check required fields
if "$schema" not in data:
    errors.append(ValidationError(
        path="$schema",
        message="Missing required field: $schema",
        severity="error"
    ))

if "meta" not in data:
    errors.append(ValidationError(
        path="meta",
        message="Missing required field: meta",
        severity="error"
    ))
else:
    meta = data["meta"]
    if "version" not in meta:
        errors.append(ValidationError(
            path="meta.version",
            message="Missing required field: meta.version",
            severity="error"
        ))
    if "pkml_version" not in meta:
        errors.append(ValidationError(
            path="meta.pkml_version",
            message="Missing required field: meta.pkml_version",
            severity="error"
        ))
    if "last_updated" not in meta:
        errors.append(ValidationError(
            path="meta.last_updated",
            message="Missing required field: meta.last_updated",
            severity="error"
        ))

if "product" not in data:
    errors.append(ValidationError(
        path="product",
        message="Missing required field: product",
        severity="error"
    ))
else:
    product = data["product"]
    if "name" not in product or not product.get("name"):
        errors.append(ValidationError(
            path="product.name",
            message="Missing required field: product.name",
            severity="error"
        ))
    if "tagline" not in product or not product.get("tagline"):
        errors.append(ValidationError(
            path="product.tagline",
            message="Missing required field: product.tagline",
            severity="error"
        ))

# Validate features if present
if "features" in data:
    for i, feature in enumerate(data["features"]):
        if "id" not in feature:
            errors.append(ValidationError(
                path=f"features[{i}].id",
                message=f"Feature at index {i} missing required field: id",
                severity="error"
            ))
        if "name" not in feature:
            errors.append(ValidationError(
                path=f"features[{i}].name",
                message=f"Feature at index {i} missing required field: name",
                severity="error"
            ))
        if "evidence" not in feature:
            warnings.append(ValidationError(
                path=f"features[{i}].evidence",
                message=f"Feature '{feature.get('name', i)}' has no evidence attached",
                severity="warning"
            ))

# Calculate completeness score
score = 0
max_score = 100

if "$schema" in data: score += 5
if "meta" in data: score += 10
if "product" in data:
    score += 15
    if data["product"].get("description"): score += 5
    if data["product"].get("category"): score += 5
    if data["product"].get("positioning"): score += 10
if "features" in data and len(data["features"]) > 0: score += 15
if "workflows" in data and len(data["workflows"]) > 0: score += 10
if "ui_patterns" in data and len(data["ui_patterns"]) > 0: score += 5
if "brand" in data: score += 10
if "tech_stack" in data: score += 5
if "integrations" in data: score += 5

return ValidationResult(
    valid=len(errors) == 0,
    errors=errors,
    warnings=warnings,
    completeness_score=min(score, max_score)
)
```

async def parse_readme_to_pkml_ai(readme: str) -> dict:
“”“Parse README.md using Claude AI to generate high-quality PKML”””
now = datetime.now(timezone.utc).isoformat()

```
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

if not ANTHROPIC_API_KEY:
    # Fallback to regex if no API key
    return parse_readme_to_pkml_regex(readme)

system_prompt = """You are a PKML (Product Knowledge Markup Language) expert. 
```

Your job is to analyze a README.md and extract structured product knowledge into valid PKML JSON.

PKML schema overview:

- $schema: “https://pkml.dev/schema/v0.1.json” (required, fixed string)
- meta: { version, pkml_version, last_updated, created_at, author, license }
- product: { name, tagline, description, category[], website, repository, positioning: { problem, solution, target_audience, competitive_advantage, differentiators[] } }
- features[]: { id, name, description, user_benefit, priority (primary/secondary/tertiary), keywords[], technical_details }
- workflows[]: { id, name, description, difficulty (beginner/intermediate/advanced), estimated_time, steps[], outcome }
- tech_stack: { frontend[], backend[], databases[], infrastructure[], monitoring[], testing[] }
- integrations[]: { id, name, category, description, required }

Rules:

- Extract as much information as possible from the README
- Infer reasonable values when not explicitly stated
- Feature IDs must be snake_case like feat_kanban_board
- Extract 3-8 features from the README
- If workflows are described, extract them with steps
- Detect tech stack from mentions of frameworks, languages, databases
- Return ONLY valid JSON, no markdown, no explanation”””
  
  user_prompt = f””“Convert this README to PKML JSON. The last_updated and created_at should be “{now}”.

README:
{readme[:8000]}”””

```
try:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": 4096,
                "system": system_prompt,
                "messages": [{"role": "user", "content": user_prompt}],
            },
        )
        response.raise_for_status()
        data = response.json()
        raw = data["content"][0]["text"].strip()
        
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = re.sub(r'^```[a-z]*\n?', '', raw)
            raw = re.sub(r'\n?```$', '', raw.strip())
        
        pkml = json.loads(raw)
        
        # Ensure required fields are present
        if "$schema" not in pkml:
            pkml["$schema"] = "https://pkml.dev/schema/v0.1.json"
        if "meta" not in pkml:
            pkml["meta"] = {"version": "1.0.0", "pkml_version": "0.1.0", "last_updated": now, "created_at": now}
        
        return pkml
        
except Exception as e:
    logger.warning(f"AI README parsing failed ({e}), falling back to regex parser")
    return parse_readme_to_pkml_regex(readme)
```

def parse_readme_to_pkml_regex(readme: str) -> dict:
“”“Fallback regex-based README parser”””
lines = readme.split(’\n’)
name = “MyProduct”
tagline = “”
description = “”
features = []

```
for line in lines:
    if line.startswith('# '):
        name = line[2:].strip()
        break

in_features = False
for i, line in enumerate(lines):
    stripped = line.strip()
    if not stripped.startswith('#') and stripped and not tagline:
        tagline = stripped[:120]
        continue
    if not in_features and not stripped.startswith('#') and stripped and tagline:
        if not description:
            description = stripped
    if re.match(r'^##?\s*(features|key features|what it does)', stripped.lower()):
        in_features = True
        continue
    if in_features:
        if stripped.startswith('- ') or stripped.startswith('* '):
            feature_text = stripped[2:].strip()
            if feature_text:
                features.append({
                    "id": f"feat_{len(features) + 1}",
                    "name": feature_text[:60],
                    "description": feature_text,
                    "user_benefit": "Improves productivity",
                    "priority": "primary" if len(features) < 3 else "secondary"
                })
        elif re.match(r'^##', stripped):
            in_features = False

now = datetime.now(timezone.utc).isoformat()
return {
    "$schema": "https://pkml.dev/schema/v0.1.json",
    "meta": {"version": "1.0.0", "pkml_version": "0.1.0", "last_updated": now, "created_at": now},
    "product": {
        "name": name,
        "tagline": tagline or f"{name} – add your tagline",
        "description": description or f"{name} helps you achieve more.",
        "category": ["productivity"]
    },
    "features": features or [{"id": "feat_1", "name": "Core Feature", "description": "Describe your main feature", "user_benefit": "What users gain", "priority": "primary"}]
}
```

def parse_readme_to_pkml(readme: str) -> dict:
“”“Sync wrapper — used by non-async callers”””
return parse_readme_to_pkml_regex(readme)

def export_pkml_to_markdown(pkml: dict) -> str:
“”“Export PKML to Markdown documentation”””
lines = []

```
product = pkml.get("product", {})

# Title and tagline
lines.append(f"# {product.get('name', 'Product')}")
lines.append("")
lines.append(f"**{product.get('tagline', '')}**")
lines.append("")

# Description
if product.get("description"):
    lines.append(product["description"])
    lines.append("")

# Categories
if product.get("category"):
    lines.append(f"**Categories:** {', '.join(product['category'])}")
    lines.append("")

# Links
if product.get("website"):
    lines.append(f"**Website:** [{product['website']}]({product['website']})")
if product.get("repository"):
    lines.append(f"**Repository:** [{product['repository']}]({product['repository']})")
if product.get("website") or product.get("repository"):
    lines.append("")

# Positioning
positioning = product.get("positioning", {})
if positioning:
    lines.append("## Problem & Solution")
    lines.append("")
    if positioning.get("problem"):
        lines.append(f"**Problem:** {positioning['problem']}")
        lines.append("")
    if positioning.get("solution"):
        lines.append(f"**Solution:** {positioning['solution']}")
        lines.append("")
    if positioning.get("target_audience"):
        lines.append(f"**Target Audience:** {positioning['target_audience']}")
        lines.append("")
    if positioning.get("differentiators"):
        lines.append("**Key Differentiators:**")
        for diff in positioning["differentiators"]:
            lines.append(f"- {diff}")
        lines.append("")

# Features
features = pkml.get("features", [])
if features:
    lines.append("## Features")
    lines.append("")
    
    for feature in features:
        priority_badge = f"[{feature.get('priority', 'primary').upper()}]" if feature.get('priority') else ""
        lines.append(f"### {feature.get('name', 'Feature')} {priority_badge}")
        lines.append("")
        lines.append(feature.get("description", ""))
        lines.append("")
        if feature.get("user_benefit"):
            lines.append(f"**Benefit:** {feature['user_benefit']}")
            lines.append("")
        if feature.get("keywords"):
            lines.append(f"**Keywords:** {', '.join(feature['keywords'])}")
            lines.append("")

# Workflows
workflows = pkml.get("workflows", [])
if workflows:
    lines.append("## Workflows")
    lines.append("")
    
    for workflow in workflows:
        lines.append(f"### {workflow.get('name', 'Workflow')}")
        lines.append("")
        lines.append(workflow.get("description", ""))
        lines.append("")
        if workflow.get("difficulty"):
            lines.append(f"**Difficulty:** {workflow['difficulty']}")
        if workflow.get("estimated_time"):
            lines.append(f"**Estimated Time:** {workflow['estimated_time']}")
        lines.append("")
        
        steps = workflow.get("steps", [])
        if steps:
            lines.append("**Steps:**")
            for step in steps:
                lines.append(f"{step.get('order', '')}. {step.get('action', '')}")
            lines.append("")
        
        if workflow.get("outcome"):
            lines.append(f"**Outcome:** {workflow['outcome']}")
            lines.append("")

# Tech Stack
tech_stack = pkml.get("tech_stack", {})
if tech_stack:
    lines.append("## Tech Stack")
    lines.append("")
    for category, items in tech_stack.items():
        if items:
            lines.append(f"**{category.replace('_', ' ').title()}:** {', '.join(items)}")
    lines.append("")

# Integrations
integrations = pkml.get("integrations", [])
if integrations:
    lines.append("## Integrations")
    lines.append("")
    for integration in integrations:
        required = " (Required)" if integration.get("required") else ""
        lines.append(f"- **{integration.get('name', '')}**{required}: {integration.get('description', '')}")
    lines.append("")

# Meta info
meta = pkml.get("meta", {})
if meta:
    lines.append("---")
    lines.append("")
    lines.append(f"*Document version: {meta.get('version', '1.0.0')} | PKML version: {meta.get('pkml_version', '0.1.0')} | Last updated: {meta.get('last_updated', '')}*")

return '\n'.join(lines)
```

# Example PKML templates

PKML_EXAMPLES = [
{
“id”: “minimal”,
“name”: “Minimal PKML”,
“description”: “The simplest valid PKML document with just required fields”,
“category”: “starter”,
“content”: {
“$schema”: “https://pkml.dev/schema/v0.1.json”,
“meta”: {
“version”: “1.0.0”,
“pkml_version”: “0.1.0”,
“last_updated”: “2024-01-15T10:00:00Z”
},
“product”: {
“name”: “QuickNote”,
“tagline”: “Fast note-taking for developers”,
“category”: [“productivity”, “developer-tools”]
}
}
},
{
“id”: “task-manager”,
“name”: “Task Management App”,
“description”: “Complete PKML for a project management tool with features and workflows”,
“category”: “saas”,
“content”: {
“$schema”: “https://pkml.dev/schema/v0.1.json”,
“meta”: {
“version”: “1.2.0”,
“pkml_version”: “0.1.0”,
“last_updated”: “2024-01-15T10:30:00Z”,
“created_at”: “2024-01-01T00:00:00Z”,
“author”: “TaskFlow Team”,
“license”: “CC-BY-4.0”
},
“product”: {
“name”: “TaskFlow”,
“tagline”: “Project management for remote teams”,
“description”: “TaskFlow brings real-time collaboration to project management. See what your team is working on, update tasks instantly, and ship faster.”,
“category”: [“productivity”, “collaboration”, “project-management”],
“website”: “https://taskflow.dev”,
“repository”: “https://github.com/taskflow/taskflow”,
“positioning”: {
“problem”: “Remote teams lose context when working asynchronously on tasks”,
“solution”: “Real-time task visibility with live updates and collaborative boards”,
“target_audience”: “Remote-first software teams (5-50 people)”,
“competitive_advantage”: “Only tool with sub-50ms real-time sync across all views”,
“differentiators”: [
“Real-time multiplayer editing”,
“Persistent collaborative sessions”,
“AI-powered task suggestions”
]
}
},
“features”: [
{
“id”: “feat_realtime_board”,
“name”: “Real-time Kanban Board”,
“description”: “Collaborative board with live cursor tracking and instant updates”,
“user_benefit”: “See what teammates are working on in real-time, eliminate status meetings”,
“priority”: “primary”,
“evidence”: {
“screenshots”: [“evidence/screenshots/kanban-board.png”],
“documentation”: “https://docs.taskflow.dev/features/kanban”
},
“technical_details”: “WebRTC-based peer connections with CRDT for conflict-free editing”,
“keywords”: [“kanban”, “real-time”, “collaboration”, “board”]
},
{
“id”: “feat_live_cursors”,
“name”: “Live Cursors”,
“description”: “See where your teammates are looking with live cursor indicators”,
“user_benefit”: “Know who’s reviewing what without asking”,
“priority”: “secondary”,
“keywords”: [“cursors”, “real-time”, “multiplayer”]
},
{
“id”: “feat_task_assignments”,
“name”: “Smart Task Assignments”,
“description”: “Assign tasks to team members with workload balancing”,
“user_benefit”: “Distribute work evenly across the team”,
“priority”: “primary”,
“keywords”: [“assignments”, “workload”, “team”]
}
],
“workflows”: [
{
“id”: “workflow_create_task”,
“name”: “Create Your First Task”,
“description”: “Learn how to create and assign a task in TaskFlow”,
“difficulty”: “beginner”,
“estimated_time”: “1 minute”,
“steps”: [
{
“order”: 1,
“action”: “Click the ‘New Task’ button in the top-right corner”,
“expected_outcome”: “A task creation modal appears”,
“tips”: [“You can also press ‘N’ as a keyboard shortcut”]
},
{
“order”: 2,
“action”: “Enter a task title”,
“expected_outcome”: “The task title field is populated”
},
{
“order”: 3,
“action”: “Click ‘Create Task’ button”,
“expected_outcome”: “Task appears on the board in the ‘To Do’ column”
}
],
“outcome”: “You have created your first task and it’s visible on the board”
}
],
“tech_stack”: {
“frontend”: [“React”, “TypeScript”, “Tailwind CSS”, “WebRTC”],
“backend”: [“Node.js”, “Express”, “PostgreSQL”, “Redis”],
“infrastructure”: [“Vercel”, “Railway”, “AWS S3”],
“databases”: [“PostgreSQL”, “Redis”],
“monitoring”: [“Sentry”, “Grafana”],
“testing”: [“Jest”, “Playwright”]
},
“integrations”: [
{
“id”: “int_github”,
“name”: “GitHub”,
“category”: “version-control”,
“description”: “Sync tasks with GitHub issues and pull requests”,
“required”: False
},
{
“id”: “int_slack”,
“name”: “Slack”,
“category”: “communication”,
“description”: “Get task notifications in Slack channels”,
“required”: False
}
]
}
},
{
“id”: “developer-tool”,
“name”: “Developer CLI Tool”,
“description”: “PKML for a command-line developer tool”,
“category”: “devtool”,
“content”: {
“$schema”: “https://pkml.dev/schema/v0.1.json”,
“meta”: {
“version”: “1.0.0”,
“pkml_version”: “0.1.0”,
“last_updated”: “2024-01-15T10:00:00Z”,
“author”: “DevTools Inc”
},
“product”: {
“name”: “fastbuild”,
“tagline”: “Lightning-fast build tool for modern web apps”,
“description”: “fastbuild is a next-generation build tool that leverages native code and smart caching to build your projects 10x faster.”,
“category”: [“developer-tools”, “build-tools”, “cli”],
“repository”: “https://github.com/devtools/fastbuild”,
“positioning”: {
“problem”: “Traditional build tools are slow and waste developer time”,
“solution”: “Native Rust-based bundler with intelligent caching”,
“target_audience”: “Frontend developers working on large projects”,
“differentiators”: [
“10x faster than webpack”,
“Zero-config for most projects”,
“Native ESM support”
]
}
},
“features”: [
{
“id”: “feat_fast_builds”,
“name”: “Lightning Fast Builds”,
“description”: “Build your entire project in milliseconds with native code execution”,
“user_benefit”: “Spend less time waiting, more time coding”,
“priority”: “primary”,
“keywords”: [“fast”, “performance”, “build”]
},
{
“id”: “feat_smart_cache”,
“name”: “Smart Caching”,
“description”: “Intelligent cache invalidation that only rebuilds what changed”,
“user_benefit”: “Incremental builds that feel instant”,
“priority”: “primary”,
“keywords”: [“cache”, “incremental”, “smart”]
},
{
“id”: “feat_zero_config”,
“name”: “Zero Configuration”,
“description”: “Works out of the box with sensible defaults for React, Vue, Svelte”,
“user_benefit”: “Get started immediately without config files”,
“priority”: “secondary”,
“keywords”: [“config”, “setup”, “easy”]
}
],
“tech_stack”: {
“backend”: [“Rust”, “Node.js”],
“testing”: [“cargo test”, “Jest”]
}
}
},
{
“id”: “api-service”,
“name”: “API Service”,
“description”: “PKML for a REST API service with integrations”,
“category”: “api”,
“content”: {
“$schema”: “https://pkml.dev/schema/v0.1.json”,
“meta”: {
“version”: “2.0.0”,
“pkml_version”: “0.1.0”,
“last_updated”: “2024-01-15T10:00:00Z”
},
“product”: {
“name”: “PaymentHub”,
“tagline”: “Unified payment API for modern businesses”,
“description”: “PaymentHub provides a single API to accept payments from multiple providers. Stripe, PayPal, and more through one integration.”,
“category”: [“fintech”, “api”, “payments”],
“website”: “https://paymenthub.io”,
“positioning”: {
“problem”: “Businesses need to integrate multiple payment providers separately”,
“solution”: “One API that routes to the best payment provider automatically”,
“target_audience”: “E-commerce businesses and SaaS companies”,
“competitive_advantage”: “Automatic routing for best conversion rates”
}
},
“features”: [
{
“id”: “feat_unified_api”,
“name”: “Unified Payment API”,
“description”: “Single API endpoint for all payment providers”,
“user_benefit”: “Integrate once, accept payments everywhere”,
“priority”: “primary”
},
{
“id”: “feat_smart_routing”,
“name”: “Smart Payment Routing”,
“description”: “Automatically route payments to provider with best success rate”,
“user_benefit”: “Higher conversion rates without extra work”,
“priority”: “primary”
}
],
“integrations”: [
{
“id”: “int_stripe”,
“name”: “Stripe”,
“category”: “payments”,
“description”: “Accept credit cards via Stripe”,
“required”: False
},
{
“id”: “int_paypal”,
“name”: “PayPal”,
“category”: “payments”,
“description”: “Accept PayPal payments”,
“required”: False
}
],
“tech_stack”: {
“backend”: [“Python”, “FastAPI”, “PostgreSQL”],
“infrastructure”: [“AWS”, “Docker”, “Kubernetes”],
“monitoring”: [“DataDog”, “PagerDuty”]
}
}
}
]

# API Routes

@api_router.get(”/”)
async def root():
return {“message”: “PKML Platform API v0.1.0”, “status”: “operational”}

@api_router.get(”/pkml/schema”)
async def get_schema():
“”“Get the PKML JSON Schema”””
return PKML_SCHEMA

@api_router.post(”/pkml/validate”, response_model=ValidationResult)
async def validate_pkml_endpoint(request: PKMLValidateRequest):
“”“Validate PKML content against schema”””
try:
data = json.loads(request.content)
except json.JSONDecodeError as e:
return ValidationResult(
valid=False,
errors=[ValidationError(
path=“root”,
message=f”Invalid JSON: {str(e)}”,
severity=“error”
)],
completeness_score=0
)

```
return validate_pkml(data)
```

@api_router.post(”/pkml/parse-readme”)
async def parse_readme(request: ReadmeImportRequest):
“”“Import README.md and generate draft PKML using AI”””
pkml = await parse_readme_to_pkml_ai(request.readme_content)
ai_powered = bool(os.environ.get(“ANTHROPIC_API_KEY”))
return {“pkml”: pkml, “ai_powered”: ai_powered}

@api_router.post(”/pkml/export-markdown”)
async def export_markdown(request: ExportMarkdownRequest):
“”“Export PKML to Markdown documentation”””
try:
pkml = json.loads(request.pkml_content)
except json.JSONDecodeError as e:
raise HTTPException(status_code=400, detail=f”Invalid JSON: {str(e)}”)

```
markdown = export_pkml_to_markdown(pkml)
return {"markdown": markdown}
```

@api_router.get(”/pkml/examples”, response_model=List[PKMLExample])
async def get_examples():
“”“Get PKML example templates”””
return PKML_EXAMPLES

@api_router.get(”/pkml/examples/{example_id}”)
async def get_example(example_id: str):
“”“Get a specific PKML example by ID”””
for example in PKML_EXAMPLES:
if example[“id”] == example_id:
return example
raise HTTPException(status_code=404, detail=“Example not found”)

# ─────────────────────────────────────────────────────────────────────────────

# MongoDB persistence — PKML documents

# ─────────────────────────────────────────────────────────────────────────────

class SavePKMLRequest(BaseModel):
content: str
title: Optional[str] = None
published: bool = False
tags: List[str] = []

class PKMLDocument(BaseModel):
id: str
title: str
slug: str
content: Dict[str, Any]
published: bool
tags: List[str]
stars: int
views: int
author: Optional[str]
created_at: str
updated_at: str

def make_slug(name: str, doc_id: str) -> str:
“”“Generate a URL-safe slug from product name”””
slug = re.sub(r’[^a-z0-9]+’, ‘-’, name.lower()).strip(’-’)
return slug or doc_id[:8]

def doc_to_response(doc: dict) -> dict:
“”“Convert MongoDB doc to API response”””
doc[“id”] = str(doc.pop(”_id”, doc.get(“id”, “”)))
return doc

@api_router.post(”/pkml/save”)
async def save_pkml(request: SavePKMLRequest):
“”“Save or update a PKML document. Returns document id.”””
try:
content = json.loads(request.content)
except json.JSONDecodeError as e:
raise HTTPException(status_code=400, detail=f”Invalid JSON: {e}”)

```
now = datetime.now(timezone.utc).isoformat()
product_name = content.get("product", {}).get("name", "Untitled")
doc_id = str(uuid.uuid4())
slug = make_slug(product_name, doc_id)

# Ensure slug is unique
existing = await db.pkml_documents.find_one({"slug": slug})
if existing:
    slug = f"{slug}-{doc_id[:6]}"

document = {
    "_id": doc_id,
    "title": request.title or product_name,
    "slug": slug,
    "content": content,
    "published": request.published,
    "tags": request.tags,
    "stars": 0,
    "views": 0,
    "author": content.get("meta", {}).get("author"),
    "created_at": now,
    "updated_at": now,
}

await db.pkml_documents.insert_one(document)
return {"id": doc_id, "slug": slug, "share_url": f"/view/{slug}"}
```

@api_router.put(”/pkml/save/{doc_id}”)
async def update_pkml(doc_id: str, request: SavePKMLRequest):
“”“Update an existing PKML document by id.”””
try:
content = json.loads(request.content)
except json.JSONDecodeError as e:
raise HTTPException(status_code=400, detail=f”Invalid JSON: {e}”)

```
now = datetime.now(timezone.utc).isoformat()
product_name = content.get("product", {}).get("name", "Untitled")

result = await db.pkml_documents.update_one(
    {"_id": doc_id},
    {"$set": {
        "title": request.title or product_name,
        "content": content,
        "published": request.published,
        "tags": request.tags,
        "updated_at": now,
    }}
)

if result.matched_count == 0:
    raise HTTPException(status_code=404, detail="Document not found")

doc = await db.pkml_documents.find_one({"_id": doc_id})
return {"id": doc_id, "slug": doc["slug"], "share_url": f"/view/{doc['slug']}"}
```

@api_router.get(”/pkml/document/{slug}”)
async def get_pkml_by_slug(slug: str):
“”“Get a PKML document by slug (for share links).”””
doc = await db.pkml_documents.find_one({“slug”: slug})
if not doc:
# Also try by ID
doc = await db.pkml_documents.find_one({”_id”: slug})
if not doc:
raise HTTPException(status_code=404, detail=“Document not found”)

```
# Increment view count (non-blocking)
await db.pkml_documents.update_one({"_id": doc["_id"]}, {"$inc": {"views": 1}})
return doc_to_response(doc)
```

@api_router.get(”/pkml/my-documents”)
async def list_my_documents():
“”“List all saved documents (for now all docs; auth can scope this later).”””
cursor = db.pkml_documents.find({}).sort(“updated_at”, -1).limit(50)
docs = await cursor.to_list(length=50)
return [doc_to_response(d) for d in docs]

@api_router.delete(”/pkml/document/{doc_id}”)
async def delete_pkml(doc_id: str):
“”“Delete a PKML document.”””
result = await db.pkml_documents.delete_one({”_id”: doc_id})
if result.deleted_count == 0:
raise HTTPException(status_code=404, detail=“Document not found”)
return {“deleted”: True}

# ─────────────────────────────────────────────────────────────────────────────

# Registry — published PKMLs

# ─────────────────────────────────────────────────────────────────────────────

@api_router.post(”/pkml/publish/{doc_id}”)
async def publish_pkml(doc_id: str):
“”“Publish a PKML document to the public registry.”””
result = await db.pkml_documents.update_one(
{”_id”: doc_id},
{”$set”: {“published”: True, “updated_at”: datetime.now(timezone.utc).isoformat()}}
)
if result.matched_count == 0:
raise HTTPException(status_code=404, detail=“Document not found”)
doc = await db.pkml_documents.find_one({”_id”: doc_id})
return {“published”: True, “slug”: doc[“slug”], “registry_url”: f”/registry/{doc[‘slug’]}”}

@api_router.post(”/pkml/unpublish/{doc_id}”)
async def unpublish_pkml(doc_id: str):
“”“Remove a PKML from the public registry.”””
result = await db.pkml_documents.update_one(
{”_id”: doc_id},
{”$set”: {“published”: False, “updated_at”: datetime.now(timezone.utc).isoformat()}}
)
if result.matched_count == 0:
raise HTTPException(status_code=404, detail=“Document not found”)
return {“published”: False}

@api_router.post(”/pkml/star/{doc_id}”)
async def star_pkml(doc_id: str):
“”“Star a registry entry.”””
result = await db.pkml_documents.update_one(
{”_id”: doc_id},
{”$inc”: {“stars”: 1}}
)
if result.matched_count == 0:
raise HTTPException(status_code=404, detail=“Document not found”)
doc = await db.pkml_documents.find_one({”_id”: doc_id})
return {“stars”: doc[“stars”]}

@api_router.get(”/pkml/registry”)
async def get_registry(
search: Optional[str] = None,
category: Optional[str] = None,
sort: str = “stars”,
limit: int = 50,
skip: int = 0,
):
“”“Get all published PKMLs for the registry.”””
query: Dict[str, Any] = {“published”: True}

```
if search:
    query["$or"] = [
        {"title": {"$regex": search, "$options": "i"}},
        {"tags": {"$in": [search.lower()]}},
        {"content.product.tagline": {"$regex": search, "$options": "i"}},
        {"content.product.category": {"$in": [search.lower()]}},
    ]

if category and category != "all":
    query["content.product.category"] = {"$in": [category]}

sort_field = {"stars": -1, "views": -1, "updated_at": -1}.get(sort, -1)
sort_key = sort if sort in ("stars", "views") else "updated_at"

cursor = db.pkml_documents.find(query).sort(sort_key, -1).skip(skip).limit(limit)
docs = await cursor.to_list(length=limit)
total = await db.pkml_documents.count_documents(query)

return {
    "total": total,
    "items": [doc_to_response(d) for d in docs]
}
```

# Include the router in the main app

app.include_router(api_router)

app.add_middleware(
CORSMiddleware,
allow_credentials=True,
allow_origins=os.environ.get(‘CORS_ORIGINS’, ‘*’).split(’,’),
allow_methods=[”*”],
allow_headers=[”*”],
)

# Configure logging

logging.basicConfig(
level=logging.INFO,
format=’%(asctime)s - %(name)s - %(levelname)s - %(message)s’
)
logger = logging.getLogger(**name**)

@app.on_event(“shutdown”)
async def shutdown_db_client():
client.close()
