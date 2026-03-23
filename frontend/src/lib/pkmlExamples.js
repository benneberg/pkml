// PKML Example Templates — v0.2

export const PKML_EXAMPLES = [
{
id: “minimal”,
name: “Minimal PKML”,
description: “The simplest valid PKML v0.2 document”,
category: “starter”,
icon: “FileCode”,
content: {
“$schema”: “https://pkml.dev/schema/v0.2.json”,
“meta”: {
“version”: “1.0.0”,
“pkml_version”: “0.2”,
“last_updated”: new Date().toISOString()
},
“product”: {
“name”: “QuickNote”,
“tagline”: “Fast note-taking for developers”,
“category”: [“productivity”, “developer-tools”]
}
}
},

{
id: “task-manager”,
name: “Task Management App”,
description: “Full product knowledge for a SaaS project management tool”,
category: “saas”,
icon: “CheckSquare”,
content: {
“$schema”: “https://pkml.dev/schema/v0.2.json”,
“meta”: {
“version”: “1.2.0”,
“pkml_version”: “0.2”,
“last_updated”: new Date().toISOString(),
“authors”: [”@sarah”, “@alex”],
“generated”: false
},
“product”: {
“name”: “TaskFlow”,
“tagline”: “Project management for remote teams”,
“description”: “TaskFlow brings real-time collaboration to project management. See what your team is working on, update tasks instantly, and ship faster.”,
“category”: [“productivity”, “collaboration”, “project-management”],
“website”: “https://taskflow.dev”,
“repository”: “https://github.com/taskflow/taskflow”,
“positioning”: {
“problem”: “Remote teams lose context when working asynchronously”,
“solution”: “Real-time task visibility with live updates and collaborative boards”,
“target_audience”: “Remote-first software teams of 5-50 people”,
“differentiators”: [
“Real-time multiplayer editing”,
“Sub-50ms sync across all views”,
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
“priority”: “p0”,
“status”: “live”,
“introduced”: “2023-01-15”,
“keywords”: [“kanban”, “real-time”, “collaboration”]
},
{
“id”: “feat_smart_assignments”,
“name”: “Smart Task Assignments”,
“description”: “Assign tasks with workload balancing”,
“user_benefit”: “Distribute work evenly across the team automatically”,
“priority”: “p1”,
“status”: “live”,
“keywords”: [“assignments”, “workload”, “team”]
},
{
“id”: “feat_ai_suggestions”,
“name”: “AI Task Suggestions”,
“description”: “AI-powered suggestions for task breakdown and estimates”,
“user_benefit”: “Plan work faster with intelligent recommendations”,
“priority”: “p2”,
“status”: “wip”,
“keywords”: [“ai”, “suggestions”, “planning”]
}
],
“workflows”: [
{
“id”: “workflow_create_task”,
“name”: “Create and Assign a Task”,
“description”: “The core daily workflow for team task management”,
“happy_path”: true,
“steps”: [
{ “order”: 1, “action”: “Click ‘New Task’”, “actor”: “Team member”, “system_response”: “Task creation modal opens” },
{ “order”: 2, “action”: “Enter title and assign to teammate”, “actor”: “Team member”, “system_response”: “Assignee notified in real-time” },
{ “order”: 3, “action”: “Drag task to ‘In Progress’ column”, “actor”: “Assignee”, “system_response”: “All connected users see the move instantly” }
],
“outcome”: “Task is visible to everyone and progress is tracked”
}
],
“tech_stack”: {
“frontend”: [“React”, “TypeScript”, “Tailwind CSS”, “WebRTC”],
“backend”: [“Node.js”, “Express”, “PostgreSQL”, “Redis”],
“infrastructure”: [“Vercel”, “Railway”, “AWS S3”],
“monitoring”: [“Sentry”, “Grafana”],
“testing”: [“Jest”, “Playwright”]
},
“integrations”: [
{ “service”: “GitHub”, “purpose”: “Sync tasks with issues and pull requests”, “critical”: false },
{ “service”: “Slack”, “purpose”: “Task notifications in channels”, “critical”: false }
]
}
},

{
id: “invoiceflow”,
name: “InvoiceFlow (Full v0.2)”,
description: “Complete example with engineering section — patterns, constraints, lessons learned”,
category: “saas”,
icon: “FileText”,
content: {
“$schema”: “https://pkml.dev/schema/v0.2.json”,
“meta”: {
“version”: “1.4.2”,
“pkml_version”: “0.2”,
“last_updated”: new Date().toISOString(),
“last_updated_by”: “@john”,
“authors”: [”@john”, “@sarah”],
“generated”: false
},
“product”: {
“name”: “InvoiceFlow”,
“tagline”: “Automated invoicing for B2B SaaS companies”,
“description”: “InvoiceFlow automates invoice generation, delivery, and payment tracking for B2B SaaS companies. Integrates with your billing system and handles everything from PDF generation to payment reconciliation.”,
“category”: [“SaaS”, “B2B”, “FinTech”],
“website”: “https://invoiceflow.example.com”,
“repository”: “https://github.com/acme/invoiceflow”,
“positioning”: {
“problem”: “B2B SaaS companies waste 10+ hours/week manually creating, sending, and tracking invoices”,
“solution”: “Fully automated invoicing workflow that integrates with existing billing systems”,
“target_audience”: “CFOs and finance teams at B2B SaaS companies with 50+ customers”,
“differentiators”: [
“Custom invoice templates per enterprise customer”,
“Automatic payment reconciliation”,
“Multi-currency support with real-time exchange rates”
]
}
},
“features”: [
{
“id”: “bulk_invoice_export”,
“name”: “Bulk Invoice Export”,
“description”: “Export multiple invoices at once in PDF or CSV format”,
“user_benefit”: “Accounting teams generate hundreds of invoices in seconds instead of hours”,
“priority”: “p1”,
“status”: “live”,
“introduced”: “2022-03-15”,
“related”: {
“patterns”: [{ “id”: “data_export”, “relationship”: “implements_using”, “required”: true }],
“constraints”: [
{ “id”: “no_pdfkit”, “relationship”: “must_not_violate”, “severity”: “critical” },
{ “id”: “enterprise_feature_flags”, “relationship”: “must_satisfy”, “severity”: “high” }
],
“technical_debt”: [
{ “id”: “duplicate_export_queries”, “relationship”: “should_refactor_alongside”, “optional”: true }
]
}
},
{
“id”: “payment_reconciliation”,
“name”: “Automatic Payment Reconciliation”,
“description”: “Automatically match incoming payments to outstanding invoices”,
“user_benefit”: “Eliminates manual matching, saving 5+ hours per week”,
“priority”: “p0”,
“status”: “live”,
“introduced”: “2021-06-01”
}
],
“workflows”: [
{
“id”: “monthly_billing_cycle”,
“name”: “Monthly Billing Cycle”,
“description”: “How accounting teams process end-of-month invoicing”,
“happy_path”: true,
“steps”: [
{ “order”: 1, “action”: “Select customers for billing period”, “actor”: “Accountant”, “system_response”: “Customer list with outstanding charges displayed” },
{ “order”: 2, “action”: “Click ‘Generate Invoices’”, “actor”: “Accountant”, “system_response”: “Async job created, progress shown” },
{ “order”: 3, “action”: “Monitor progress (2-5 min for 500 invoices)”, “actor”: “System”, “system_response”: “Real-time progress bar” },
{ “order”: 4, “action”: “Download bulk export as PDF or CSV”, “actor”: “Accountant”, “system_response”: “ZIP file download link provided” }
],
“outcome”: “All invoices generated and ready to send”
}
],
“tech_stack”: {
“backend”: [“Python”, “Django”, “Celery”],
“frontend”: [“TypeScript”, “React”],
“databases”: [“PostgreSQL”, “Redis”],
“infrastructure”: [“AWS”, “Docker”]
},
“engineering”: {
“meta”: {
“last_updated”: new Date().toISOString(),
“maintainers”: [”@john”, “@alex”]
},
“architecture”: {
“repositories”: [
{
“id”: “invoicing-service”,
“name”: “Invoicing Service”,
“url”: “https://github.com/acme/invoicing-service”,
“role”: “Primary business logic for invoice generation”,
“language”: “Python”,
“framework”: “Django”,
“ownership”: { “team”: “backend-team”, “primary_contact”: “@john”, “slack_channel”: “#backend” },
“critical_paths”: [“Invoice generation”, “PDF rendering”, “Data export”]
},
{
“id”: “background-tasks”,
“name”: “Background Task Processor”,
“url”: “https://github.com/acme/background-tasks”,
“role”: “Async job processing for long-running operations”,
“language”: “Python”,
“framework”: “Celery”,
“ownership”: { “team”: “backend-team”, “primary_contact”: “@alex” }
}
],
“dependencies”: [
{
“from”: “invoicing-service”,
“to”: “background-tasks”,
“relationship”: “publishes_to”,
“critical”: true,
“coordination_required”: true,
“notes”: “Job schema changes require coordination”
}
]
},
“implementation_patterns”: [
{
“id”: “data_export”,
“name”: “Data Export Pattern”,
“when_to_use”: “Adding any new data export format (PDF, CSV, Excel, etc.)”,
“status”: “active”,
“repositories_involved”: [“invoicing-service”, “background-tasks”],
“steps”: [
{ “order”: 1, “action”: “Extract shared data fetching into base class”, “repository”: “invoicing-service”, “estimated_time”: “2-3 hours”, “why”: “All exporters need identical invoice queries”, “validation”: “Unit tests for base class pass” },
{ “order”: 2, “action”: “Implement exporter class extending BaseExporter”, “repository”: “invoicing-service”, “estimated_time”: “4-6 hours”, “reference_file”: “src/exporters/csv_exporter.py” },
{ “order”: 3, “action”: “Create async Celery job”, “repository”: “background-tasks”, “estimated_time”: “2-3 hours”, “why”: “500+ invoices takes 30s+ — violates API SLA” },
{ “order”: 4, “action”: “Add feature flag for enterprise custom templates”, “repository”: “invoicing-service”, “estimated_time”: “1-2 hours” }
],
“examples”: [
{ “feature”: “CSV invoice export”, “implemented”: “2022-03-15”, “outcome”: “success”, “actual_time_taken”: “12 hours” },
{ “feature”: “Sync PDF export attempt”, “implemented”: “2021-08-10”, “outcome”: “failure”, “rolled_back”: true, “what_went_wrong”: “API timeouts for exports >100 invoices” },
{ “feature”: “Excel export”, “implemented”: “2023-09-22”, “outcome”: “success”, “actual_time_taken”: “10 hours” }
]
}
],
“constraints”: [
{
“id”: “no_pdfkit”,
“type”: “library_restriction”,
“context”: “PDF generation”,
“rule”: “Do not use pdfkit for PDF generation”,
“reason”: “Known memory leaks cause OOM errors when generating large PDF batches. Led to production outage INC-2847.”,
“severity”: “critical”,
“discovered”: “2021-08-10”,
“incident”: “INC-2847”,
“approved_alternatives”: [{ “name”: “weasyprint”, “approved_by”: “Security audit 2023-02”, “used_in”: [“invoicing-service”] }],
“validation”: { “method”: “static_analysis”, “enforced_in”: “ci”, “enforcement_level”: “blocking” }
},
{
“id”: “enterprise_feature_flags”,
“type”: “business_rule”,
“context”: “Enterprise features”,
“rule”: “All enterprise-specific functionality must be feature-flagged with per-customer override”,
“reason”: “Enterprise contracts include custom requirements that vary per customer”,
“severity”: “high”,
“validation”: { “method”: “code_review”, “enforced_in”: “pr_checklist”, “enforcement_level”: “required_approval” }
}
],
“technical_debt”: [
{
“id”: “duplicate_export_queries”,
“location”: “invoicing-service/src/exporters/”,
“issue”: “Each exporter duplicates invoice data fetching logic”,
“created”: “2022-03-15”,
“priority”: “medium”,
“refactor_when”: “When adding any new export format”,
“estimated_effort”: “2-3 hours”,
“benefit”: “Consistent data across all export formats, easier maintenance”
}
],
“lessons_learned”: [
{
“id”: “sync_export_timeout”,
“date”: “2021-08-10”,
“what_happened”: “Sync PDF export caused API timeouts for batches >100 invoices”,
“what_was_tried”: “Synchronous PDF generation in Django view handler using pdfkit”,
“why_it_failed”: “PDF generation for 500 invoices takes 45+ seconds. Also hit pdfkit memory issues.”,
“correct_approach”: “Use async Celery job. User starts export, job runs in background, download when complete.”,
“incident”: “INC-2847”,
“never_forget”: true,
“related_pattern”: “data_export”,
“related_constraint”: “no_pdfkit”
}
],
“decision_log”: [
{
“id”: “async_all_exports”,
“date”: “2022-03-15”,
“decision”: “All data exports must be processed asynchronously via background jobs”,
“context”: “After INC-2847 we learned synchronous export causes timeouts for large datasets”,
“alternatives_considered”: [“Streaming response”, “Pagination with client-side combination”],
“why_this_choice”: “Async jobs provide: no timeout risk, progress tracking, retry capability, better memory management”,
“owner”: “@john”,
“status”: “active”
}
],
“glossary”: [
{ “term”: “bulk export”, “definition”: “Exporting more than 100 invoices at once”, “threshold”: 100, “implementation_note”: “Always use async background job pattern above this threshold” },
{ “term”: “enterprise customer”, “definition”: “Customer with >$50k annual contract value”, “threshold”: 50000, “implementation_note”: “Features must be feature-flagged for per-customer customization” }
]
}
}
},

{
id: “developer-tool”,
name: “Developer CLI Tool”,
description: “PKML for a command-line developer tool”,
category: “devtool”,
icon: “Terminal”,
content: {
“$schema”: “https://pkml.dev/schema/v0.2.json”,
“meta”: {
“version”: “1.0.0”,
“pkml_version”: “0.2”,
“last_updated”: new Date().toISOString(),
“authors”: [”@dev”]
},
“product”: {
“name”: “fastbuild”,
“tagline”: “Lightning-fast build tool for modern web apps”,
“description”: “fastbuild leverages native code and smart caching to build your projects 10x faster.”,
“category”: [“developer-tools”, “build-tools”, “cli”],
“repository”: “https://github.com/devtools/fastbuild”,
“positioning”: {
“problem”: “Traditional build tools are slow and waste developer time”,
“solution”: “Native Rust-based bundler with intelligent caching”,
“target_audience”: “Frontend developers working on large projects”,
“differentiators”: [“10x faster than webpack”, “Zero-config for most projects”, “Native ESM support”]
}
},
“features”: [
{ “id”: “feat_fast_builds”, “name”: “Lightning Fast Builds”, “description”: “Build in milliseconds with native code”, “user_benefit”: “Spend less time waiting, more time coding”, “priority”: “p0”, “status”: “live” },
{ “id”: “feat_smart_cache”, “name”: “Smart Caching”, “description”: “Intelligent cache invalidation that rebuilds only what changed”, “user_benefit”: “Incremental builds that feel instant”, “priority”: “p0”, “status”: “live” },
{ “id”: “feat_zero_config”, “name”: “Zero Configuration”, “description”: “Works out of the box with sensible defaults”, “user_benefit”: “Get started immediately”, “priority”: “p1”, “status”: “live” }
],
“tech_stack”: {
“backend”: [“Rust”, “Node.js”],
“testing”: [“cargo test”, “Jest”]
}
}
},

{
id: “api-service”,
name: “API Service”,
description: “PKML for a REST API service”,
category: “api”,
icon: “Server”,
content: {
“$schema”: “https://pkml.dev/schema/v0.2.json”,
“meta”: {
“version”: “2.0.0”,
“pkml_version”: “0.2”,
“last_updated”: new Date().toISOString()
},
“product”: {
“name”: “PaymentHub”,
“tagline”: “Unified payment API for modern businesses”,
“description”: “PaymentHub provides a single API to accept payments from multiple providers through one integration.”,
“category”: [“fintech”, “api”, “payments”],
“website”: “https://paymenthub.io”,
“positioning”: {
“problem”: “Businesses need to integrate multiple payment providers separately”,
“solution”: “One API that routes to the best payment provider automatically”,
“target_audience”: “E-commerce businesses and SaaS companies”
}
},
“features”: [
{ “id”: “feat_unified_api”, “name”: “Unified Payment API”, “description”: “Single endpoint for all providers”, “user_benefit”: “Integrate once, accept payments everywhere”, “priority”: “p0”, “status”: “live” },
{ “id”: “feat_smart_routing”, “name”: “Smart Payment Routing”, “description”: “Auto-route to provider with best success rate”, “user_benefit”: “Higher conversion without extra work”, “priority”: “p0”, “status”: “live” }
],
“integrations”: [
{ “service”: “Stripe”, “purpose”: “Accept credit cards”, “critical”: true },
{ “service”: “PayPal”, “purpose”: “Accept PayPal payments”, “critical”: false }
],
“tech_stack”: {
“backend”: [“Python”, “FastAPI”, “PostgreSQL”],
“infrastructure”: [“AWS”, “Docker”, “Kubernetes”],
“monitoring”: [“DataDog”, “PagerDuty”]
}
}
}
];

export const getExampleById = (id) => PKML_EXAMPLES.find(e => e.id === id);
export const getExamplesByCategory = (category) => PKML_EXAMPLES.filter(e => e.category === category);
export const getCategories = () => […new Set(PKML_EXAMPLES.map(e => e.category))];

export const generateFreshExample = (id) => {
const example = getExampleById(id);
if (!example) return null;
const fresh = JSON.parse(JSON.stringify(example.content));
fresh.meta.last_updated = new Date().toISOString();
return fresh;
};