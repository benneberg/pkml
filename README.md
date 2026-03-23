# PKML — Product Knowledge Markup Language

**A structured, machine-readable format for capturing what your product is, what it does, and how it's built.**

PKML v0.2 is an open standard and web platform for creating, editing, and sharing product knowledge files. A `pkml.json` gives AI tools, documentation systems, and developers a precise, structured understanding of your product — and your engineering team's accumulated knowledge.

---

## What Is PKML?

Most products are poorly described in a way machines can understand. README files are written for humans. Source code describes implementation, not intent. When you give an LLM access to your codebase, it knows *how* the code works — but not *what* the product is supposed to do, or *why* certain decisions were made.

PKML solves this with a single structured file split into two clear halves:

```
product section   — What the product IS
                    name, tagline, positioning, features, workflows, brand

engineering section — How to BUILD it
                      constraints, lessons learned, architecture, patterns, decisions
```

This is the missing layer between "here's the code" and "here's what we're building and why."

---

## The Platform

A web application for creating, validating, publishing, and discovering PKML files.

### Editor
Monaco-based JSON editor with live v0.2 schema validation. Shows errors, warnings, and a completeness score (0–100%) as you type.

### Builder
Visual form-based editor covering the full schema with no JSON required:
- **Meta** — version, authors
- **Product** — name, tagline, description, positioning (problem/solution/audience/differentiators)
- **Features** — with priority (p0–p3), status (planned/wip/live/deprecated), introduced date
- **Workflows** — step-by-step user journeys with actor and system response
- **Tech Stack** — frontend, backend, databases, infrastructure
- **Integrations** — third-party services
- **Brand & Voice** — colours, typography, tone, vocabulary
- **Architecture** — repository map with roles, owners, languages
- **Constraints** — rules that must not be violated, with severity and reason
- **Lessons Learned** — historical failures with "never forget" flag for critical ones

### Gallery
Five starter templates: Minimal, Task Management SaaS, InvoiceFlow (full v0.2 with engineering section), Developer CLI Tool, API Service.

### My Documents
Your saved PKMLs — edit, publish/unpublish, delete, copy share links.

### Registry
Public registry of published PKMLs. Search by name/tagline/category, sort by stars/views/recency, fork any entry.

### Import
- **Import README** — paste any README.md and generate a PKML draft (AI-powered with Anthropic, regex fallback)
- **Import File** — upload an existing `pkml.json` directly. Don't have one? [Generate it from your codebase with CCC →](https://github.com/benneberg/contextcompiler)

---

## PKML v0.2 Schema

```
Required:   $schema, meta (version, pkml_version="0.2", last_updated), product (name, tagline)

Product:    description, category[], website, repository, positioning{problem, solution, target_audience, differentiators[]}
Features:   id, name, description, user_benefit, priority (p0–p3), status, introduced, related{patterns,constraints,technical_debt}
Workflows:  id, name, steps[{order, action, actor, system_response}], happy_path, error_paths
Brand:      colors, typography, voice, tone
Tech stack: array of {layer, technology, version, purpose}
            or legacy object {frontend[], backend[], databases[], ...}

Engineering:
  architecture:             repositories[{id,name,role,language,framework,ownership}], dependencies[]
  constraints:              id, rule, reason, severity (critical/high/medium/low), context, approved_alternatives, validation
  implementation_patterns:  id, name, when_to_use, steps[], examples[{outcome: success|failure|partial}], history[]
  technical_debt:           id, issue, location, priority, refactor_when, estimated_effort
  lessons_learned:          id, what_happened, correct_approach, never_forget, related_pattern, related_constraint
  decision_log:             id, decision, context, alternatives_considered, why_this_choice, owner
  glossary:                 term, definition, threshold, implementation_note
  coordination:             trigger, notify[{team, contact, lead_time, reason}]

validation_rules:  self-validation checks with severity and message templates
```

Full JSON Schema served at `/api/pkml/schema`.

---

## Completeness Score

| Section | Points |
|---------|--------|
| $schema present | 5 |
| meta complete | 5 |
| product core | 10 |
| product description | 5 |
| product category | 3 |
| positioning (problem/solution/audience) | 12 |
| features | 12 |
| workflows | 8 |
| brand | 5 |
| tech stack | 5 |
| integrations | 5 |
| engineering.architecture | 8 |
| engineering.constraints | 8 |
| engineering.lessons_learned | 5 |
| engineering.patterns | 5 |
| **Total** | **100** |

---

## Relationship to CCC

PKML and [CCC (Code Context Compiler)](https://github.com/benneberg/contextcompiler) are complementary tools.

| | PKML | CCC |
|---|---|---|
| **Describes** | What the product *is* | How the code *works* |
| **Input** | Human-written knowledge | Source code |
| **Output** | `pkml.json` | `.llm-context/` files |
| **Runs as** | Web platform | Python CLI |

**Together:** CCC answers *"how is this built?"* — PKML answers *"what does this do and why?"*. An LLM with both can understand a product completely.

**The workflow:**
```bash
ccc generate          # extract code intelligence → .llm-context/
ccc pkml              # bootstrap pkml.json draft from that context
# → open in PKML editor to add positioning, constraints, lessons learned
```

---

## Architecture

```
backend/server.py         FastAPI — v0.2 validation, persistence, registry, AI import, markdown export
frontend/src/
  App.js                  Router — Editor, Builder, Gallery, My Documents, Registry, View
  pages/
    EditorPage.jsx        Monaco editor + validation panel + save/publish/share + file upload
    BuilderPage.jsx       Full visual form builder including Engineering sections
    GalleryPage.jsx       Template browser
    MyDocumentsPage.jsx   Manage saved documents
    RegistryPage.jsx      Public registry with search
    ViewPage.jsx          Share link destination — renders full v0.2 including engineering
  lib/
    pkmlSchema.js         v0.2 JSON Schema + Monaco config + DEFAULT_PKML
    pkmlExamples.js       Gallery templates (5, including full InvoiceFlow v0.2 example)
```

**Stack:** FastAPI + MongoDB (Motor) · React 19 + Tailwind + Monaco + shadcn/ui

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/pkml/validate` | Validate + completeness score |
| POST | `/api/pkml/parse-readme` | README → PKML (AI-powered) |
| POST | `/api/pkml/export-markdown` | PKML → Markdown (includes engineering section) |
| POST | `/api/pkml/save` | Save new document |
| PUT | `/api/pkml/save/:id` | Update existing |
| GET | `/api/pkml/document/:slug` | Fetch by slug |
| GET | `/api/pkml/my-documents` | List all documents |
| DELETE | `/api/pkml/document/:id` | Delete |
| POST | `/api/pkml/publish/:id` | Publish to registry |
| POST | `/api/pkml/unpublish/:id` | Remove from registry |
| POST | `/api/pkml/star/:id` | Star |
| GET | `/api/pkml/registry` | Search registry |

---

## Running Locally

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload

# Frontend
cd frontend
yarn install
yarn start
```

**`backend/.env`:**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=pkml
CORS_ORIGINS=*
ANTHROPIC_API_KEY=          # optional — enables AI README import
```

**`frontend/.env`:**
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

On first startup the registry is seeded with three example documents (TaskFlow, CCC, InvoiceFlow) so it's never empty.

---

## Roadmap

**Done**
- PKML v0.2 schema with engineering section
- Editor, Builder, Gallery, My Documents, Registry, View pages
- Save / Publish / Share workflow
- File upload import with CCC link
- README import (AI + regex fallback)
- Export to Markdown (including engineering section)
- Registry seeding on first startup
- v0.2 validator with bridge reference checking

**Next**
- Implementation patterns in Builder (step editor)
- Decision log in Builder
- `ccc pkml` auto-populates engineering.constraints from code analysis

**Later**
- GitHub Action — auto-update PKML on push
- Collaborative editing
- Interactive demo generator from workflows

---

## License

MIT