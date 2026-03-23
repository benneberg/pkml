from fastapi import FastAPI, APIRouter, HTTPExceptio
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
from jsonschema import validate as jsonschema_validate, ValidationError as JSONSchemaError

# ─────────────────────────────────────────────────────────────
# Setup
# ─────────────────────────────────────────────────────────────

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────
# MongoDB
# ─────────────────────────────────────────────────────────────

mongo_url = os.environ.get("MONGO_URL")
db_name = os.environ.get("DB_NAME")

if not mongo_url or not db_name:
    raise RuntimeError("Missing MONGO_URL or DB_NAME")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# ─────────────────────────────────────────────────────────────
# FastAPI
# ─────────────────────────────────────────────────────────────

app = FastAPI(title="PKML Platform API", version="0.1.0")
api_router = APIRouter(prefix="/api")

# ─────────────────────────────────────────────────────────────
# PKML Schema (FULL)
# ─────────────────────────────────────────────────────────────

PKML_SCHEMA = {
    "$schema": "https://pkml.dev/schema/v0.1.json",
    "type": "object",
    "required": ["$schema", "meta", "product"],
    "properties": {
        "$schema": {"type": "string"},
        "meta": {
            "type": "object",
            "required": ["version", "pkml_version", "last_updated"],
            "properties": {
                "version": {"type": "string"},
                "pkml_version": {"type": "string"},
                "last_updated": {"type": "string"},
                "created_at": {"type": "string"},
                "author": {"type": "string"},
                "license": {"type": "string"}
            }
        },
        "product": {
            "type": "object",
            "required": ["name", "tagline"],
            "properties": {
                "name": {"type": "string"},
                "tagline": {"type": "string"},
                "description": {"type": "string"},
                "category": {"type": "array", "items": {"type": "string"}},
                "website": {"type": "string"},
                "repository": {"type": "string"},
            }
        },
        "features": {"type": "array"},
        "workflows": {"type": "array"},
        "ui_patterns": {"type": "array"},
        "brand": {"type": "object"},
        "tech_stack": {"type": "object"},
        "integrations": {"type": "array"},
        "evidence": {"type": "object"}
    }
}

# ─────────────────────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────────────────────

class ValidationError(BaseModel):
    path: str
    message: str
    severity: str = "error"

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

# ─────────────────────────────────────────────────────────────
# Utilities
# ─────────────────────────────────────────────────────────────

def safe_json_load(content: str):
    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")

def make_slug(name: str, doc_id: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or doc_id[:8]

def doc_to_response(doc: dict) -> dict:
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

# ─────────────────────────────────────────────────────────────
# Validation (IMPROVED)
# ─────────────────────────────────────────────────────────────

def validate_pkml(data: dict) -> ValidationResult:
    errors = []
    warnings = []

    try:
        jsonschema_validate(instance=data, schema=PKML_SCHEMA)
    except JSONSchemaError as e:
        errors.append(ValidationError(
            path=".".join(str(x) for x in e.path),
            message=e.message
        ))

    score = 0
    if "$schema" in data: score += 5
    if "meta" in data: score += 10
    if "product" in data: score += 15
    if data.get("features"): score += 15
    if data.get("workflows"): score += 10
    if data.get("tech_stack"): score += 5

    return ValidationResult(
        valid=len(errors) == 0,
        errors=errors,
        warnings=warnings,
        completeness_score=min(score, 100)
    )

# ─────────────────────────────────────────────────────────────
# README Parsing (AI + fallback)
# ─────────────────────────────────────────────────────────────

async def parse_readme_to_pkml_ai(readme: str) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    api_key = os.environ.get("ANTHROPIC_API_KEY")

    if not api_key:
        return parse_readme_to_pkml_regex(readme)

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-haiku-4-5-20251001",
                    "max_tokens": 4000,
                    "messages": [{"role": "user", "content": readme[:8000]}],
                },
            )

            response.raise_for_status()
            data = response.json()
            raw = data["content"][0]["text"].strip()

            if raw.startswith("```"):
                raw = re.sub(r"^```[a-z]*\n?", "", raw)
                raw = re.sub(r"\n?```$", "", raw.strip())

            return json.loads(raw)

    except Exception as e:
        logger.warning(f"AI parsing failed: {e}")
        return parse_readme_to_pkml_regex(readme)

def parse_readme_to_pkml_regex(readme: str) -> dict:
    lines = readme.split("\n")
    name = "MyProduct"
    features = []

    for line in lines:
        if line.startswith("# "):
            name = line[2:].strip()
            break

    for line in lines:
        if line.startswith("- "):
            features.append({
                "id": f"feat_{len(features)+1}",
                "name": line[2:60],
                "description": line[2:],
                "user_benefit": "Improves productivity",
                "priority": "primary" if len(features) < 3 else "secondary"
            })

    now = datetime.now(timezone.utc).isoformat()

    return {
        "$schema": "https://pkml.dev/schema/v0.1.json",
        "meta": {
            "version": "1.0.0",
            "pkml_version": "0.1.0",
            "last_updated": now
        },
        "product": {
            "name": name,
            "tagline": f"{name} tool"
        },
        "features": features
    }

# ─────────────────────────────────────────────────────────────
# Routes (FULL SET RESTORED)
# ─────────────────────────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"message": "PKML Platform API v0.1.0", "status": "operational"}

@api_router.post("/pkml/validate", response_model=ValidationResult)
async def validate_pkml_endpoint(request: PKMLValidateRequest):
    data = safe_json_load(request.content)
    return validate_pkml(data)

@api_router.post("/pkml/parse-readme")
async def parse_readme(request: ReadmeImportRequest):
    pkml = await parse_readme_to_pkml_ai(request.readme_content)
    return {"pkml": pkml}

@api_router.post("/pkml/save")
async def save_pkml(request: SavePKMLRequest):
    content = safe_json_load(request.content)

    now = datetime.now(timezone.utc).isoformat()
    doc_id = str(uuid.uuid4())
    product_name = content.get("product", {}).get("name", "Untitled")

    slug = make_slug(product_name, doc_id)

    if await db.pkml_documents.find_one({"slug": slug}):
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
        "created_at": now,
        "updated_at": now,
    }

    await db.pkml_documents.insert_one(document)
    return {"id": doc_id, "slug": slug}

@api_router.get("/pkml/document/{slug}")
async def get_pkml(slug: str):
    doc = await db.pkml_documents.find_one({"slug": slug}) or await db.pkml_documents.find_one({"_id": slug})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")

    await db.pkml_documents.update_one({"_id": doc["_id"]}, {"$inc": {"views": 1}})
    return doc_to_response(doc)

# ─────────────────────────────────────────────────────────────
# Registry
# ─────────────────────────────────────────────────────────────

@api_router.get("/pkml/registry")
async def get_registry():
    docs = await db.pkml_documents.find({"published": True}).to_list(50)
    return [doc_to_response(d) for d in docs]

@api_router.post("/pkml/star/{doc_id}")
async def star(doc_id: str):
    await db.pkml_documents.update_one({"_id": doc_id}, {"$inc": {"stars": 1}})
    doc = await db.pkml_documents.find_one({"_id": doc_id})
    return {"stars": doc["stars"]}

# ─────────────────────────────────────────────────────────────
# Indexes
# ─────────────────────────────────────────────────────────────

@app.on_event("startup")
async def setup_indexes():
    await db.pkml_documents.create_index("slug", unique=True)
    await db.pkml_documents.create_index("published")
    await db.pkml_documents.create_index("updated_at")
    await db.pkml_documents.create_index("stars")
    await db.pkml_documents.create_index("views")

# ─────────────────────────────────────────────────────────────

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown():
    client.close()
