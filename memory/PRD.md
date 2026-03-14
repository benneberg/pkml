# PKML Platform - Product Requirements Document

## Original Problem Statement
Build PKML (Product Knowledge Markup Language) platform - an open standard for representing structured product knowledge in machine-readable JSON format.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Monaco Editor + Shadcn UI
- **Backend**: FastAPI (Python) 
- **Database**: MongoDB (available, not actively used yet)
- **Hosting**: Kubernetes with hot-reload

## User Personas
1. **Developers** - Want to quickly create valid PKML files for their products
2. **Product Managers** - Need to document product features in structured format
3. **DevOps/Documentation Teams** - Export PKML to various formats

## Core Requirements (Static)
1. PKML Editor with JSON validation and schema enforcement
2. PKML Validator against PKML v0.1 spec
3. Visual PKML Builder (form-based UI)
4. PKML Gallery/Templates
5. Import from README.md → auto-generate PKML
6. Export PKML → Markdown documentation
7. Download PKML as JSON file
8. Local storage for draft persistence
9. No authentication required (MVP)
10. Dark theme, developer-focused UI

## What's Been Implemented (March 2026)

### Backend APIs (/api)
- `GET /api/` - Health check
- `GET /api/pkml/schema` - Get PKML JSON Schema v0.1
- `POST /api/pkml/validate` - Validate PKML with completeness scoring
- `POST /api/pkml/parse-readme` - Convert README.md to draft PKML
- `POST /api/pkml/export-markdown` - Export PKML to Markdown
- `GET /api/pkml/examples` - Get template list (4 templates)
- `GET /api/pkml/examples/{id}` - Get specific template

### Frontend Pages
1. **Editor Page** (`/`)
   - Monaco JSON editor with PKML schema validation
   - Live validation panel (errors, warnings, completeness score)
   - Toolbar: New, Import README, Generate Example, Format, Copy, Export MD, Download
   - Resizable split view (editor + validation)
   - Status bar with validation state

2. **Builder Page** (`/builder`)
   - Visual form builder with collapsible sections
   - Meta Information (version, author, license)
   - Product Information (name, tagline, description, positioning)
   - Features (dynamic list with add/remove)
   - Tech Stack (frontend, backend, databases, infrastructure)
   - Real-time sync with JSON editor

3. **Gallery Page** (`/gallery`)
   - Template cards grouped by category
   - Categories: Starter, SaaS, Developer Tool, API Service, Mobile App
   - Preview dialog with full JSON
   - "Use Template" loads into editor

### Templates Available
1. Minimal PKML (starter)
2. Task Management App (SaaS)
3. Developer CLI Tool (devtool)
4. API Service (API)
5. Mobile App (mobile) - frontend only

### Features
- Dark theme with JetBrains Mono + Manrope fonts
- Local storage draft persistence
- Toast notifications (sonner)
- Responsive sidebar navigation
- Completeness scoring (0-100%)
- Evidence warnings for features without screenshots

## Prioritized Backlog

### P0 (Done)
- [x] PKML Editor with validation
- [x] Visual Builder
- [x] Gallery/Templates
- [x] Import README
- [x] Export Markdown
- [x] Download JSON

### P1 (Next)
- [ ] File upload for README import (currently paste-only)
- [ ] Workflows section in Visual Builder
- [ ] UI Patterns section in Visual Builder
- [ ] Brand section in Visual Builder

### P2 (Future)
- [ ] User accounts & saved projects
- [ ] PKML version selection (0.1, future versions)
- [ ] CLI tool integration
- [ ] GitHub/GitLab integration
- [ ] Share PKML via link
- [ ] Collaborative editing

## Next Action Items
1. Add Workflows editing to Visual Builder
2. Add Brand/Voice section to Visual Builder
3. Add file upload option for README import
4. Consider adding user accounts for saving multiple projects
