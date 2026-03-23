from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import re
import httpx
import uuid
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

# 1. Initial konfiguration och Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# 2. Databasanslutning
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'pkml_platform')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# 3. FastAPI App & Router
app = FastAPI(title="PKML Platform API", version="0.1.0")
api_router = APIRouter(prefix="/api")

# 4. PKML JSON Schema v0.1
PKML_SCHEMA = {
    "$schema": "https://pkml.dev/schema/v0.1.json",
    "type": "object",
    "required": ["$schema", "meta", "product"],
    "properties": {
        "$schema": {
            "type": "string",
            "description": "PKML schema URL"
        },
        "meta": {
            "type": "object",
            "required": ["version", "pkml_version", "last_updated"],
            "properties": {
                "version": {"type": "string", "pattern": r"^\d+\.\d+\.\d+$"},
                "pkml_version": {"type": "string", "pattern": r"^\d+\.\d+\.\d+$"},
                "last_updated": {"type": "string", "format": "date-time"},
                "created_at": {"type": "string", "format": "date-time"},
                "author": {"type": "string"},
                "license": {"type": "string"}
            }
        },
        "product": {
            "type": "object",
            "required": ["name", "tagline"],
            "properties": {
                "name": {"type": "string", "minLength": 1},
                "tagline": {"type": "string", "minLength": 1},
                "description": {"type": "string"},
                "category": {"type": "array", "items": {"type": "string"}},
                "website": {"type": "string", "format": "uri"},
                "repository": {"type": "string", "format": "uri"},
                "positioning": {
                    "type": "object",
                    "properties": {
                        "problem": {"type": "string"},
                        "solution": {"type": "string"},
                        "target_audience": {"type": "string"},
                        "competitive_advantage": {"type": "string"},
                        "differentiators": {"type": "array", "items": {"type": "string"}}
                    }
                }
            }
        },
        "features": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["id", "name", "description", "user_benefit", "priority"],
                "properties": {
                    "id": {"type": "string"},
                    "name": {"type": "string"},
                    "description": {"type": "string"},
                    "user_benefit": {"type": "string"},
                    "priority": {"type": "string", "enum": ["primary", "secondary", "tertiary"]},
                    "evidence": {
                        "type": "object",
                        "properties": {
                            "screenshots": {"type": "array", "items": {"type": "string"}},
                            "videos": {"type": "array"},
                            "documentation": {"type": "string"}
                        }
                    },
                    "technical_details": {"type": "string"},
                    "keywords": {"type": "array", "items": {"type": "string"}},
                    "related_features": {"type": "array", "items": {"type": "string"}}
                }
            }
        },
        "workflows": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["id", "name", "description", "difficulty", "steps", "outcome"],
                "properties": {
                    "id": {"type": "string"},
                    "name": {"type": "string"},
                    "description": {"type": "string"},
                    "difficulty": {"type": "string", "enum": ["beginner", "intermediate", "advanced"]},
                    "estimated_time": {"type": "string"},
                    "steps": {"type": "array"},
                    "outcome": {"type": "string"}
                }
            }
        },
        "ui_patterns": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["id", "name", "type", "description", "evidence"],
                "properties": {
                    "id": {"type": "string"},
                    "name": {"type": "string"},
                    "type": {"type": "string"},
                    "description": {"type": "string"},
                    "evidence": {"type": "object"},
                    "context": {"type": "string"},
                    "interaction": {"type": "string"}
                }
            }
        },
        "brand": {
            "type": "object",
            "properties": {
                "visual": {"type": "object"},
                "voice": {"type": "object"}
            }
        },
        "tech_stack": {
            "type": "object",
            "properties": {
                "frontend": {"type": "array", "items": {"type": "string"}},
                "backend": {"type": "array", "items": {"type": "string"}},
                "infrastructure": {"type": "array", "items": {"type": "string"}},
                "databases": {"type": "array", "items": {"type": "string"}},
                "monitoring": {"type": "array", "items": {"type": "string"}},
                "testing": {"type": "array", "items": {"type": "string"}}
            }
        },
        "integrations": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["id", "name", "category"],
                "properties": {
                    "id": {"type": "string"},
                    "name": {"type": "string"},
                    "category": {"type": "string"},
                    "description": {"type": "string"},
                    "required": {"type": "boolean"}
                }
            }
        },
        "evidence": {
            "type": "object",
            "properties": {
                "screenshots": {"type": "array"},
                "videos": {"type": "array"},
                "recordings": {"type": "array"}
            }
        }
    }
}

# 5. Pydantic Modeller
class ValidationError(BaseModel):
    path: str
    message: str
    severity: str = "error"

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

class SavePKMLRequest(BaseModel):
    content: str
    title: Optional[str] = None
    published: bool = False
    tags: List[str] = []

# 6. Hjälpfunktioner (Validering, AI, Regex, Markdown)

def validate_pkml(data: dict) -> ValidationResult:
    """Validate PKML document against schema"""
    errors = []
    warnings = []

    if "$schema" not in data:
        errors.append(ValidationError(path="$schema", message="Missing required field: $schema"))

    if "meta" not in data:
        errors.append(ValidationError(path="meta", message="Missing required field: meta"))
    else:
        meta = data["meta"]
        for f in ["version", "pkml_version", "last_updated"]:
            if f not in meta:
                errors.append(ValidationError(path=f"meta.{f}", message=f"Missing field: {f}"))

    if "product" not in data:
        errors.append(ValidationError(path="product", message="Missing required field: product"))
    else:
        product = data["product"]
        if not product.get("name"):
            errors.append(ValidationError(path="product.name", message="Missing name"))
        if not product.get("tagline"):
            errors.append(ValidationError(path="product.tagline", message="Missing tagline"))

    if "features" in data:
        for i, feature in enumerate(data["features"]):
            if "id" not in feature:
                errors.append(ValidationError(path=f"features[{i}].id", message="Feature missing id"))
            if "evidence" not in feature:
                warnings.append(ValidationError(path=f"features[{i}].evidence", message="No evidence", severity="warning"))

    # Beräkna completeness
    score = 0
    if "$schema" in data: score += 5
    if "meta" in data: score += 10
    if "product" in data: score += 15
    if "features" in data and len(data["features"]) > 0: score += 15
    # ... fler poäng kan läggas till här
    
    return ValidationResult(
        valid=len(errors) == 0,
        errors=errors,
        warnings=warnings,
        completeness_score=min(score, 100)
    )

def parse_readme_to_pkml_regex(readme: str) -> dict:
    lines = readme.split('\n')
    name = "MyProduct"
    tagline = ""
    description = ""
    features = []

    for line in lines:
        if line.startswith('# '):
            name = line[2:].strip()
            break

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

async def parse_readme_to_pkml_ai(readme: str) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return parse_readme_to_pkml_regex(readme)

    system_prompt = "You are a PKML expert. Extract product knowledge from README into JSON."
    user_prompt = f"Convert this README to PKML JSON. Updated at: {now}. README:\n{readme[:8000]}"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={"x-api-key": api_key, "anthropic-version": "2023-06-01"},
                json={
                    "model": "claude-3-haiku-20240307", # Uppdaterad modellnamn för 2024
                    "max_tokens": 4096,
                    "system": system_prompt,
                    "messages": [{"role": "user", "content": user_prompt}],
                },
            )
            response.raise_for_status()
            raw = response.json()["content"][0]["text"].strip()
            # Clean potential markdown
            raw = re.sub(r'^```[a-z]*\n?', '', raw)
            raw = re.sub(r'\n?```$', '', raw.strip())
            return json.loads(raw)
    except Exception as e:
        logger.warning(f"AI parsing failed ({e}), falling back to regex")
        return parse_readme_to_pkml_regex(readme)

def export_pkml_to_markdown(pkml: dict) -> str:
    lines = []
    product = pkml.get("product", {})
    lines.append(f"# {product.get('name', 'Product')}\n")
    lines.append(f"**{product.get('tagline', '')}**\n")
    if product.get("description"):
        lines.append(product["description"] + "\n")
    
    features = pkml.get("features", [])
    if features:
        lines.append("## Features\n")
        for f in features:
            lines.append(f"### {f.get('name')}\n{f.get('description')}\n")
            
    return "\n".join(lines)

def make_slug(name: str, doc_id: str) -> str:
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    return slug or doc_id[:8]

def doc_to_response(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id", doc.get("id", "")))
    return doc

# 7. Example Templates
PKML_EXAMPLES = [
    {
        "id": "minimal",
        "name": "Minimal PKML",
        "description": "The simplest valid PKML document",
        "category": "starter",
        "content": {
            "$schema": "https://pkml.dev/schema/v0.1.json",
            "meta": {"version": "1.0.0", "pkml_version": "0.1.0", "last_updated": "2024-01-15T10:00:00Z"},
            "product": {"name": "QuickNote", "tagline": "Fast note-taking", "category": ["productivity"]}
        }
    },
    # Här kan du lägga in de andra exemplen (task-manager, dev-tool etc) från ditt original
]

# 8. API Endpoints
@api_router.get("/")
async def root():
    return {"message": "PKML Platform API v0.1.0", "status": "operational"}

@api_router.get("/pkml/schema")
async def get_schema():
    return PKML_SCHEMA

@api_router.post("/pkml/validate", response_model=ValidationResult)
async def validate_pkml_endpoint(request: PKMLValidateRequest):
    try:
        data = json.loads(request.content)
        return validate_pkml(data)
    except json.JSONDecodeError as e:
        return ValidationResult(valid=False, errors=[ValidationError(path="root", message=f"Invalid JSON: {e}")])

@api_router.post("/pkml/parse-readme")
async def parse_readme(request: ReadmeImportRequest):
    pkml = await parse_readme_to_pkml_ai(request.readme_content)
    ai_powered = bool(os.environ.get("ANTHROPIC_API_KEY"))
    return {"pkml": pkml, "ai_powered": ai_powered}

@api_router.post("/pkml/export-markdown")
async def export_markdown(request: ExportMarkdownRequest):
    try:
        pkml = json.loads(request.pkml_content)
        return {"markdown": export_pkml_to_markdown(pkml)}
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {e}")

@api_router.post("/pkml/save")
async def save_pkml(request: SavePKMLRequest):
    try:
        content = json.loads(request.content)
        now = datetime.now(timezone.utc).isoformat()
        doc_id = str(uuid.uuid4())
        slug = make_slug(content.get("product", {}).get("name", "Untitled"), doc_id)
        
        document = {
            "_id": doc_id,
            "title": request.title or content.get("product", {}).get("name", "Untitled"),
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
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/pkml/document/{slug}")
async def get_pkml_by_slug(slug: str):
    doc = await db.pkml_documents.find_one({"slug": slug})
    if not doc:
        doc = await db.pkml_documents.find_one({"_id": slug})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.pkml_documents.update_one({"_id": doc["_id"]}, {"$inc": {"views": 1}})
    return doc_to_response(doc)

# 9. Registrera router och Middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
