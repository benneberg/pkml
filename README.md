# PKML — Product Knowledge Markup Language

**A structured, machine-readable format for capturing what your product is, what it does, and how it works.**

PKML is an open standard and web platform for creating, editing, and sharing product knowledge files. A `pkml.json` gives AI tools, documentation systems, and developers a precise, structured understanding of your product — without reading thousands of lines of source code or marketing copy.

-----

## What Is PKML?

Most products are poorly described in a way machines can understand.

README files are written for humans. Marketing pages are written for conversion. Source code describes implementation, not intent. When you give an LLM access to your codebase, it can read the code — but it doesn’t know what the product is *supposed* to do, who it’s for, or what matters most.

PKML solves this by giving every product a single, structured knowledge file:

```json
{
  "$schema": "https://pkml.dev/schema/v0.1.json",
  "meta": {
    "version": "1.0.0",
    "pkml_version": "0.1.0",
    "last_updated": "2025-03-14T10:00:00Z",
    "author": "Your Name"
  },
  "product": {
    "name": "TaskFlow",
    "tagline": "Project management for remote teams",
    "description": "TaskFlow brings real-time collaboration to project management.",
    "category": ["productivity", "collaboration"],
    "website": "https://taskflow.dev",
    "positioning": {
      "problem": "Remote teams lose context working asynchronously",
      "solution": "Real-time task visibility with live updates",
      "target_audience": "Remote-first software teams of 5-50 people"
    }
  },
  "features": [
    {
      "id": "feat_kanban",
      "name": "Real-time Kanban Board",
      "description": "Collaborative board with live cursor tracking",
      "user_benefit": "See what teammates are working on, eliminate status meetings",
      "priority": "primary"
    }
  ],
  "tech_stack": {
    "frontend": ["React", "TypeScript"],
    "backend": ["Node.js", "Express"],
    "databases": ["PostgreSQL", "Redis"]
  }
}
```

This file is readable by humans, usable by LLMs, version-controllable, and composable across products and teams.

-----

## The Platform

The PKML platform is a web application for creating, validating, publishing, and discovering PKML files.

### Editor

A Monaco-based JSON editor with live validation against the PKML schema. As you type, the editor shows errors, warnings, and a completeness score (0–100%) indicating how much of the schema you’ve filled in.

The completeness score rewards:

- Core product info (name, tagline, description, positioning) — up to 35 points
- Features — 15 points
- Workflows — 10 points
- Brand — 10 points
- Tech stack and integrations — 10 points
- Schema and meta fields — 20 points

### Builder

A visual form-based editor for building PKML without writing JSON directly. Collapsible sections cover every part of the schema:

- **Meta** — version, author, license
- **Product** — name, tagline, description, categories, website, repository, positioning (problem, solution, target audience, differentiators)
- **Features** — id, name, description, user benefit, priority, keywords, technical details
- **Workflows** — step-by-step user journeys with difficulty, estimated time, and expected outcomes
- **Tech Stack** — frontend, backend, databases, infrastructure, monitoring, testing
- **Integrations** — third-party services with categories and required flags
- **Brand & Voice** — primary/secondary colours with live swatches, semantic colours, fonts, tone, vocabulary

Changes in the Builder sync instantly to the Editor and vice versa.

### Gallery

A collection of starter templates covering common product types:

|Template           |Category      |
|-------------------|--------------|
|Minimal PKML       |Starter       |
|Task Management App|SaaS          |
|Developer CLI Tool |Developer Tool|
|API Service        |API           |
|Mobile App         |Mobile        |

Each template can be previewed and loaded into the Editor with one click.

### Registry

A public registry of published PKML files at `registry.pkml.dev`. Anyone can browse, search, star, and fork published PKMLs.

Features:

- Search by product name, tagline, category, or tag
- Sort by stars, views, or recency
- Fork any published PKML into your editor to customise
- Each published PKML gets a shareable URL: `/view/:slug`

### Import from README

Paste any README.md and the platform generates a draft PKML automatically. When an `ANTHROPIC_API_KEY` is configured, this uses Claude to intelligently extract product name, tagline, features, tech stack, and positioning. Without a key it falls back to a regex parser.

### Export

From the Editor:

- **Download** — save as `product-name.pkml.json`
- **Export Markdown** — generate human-readable product documentation
- **Save** — persist to MongoDB with an incremental version
- **Publish** — make discoverable in the Registry with a shareable link
- **Share** — copy a direct link to your published PKML

-----

## The PKML Schema

A PKML document is a JSON file validated against the PKML v0.1 JSON Schema.

### Required fields

```
$schema    string    Must be "https://pkml.dev/schema/v0.1.json"
meta       object    version (semver), pkml_version, last_updated (ISO8601)
product    object    name (string), tagline (string)
```

### Optional sections

|Section              |Purpose                                                             |
|---------------------|--------------------------------------------------------------------|
|`product.description`|2-3 sentence description                                            |
|`product.category`   |Array of category strings                                           |
|`product.website`    |Product homepage URL                                                |
|`product.repository` |Source repository URL                                               |
|`product.positioning`|problem, solution, target_audience, differentiators                 |
|`features`           |Array of features with id, name, description, user_benefit, priority|
|`workflows`          |Step-by-step user journeys                                          |
|`ui_patterns`        |UI components with bounding boxes (for demo generation)             |
|`brand`              |Visual identity and voice guidelines                                |
|`tech_stack`         |Technology layers                                                   |
|`integrations`       |Third-party service connections                                     |
|`evidence`           |Screenshots and video references                                    |

The full JSON Schema is served at `/api/pkml/schema` and available for editor integration (VS Code, JetBrains, etc. will auto-validate any `pkml.json` file).

-----

## Relationship to CCC

PKML and [CCC (Code Context Compiler)](https://github.com/benneberg/contextcompiler) are complementary tools that work well together but are fully independent.

|                     |PKML                           |CCC                        |
|---------------------|-------------------------------|---------------------------|
|**What it describes**|What the product *is*          |How the code *works*       |
|**Input**            |Human-written product knowledge|Source code repositories   |
|**Output**           |`pkml.json`                    |`.llm-context/` files      |
|**Who uses it**      |Developers, PMs, founders      |Developers, AI coding tools|
|**Runs as**          |Web platform                   |Python CLI                 |

**They complement each other:** CCC answers *“how is this built?”* — PKML answers *“what does this do and why?”*. An LLM that has both can understand a product completely.

**The workflow:**

```bash
# In your repository
ccc generate              # extract code intelligence → .llm-context/
ccc pkml                  # bootstrap a pkml.json draft from that context
                          # → product-knowledge/pkml.json

# Then open the PKML editor to refine and publish
```

CCC’s `ccc pkml` command reads the generated `.llm-context/` files (routes, schemas, tech stack, external dependencies) and produces a `pkml.json` draft with real data pre-filled. You then open it in the PKML editor to add the human knowledge that code can’t express: positioning, user benefits, brand voice, and product intent.

-----

## Architecture

```
pkml/
├── backend/
│   └── server.py          FastAPI — validation, persistence, registry, AI import
├── frontend/
│   └── src/
│       ├── App.js          Router — Editor, Builder, Gallery, Registry, View
│       ├── pages/
│       │   ├── EditorPage.jsx     Monaco editor + validation panel
│       │   ├── BuilderPage.jsx    Visual form builder
│       │   ├── GalleryPage.jsx    Template browser
│       │   ├── RegistryPage.jsx   Public registry with search
│       │   └── ViewPage.jsx       Share link destination
│       └── lib/
│           ├── pkmlSchema.js      JSON Schema + Monaco config
│           └── pkmlExamples.js    Gallery templates
```

**Backend stack:** FastAPI + MongoDB (Motor async driver)

**Frontend stack:** React 19, Tailwind CSS, Monaco Editor, shadcn/ui, react-router-dom v7

**Database:** MongoDB — documents stored in `pkml_documents` collection with slug-based addressing

### API Endpoints

|Method|Endpoint                   |Purpose                                 |
|------|---------------------------|----------------------------------------|
|GET   |`/api/`                    |Health check                            |
|GET   |`/api/pkml/schema`         |PKML JSON Schema v0.1                   |
|POST  |`/api/pkml/validate`       |Validate + completeness score           |
|POST  |`/api/pkml/parse-readme`   |README → PKML (AI-powered)              |
|POST  |`/api/pkml/export-markdown`|PKML → Markdown docs                    |
|GET   |`/api/pkml/examples`       |Gallery templates                       |
|POST  |`/api/pkml/save`           |Save new document                       |
|PUT   |`/api/pkml/save/:id`       |Update existing document                |
|GET   |`/api/pkml/document/:slug` |Fetch by slug (share links)             |
|GET   |`/api/pkml/my-documents`   |List saved documents                    |
|DELETE|`/api/pkml/document/:id`   |Delete document                         |
|POST  |`/api/pkml/publish/:id`    |Publish to registry                     |
|POST  |`/api/pkml/unpublish/:id`  |Remove from registry                    |
|POST  |`/api/pkml/star/:id`       |Star a registry entry                   |
|GET   |`/api/pkml/registry`       |Search registry (search, category, sort)|

-----

## Running Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload
```

Requires a running MongoDB instance. Set `MONGO_URL` in `backend/.env`.

Optional: set `ANTHROPIC_API_KEY` in `backend/.env` to enable AI-powered README import.

### Frontend

```bash
cd frontend
yarn install
yarn start
```

Set `REACT_APP_BACKEND_URL` in `frontend/.env`.

-----

## Configuration

`backend/.env`:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=pkml
CORS_ORIGINS=*
ANTHROPIC_API_KEY=          # optional — enables AI README import
```

`frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

-----

## Roadmap

### Now — what’s built

- PKML Editor with live validation and completeness scoring
- Visual Builder covering the full schema
- Gallery with 5 starter templates
- Registry with MongoDB persistence, search, stars, forks
- Share links (`/view/:slug`)
- Save / Publish / Share workflow
- README import (AI-powered with Anthropic, regex fallback)
- Export to Markdown

### Next

- **My Documents page** — manage your saved PKMLs, see history
- **File upload for README import** — drag and drop instead of paste-only
- **Seeded registry** — starter examples visible before anyone publishes
- **CCC import button** — load a `pkml.json` generated by `ccc pkml` directly
- **GitHub Badge** — embeddable badge linking to your registry entry

### Later

- **Interactive Demo Generator** — turn workflows into embeddable step-through demos
- **GitHub Action** — auto-update PKML on push
- **Collaborative editing** — team ownership of a PKML document
- **PKML versioning** — track changes over time with diff view

-----

## Contributing

Contributions are welcome. Especially valuable:

- Additional gallery templates (different product types and industries)
- Improvements to the completeness scoring logic
- Language translations for the UI
- Real-world PKML examples for the registry
- Schema extensions and proposals

-----

## License

MIT — see LICENSE.

-----

## Status

**Functional and actively developed.**

The editor, builder, gallery, registry, persistence, and share links all work. The platform is usable today for creating and publishing structured product knowledge.
