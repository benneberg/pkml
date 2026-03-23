# PKML — Product Knowledge Markup Language

**A structured, machine-readable format for capturing what your product is, what it does, and how it’s built.**

PKML v0.2 is an open standard and web platform for creating, editing, and sharing product knowledge files. A `pkml.json` gives AI tools, documentation systems, and developers a precise, structured understanding of your product — including the engineering team’s accumulated knowledge that never makes it into code comments.

-----

## What Is PKML?

Most products are poorly described in a way machines can understand. README files are written for humans. Source code describes implementation, not intent. When you give an LLM access to your codebase, it knows *how* the code works — but not *what* the product is supposed to do, *why* certain decisions were made, or what your team learned the hard way.

PKML solves this with a single structured file split into two clear halves:

```
product section      What the product IS
                     name, tagline, positioning, features, workflows, brand, tech stack

engineering section  How to BUILD it
                     constraints, lessons learned, architecture map, implementation patterns,
                     decision log, glossary, coordination rules
```

This is the missing layer between “here’s the code” and “here’s what we’re building and why.”

-----

## The Platform

A web application for creating, validating, publishing, and discovering PKML files.

### Editor

Monaco-based JSON editor with live v0.2 schema validation. Shows errors, warnings, and a completeness score (0–100%) as you type.

**Toolbar actions:**

- **New** — start a fresh PKML document
- **Import README** — paste any README.md, AI generates a PKML draft (Claude when `ANTHROPIC_API_KEY` is set, regex fallback otherwise)
- **Import File** — drag-and-drop or browse for an existing `pkml.json`. Don’t have one? [Generate it from your codebase with CCC →](https://github.com/benneberg/contextcompiler)
- **Generate Example** — load a template from the gallery
- **Format** — auto-format JSON
- **Export MD** — export to human-readable Markdown (includes the engineering section)
- **Download** — save as `product-name.pkml.json`
- **Save** — persist to MongoDB (updates existing if loaded from My Documents)
- **Share** — copy a direct link to your published document
- **Publish** — make discoverable in the Registry

### Builder

Visual form-based editor covering the full schema — no JSON required. Changes sync instantly to the Editor.

**Product sections:**

- **Meta** — document version, authors, generated flag
- **Product** — name, tagline, description, categories, website, repository, positioning (problem / solution / target audience / differentiators)
- **Features** — id, name, description, user benefit, priority (p0–p3), status (planned / wip / live / deprecated), introduced date
- **Workflows** — step-by-step user journeys with actor, system response, error paths
- **Tech Stack** — frontend, backend, databases, infrastructure, monitoring, testing
- **Integrations** — third-party services with critical flag
- **Brand & Voice** — primary/secondary colours with swatches, fonts, tone, vocabulary

**Engineering sections:**

- **Architecture — Repositories** — id, name, role, language, framework, owner
- **Constraints** — rule, reason, severity (critical / high / medium / low), context, approved alternatives
- **Lessons Learned** — what happened, correct approach, never-forget flag

### Gallery

Five starter templates loaded locally (no network request):

|Template           |Category|Notes                                                                                        |
|-------------------|--------|---------------------------------------------------------------------------------------------|
|Minimal PKML       |starter |Bare minimum valid document                                                                  |
|Task Management App|saas    |Full product section with features and workflows                                             |
|InvoiceFlow        |saas    |Complete v0.2 with engineering section — constraints, lessons learned, architecture, patterns|
|Developer CLI Tool |devtool |CLI product with Rust/Node stack                                                             |
|API Service        |api     |REST API with integrations                                                                   |

### My Documents

Lists all your saved PKMLs. From here you can:

- **Edit** — loads the document into the Editor; Save correctly updates the existing document (not a new one)
- **Publish / Unpublish** — toggle Registry visibility
- **View** — open the public share page
- **Delete** — with confirmation, warns if the document is published

### Registry

Public registry of published PKMLs — searchable, sortable, forkable.

- Search by name, tagline, category, or tag
- Sort by stars, views, or recency
- Star any entry
- Fork into your Editor to customise
- Each published document gets a shareable URL: `/view/:slug`

Seeded on first startup with three example documents (TaskFlow, CCC, InvoiceFlow) so the registry is never empty.

### View Page (`/view/:slug`)

Full rendered view of a published PKML including:

- Product hero with stats (stars, views, last updated)
- Positioning, features with priority/status badges, workflows with actor annotations
- Tech stack (handles both v0.2 array and legacy object formats)
- Full engineering section — architecture map, constraints with severity badges, lessons learned with never-forget highlighting, implementation patterns summary
- Raw JSON toggle
- GitHub badge generator
- Fork & Customize button

-----

## PKML v0.2 Schema

### Required fields

```
$schema       "https://pkml.dev/schema/v0.2.json"
meta          version (semver), pkml_version ("0.2"), last_updated (ISO 8601)
product       name, tagline
```

### Product section

```
product.description          2-3 sentence description
product.category[]           e.g. ["SaaS", "B2B"]
product.website              URI
product.repository           URI
product.positioning          problem*, solution*, target_audience, differentiators[]
features[]                   id, name, description, user_benefit
                             priority: p0|p1|p2|p3  (p0=critical, p3=nice-to-have)
                             status: planned|wip|live|deprecated
                             introduced: date
                             related.patterns[], related.constraints[], related.technical_debt[]
workflows[]                  id, name, steps[{order, action, actor, system_response}]
                             happy_path, error_paths[]
ui_patterns[]                id, name, component, screenshot, bounding_boxes[]
brand                        colors{}, typography{}, voice, tone
tech_stack                   array of {layer, technology, version, purpose}
                             (legacy object format also accepted)
integrations[]               service, purpose, critical, documentation
evidence                     screenshots[], videos[]
```

### Engineering section

```
engineering.architecture
  repositories[]             id, name, url, role, language, framework, ownership{team, primary_contact, slack_channel}, critical_paths[]
  dependencies[]             from, to, relationship (publishes_to|subscribes_to|calls|depends_on|imports), critical, coordination_required, notes

engineering.implementation_patterns[]
  id, name, when_to_use, status (active|deprecated|experimental)
  steps[{order, action, repository, estimated_time, why, reference_file, code_snippet, validation}]
  examples[{feature, outcome (success|failure|partial), what_went_wrong, rolled_back}]
  history[{version, introduced, changes, reason}]

engineering.constraints[]
  id, type (library_restriction|architecture_rule|business_rule|performance|security|compliance)
  context, rule, reason, severity (critical|high|medium|low)
  discovered, incident, approved_alternatives[]
  validation{method, tool, enforced_in, enforcement_level}

engineering.technical_debt[]
  id, location, issue, priority, refactor_when, estimated_effort, benefit, blocked_by

engineering.lessons_learned[]
  id, date, what_happened, what_was_tried, why_it_failed, correct_approach
  incident, never_forget, related_pattern, related_constraint

engineering.decision_log[]
  id, date, decision, context, alternatives_considered[], why_this_choice, owner, status

engineering.glossary[]
  term, definition, aliases[], not_to_be_confused_with, implementation_note, threshold

engineering.coordination[]
  trigger, notify[{team, contact, lead_time, reason}]

validation_rules[]           rule_id, applies_to, check, severity, message
```

-----

## Completeness Score

|Section                              |Points |
|-------------------------------------|-------|
|`$schema` present                    |5      |
|`meta` complete                      |5      |
|`product` core                       |10     |
|`product.description`                |5      |
|`product.category`                   |3      |
|`positioning.problem`                |4      |
|`positioning.solution`               |4      |
|`positioning.target_audience`        |4      |
|`features`                           |12     |
|`workflows`                          |8      |
|`brand`                              |5      |
|`tech_stack`                         |5      |
|`integrations`                       |5      |
|`engineering.architecture`           |8      |
|`engineering.constraints`            |8      |
|`engineering.lessons_learned`        |5      |
|`engineering.implementation_patterns`|5      |
|**Total**                            |**100**|

-----

## Relationship to CCC

PKML and [CCC (Code Context Compiler)](https://github.com/benneberg/contextcompiler) are complementary tools designed to work together but independently useful on their own.

|             |PKML                     |CCC                        |
|-------------|-------------------------|---------------------------|
|**Describes**|What the product *is*    |How the code *works*       |
|**Input**    |Human-written knowledge  |Source code repositories   |
|**Output**   |`pkml.json`              |`.llm-context/` files      |
|**Runs as**  |Web platform             |Python CLI                 |
|**Audience** |Developers, PMs, founders|Developers, AI coding tools|

**Together:** CCC answers *“how is this built?”* — PKML answers *“what does this do and why?”*. An LLM with both can understand a product completely — the technical facts and the institutional knowledge.

**Workflow:**

```bash
# In your repository
ccc generate        # extract code intelligence → .llm-context/
ccc pkml            # bootstrap pkml.json draft from that context
                    # → product-knowledge/pkml.json

# Open in PKML editor to add the human knowledge code can't express:
# positioning, user benefits, constraints, lessons learned
```

`ccc pkml` reads the generated `.llm-context/` files (routes, schemas, tech stack, external dependencies) and produces a `pkml.json` draft with real data pre-filled. You then refine it in the PKML editor.

-----

## Architecture

```
backend/
  server.py                FastAPI — v0.2 validation, persistence, registry, AI import,
                           markdown export (including engineering section)

frontend/src/
  App.js                   Router — Editor, Builder, Gallery, My Documents, Registry, View
                           Manages shared pkmlContent and activeDocId/Slug state
  pages/
    EditorPage.jsx         Monaco editor, validation panel, all toolbar actions,
                           Import README, Import File (drag-drop), Save/Publish/Share
    BuilderPage.jsx        Full visual form builder — product + engineering sections
    GalleryPage.jsx        Template browser (local, no network)
    MyDocumentsPage.jsx    List, edit, publish/unpublish, delete saved documents
    RegistryPage.jsx       Public registry with search, sort, star, fork
    ViewPage.jsx           Share link destination — renders full v0.2 document
  lib/
    pkmlSchema.js          v0.2 JSON Schema, Monaco config, DEFAULT_PKML template
    pkmlExamples.js        5 gallery templates including full InvoiceFlow v0.2 example
```

**Stack:** FastAPI + MongoDB (Motor async driver) · React 19 + Tailwind CSS + Monaco Editor + shadcn/ui

### API Reference

|Method|Endpoint                   |Purpose                                                  |
|------|---------------------------|---------------------------------------------------------|
|GET   |`/api/`                    |Health check                                             |
|GET   |`/api/pkml/schema`         |PKML JSON Schema v0.2                                    |
|POST  |`/api/pkml/validate`       |Validate + completeness score                            |
|POST  |`/api/pkml/parse-readme`   |README → PKML draft (AI-powered)                         |
|POST  |`/api/pkml/export-markdown`|PKML → Markdown docs                                     |
|POST  |`/api/pkml/save`           |Create new document                                      |
|PUT   |`/api/pkml/save/:id`       |Update existing document                                 |
|GET   |`/api/pkml/document/:slug` |Fetch by slug (increments views)                         |
|GET   |`/api/pkml/my-documents`   |List all documents                                       |
|DELETE|`/api/pkml/document/:id`   |Delete document                                          |
|POST  |`/api/pkml/publish/:id`    |Publish to registry                                      |
|POST  |`/api/pkml/unpublish/:id`  |Remove from registry                                     |
|POST  |`/api/pkml/star/:id`       |Star a document                                          |
|GET   |`/api/pkml/registry`       |Search registry (`?search=&category=&sort=&limit=&skip=`)|

-----

## Running Locally

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload
```

```bash
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
ANTHROPIC_API_KEY=          # optional — enables AI-powered README import
```

**`frontend/.env`:**

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

On first startup the registry is automatically seeded with three example documents (TaskFlow, CCC, InvoiceFlow) if the registry is empty.

-----

## Status

**Fully functional.** All pages, API endpoints, and the v0.2 schema are implemented and working.

- ✅ PKML v0.2 schema with full engineering section
- ✅ Editor with live validation, completeness scoring, all toolbar actions
- ✅ Builder covering the full schema including engineering sections
- ✅ Gallery with 5 templates (including full v0.2 InvoiceFlow reference)
- ✅ My Documents — list, edit, publish/unpublish, delete
- ✅ Registry with search, sort, star, fork, seeded on startup
- ✅ View page rendering full v0.2 including engineering section
- ✅ File import (drag-drop `pkml.json`) with CCC workflow link
- ✅ README import (AI + regex fallback)
- ✅ Markdown export including engineering section
- ✅ Save correctly updates existing documents when editing from My Documents

## Roadmap

**Next**

- Implementation patterns in Builder (step editor form)
- Decision log + glossary in Builder
- `ccc pkml` auto-populates `engineering.constraints` from code analysis

**Later**

- GitHub Action — auto-update PKML on push
- Collaborative editing
- PKML as a versioned published standard with a JSON Schema registry

-----

## License

MIT
