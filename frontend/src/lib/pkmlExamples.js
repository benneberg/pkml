// PKML Example Templates

export const PKML_EXAMPLES = [
  {
    id: "minimal",
    name: "Minimal PKML",
    description: "The simplest valid PKML document with just required fields",
    category: "starter",
    icon: "FileCode",
    content: {
      "$schema": "https://pkml.dev/schema/v0.1.json",
      "meta": {
        "version": "1.0.0",
        "pkml_version": "0.1.0",
        "last_updated": new Date().toISOString()
      },
      "product": {
        "name": "QuickNote",
        "tagline": "Fast note-taking for developers",
        "category": ["productivity", "developer-tools"]
      }
    }
  },
  {
    id: "task-manager",
    name: "Task Management App",
    description: "Complete PKML for a project management tool with features, workflows, and integrations",
    category: "saas",
    icon: "CheckSquare",
    content: {
      "$schema": "https://pkml.dev/schema/v0.1.json",
      "meta": {
        "version": "1.2.0",
        "pkml_version": "0.1.0",
        "last_updated": new Date().toISOString(),
        "created_at": "2024-01-01T00:00:00Z",
        "author": "TaskFlow Team",
        "license": "CC-BY-4.0"
      },
      "product": {
        "name": "TaskFlow",
        "tagline": "Project management for remote teams",
        "description": "TaskFlow brings real-time collaboration to project management. See what your team is working on, update tasks instantly, and ship faster.",
        "category": ["productivity", "collaboration", "project-management"],
        "website": "https://taskflow.dev",
        "repository": "https://github.com/taskflow/taskflow",
        "positioning": {
          "problem": "Remote teams lose context when working asynchronously on tasks",
          "solution": "Real-time task visibility with live updates and collaborative boards",
          "target_audience": "Remote-first software teams (5-50 people)",
          "competitive_advantage": "Only tool with sub-50ms real-time sync across all views",
          "differentiators": [
            "Real-time multiplayer editing",
            "Persistent collaborative sessions",
            "AI-powered task suggestions"
          ]
        }
      },
      "features": [
        {
          "id": "feat_realtime_board",
          "name": "Real-time Kanban Board",
          "description": "Collaborative board with live cursor tracking and instant updates",
          "user_benefit": "See what teammates are working on in real-time, eliminate status meetings",
          "priority": "primary",
          "evidence": {
            "screenshots": ["evidence/screenshots/kanban-board.png"],
            "documentation": "https://docs.taskflow.dev/features/kanban"
          },
          "technical_details": "WebRTC-based peer connections with CRDT for conflict-free editing",
          "keywords": ["kanban", "real-time", "collaboration", "board"]
        },
        {
          "id": "feat_live_cursors",
          "name": "Live Cursors",
          "description": "See where your teammates are looking with live cursor indicators",
          "user_benefit": "Know who's reviewing what without asking",
          "priority": "secondary",
          "keywords": ["cursors", "real-time", "multiplayer"]
        },
        {
          "id": "feat_task_assignments",
          "name": "Smart Task Assignments",
          "description": "Assign tasks to team members with workload balancing",
          "user_benefit": "Distribute work evenly across the team",
          "priority": "primary",
          "keywords": ["assignments", "workload", "team"]
        }
      ],
      "workflows": [
        {
          "id": "workflow_create_task",
          "name": "Create Your First Task",
          "description": "Learn how to create and assign a task in TaskFlow",
          "difficulty": "beginner",
          "estimated_time": "1 minute",
          "steps": [
            {
              "order": 1,
              "action": "Click the 'New Task' button in the top-right corner",
              "expected_outcome": "A task creation modal appears",
              "tips": ["You can also press 'N' as a keyboard shortcut"]
            },
            {
              "order": 2,
              "action": "Enter a task title",
              "expected_outcome": "The task title field is populated"
            },
            {
              "order": 3,
              "action": "Click 'Create Task' button",
              "expected_outcome": "Task appears on the board in the 'To Do' column"
            }
          ],
          "outcome": "You have created your first task and it's visible on the board"
        }
      ],
      "tech_stack": {
        "frontend": ["React", "TypeScript", "Tailwind CSS", "WebRTC"],
        "backend": ["Node.js", "Express", "PostgreSQL", "Redis"],
        "infrastructure": ["Vercel", "Railway", "AWS S3"],
        "databases": ["PostgreSQL", "Redis"],
        "monitoring": ["Sentry", "Grafana"],
        "testing": ["Jest", "Playwright"]
      },
      "integrations": [
        {
          "id": "int_github",
          "name": "GitHub",
          "category": "version-control",
          "description": "Sync tasks with GitHub issues and pull requests",
          "required": false
        },
        {
          "id": "int_slack",
          "name": "Slack",
          "category": "communication",
          "description": "Get task notifications in Slack channels",
          "required": false
        }
      ]
    }
  },
  {
    id: "developer-tool",
    name: "Developer CLI Tool",
    description: "PKML template for a command-line developer tool",
    category: "devtool",
    icon: "Terminal",
    content: {
      "$schema": "https://pkml.dev/schema/v0.1.json",
      "meta": {
        "version": "1.0.0",
        "pkml_version": "0.1.0",
        "last_updated": new Date().toISOString(),
        "author": "DevTools Inc"
      },
      "product": {
        "name": "fastbuild",
        "tagline": "Lightning-fast build tool for modern web apps",
        "description": "fastbuild is a next-generation build tool that leverages native code and smart caching to build your projects 10x faster.",
        "category": ["developer-tools", "build-tools", "cli"],
        "repository": "https://github.com/devtools/fastbuild",
        "positioning": {
          "problem": "Traditional build tools are slow and waste developer time",
          "solution": "Native Rust-based bundler with intelligent caching",
          "target_audience": "Frontend developers working on large projects",
          "differentiators": [
            "10x faster than webpack",
            "Zero-config for most projects",
            "Native ESM support"
          ]
        }
      },
      "features": [
        {
          "id": "feat_fast_builds",
          "name": "Lightning Fast Builds",
          "description": "Build your entire project in milliseconds with native code execution",
          "user_benefit": "Spend less time waiting, more time coding",
          "priority": "primary",
          "keywords": ["fast", "performance", "build"]
        },
        {
          "id": "feat_smart_cache",
          "name": "Smart Caching",
          "description": "Intelligent cache invalidation that only rebuilds what changed",
          "user_benefit": "Incremental builds that feel instant",
          "priority": "primary",
          "keywords": ["cache", "incremental", "smart"]
        },
        {
          "id": "feat_zero_config",
          "name": "Zero Configuration",
          "description": "Works out of the box with sensible defaults for React, Vue, Svelte",
          "user_benefit": "Get started immediately without config files",
          "priority": "secondary",
          "keywords": ["config", "setup", "easy"]
        }
      ],
      "tech_stack": {
        "backend": ["Rust", "Node.js"],
        "testing": ["cargo test", "Jest"]
      }
    }
  },
  {
    id: "api-service",
    name: "API Service",
    description: "PKML for a REST API service with integrations",
    category: "api",
    icon: "Server",
    content: {
      "$schema": "https://pkml.dev/schema/v0.1.json",
      "meta": {
        "version": "2.0.0",
        "pkml_version": "0.1.0",
        "last_updated": new Date().toISOString()
      },
      "product": {
        "name": "PaymentHub",
        "tagline": "Unified payment API for modern businesses",
        "description": "PaymentHub provides a single API to accept payments from multiple providers. Stripe, PayPal, and more through one integration.",
        "category": ["fintech", "api", "payments"],
        "website": "https://paymenthub.io",
        "positioning": {
          "problem": "Businesses need to integrate multiple payment providers separately",
          "solution": "One API that routes to the best payment provider automatically",
          "target_audience": "E-commerce businesses and SaaS companies",
          "competitive_advantage": "Automatic routing for best conversion rates"
        }
      },
      "features": [
        {
          "id": "feat_unified_api",
          "name": "Unified Payment API",
          "description": "Single API endpoint for all payment providers",
          "user_benefit": "Integrate once, accept payments everywhere",
          "priority": "primary"
        },
        {
          "id": "feat_smart_routing",
          "name": "Smart Payment Routing",
          "description": "Automatically route payments to provider with best success rate",
          "user_benefit": "Higher conversion rates without extra work",
          "priority": "primary"
        }
      ],
      "integrations": [
        {
          "id": "int_stripe",
          "name": "Stripe",
          "category": "payments",
          "description": "Accept credit cards via Stripe",
          "required": false
        },
        {
          "id": "int_paypal",
          "name": "PayPal",
          "category": "payments",
          "description": "Accept PayPal payments",
          "required": false
        }
      ],
      "tech_stack": {
        "backend": ["Python", "FastAPI", "PostgreSQL"],
        "infrastructure": ["AWS", "Docker", "Kubernetes"],
        "monitoring": ["DataDog", "PagerDuty"]
      }
    }
  },
  {
    id: "mobile-app",
    name: "Mobile App",
    description: "PKML for a mobile application with brand guidelines",
    category: "mobile",
    icon: "Smartphone",
    content: {
      "$schema": "https://pkml.dev/schema/v0.1.json",
      "meta": {
        "version": "1.5.0",
        "pkml_version": "0.1.0",
        "last_updated": new Date().toISOString(),
        "author": "FitTrack Team"
      },
      "product": {
        "name": "FitTrack",
        "tagline": "Your personal fitness companion",
        "description": "FitTrack helps you track workouts, set goals, and stay motivated with personalized insights and social features.",
        "category": ["health", "fitness", "mobile"],
        "website": "https://fittrack.app",
        "positioning": {
          "problem": "People struggle to stay consistent with their fitness routines",
          "solution": "Gamified fitness tracking with social accountability",
          "target_audience": "Health-conscious individuals aged 18-45",
          "differentiators": [
            "AI-powered workout recommendations",
            "Social challenges with friends",
            "Integration with all major wearables"
          ]
        }
      },
      "features": [
        {
          "id": "feat_workout_tracking",
          "name": "Workout Tracking",
          "description": "Log any type of workout with automatic exercise detection",
          "user_benefit": "Effortlessly track your progress without manual entry",
          "priority": "primary"
        },
        {
          "id": "feat_social_challenges",
          "name": "Social Challenges",
          "description": "Compete with friends in weekly fitness challenges",
          "user_benefit": "Stay motivated through friendly competition",
          "priority": "primary"
        }
      ],
      "brand": {
        "visual": {
          "colors": {
            "primary": ["#10b981", "#059669"],
            "secondary": ["#6366f1", "#4f46e5"],
            "semantic": {
              "success": "#22c55e",
              "warning": "#f59e0b",
              "error": "#ef4444"
            }
          },
          "typography": {
            "headings": "Poppins",
            "body": "Inter"
          }
        },
        "voice": {
          "tone": ["encouraging", "friendly", "motivational"],
          "vocabulary": {
            "preferred": ["workout buddy", "personal best", "streak"],
            "avoid": ["punishment", "failure", "diet"]
          }
        }
      },
      "tech_stack": {
        "frontend": ["React Native", "TypeScript"],
        "backend": ["Node.js", "GraphQL", "MongoDB"],
        "infrastructure": ["AWS", "Firebase"]
      }
    }
  }
];

// Get example by ID
export const getExampleById = (id) => {
  return PKML_EXAMPLES.find(example => example.id === id);
};

// Get examples by category
export const getExamplesByCategory = (category) => {
  return PKML_EXAMPLES.filter(example => example.category === category);
};

// Get all categories
export const getCategories = () => {
  const categories = new Set(PKML_EXAMPLES.map(example => example.category));
  return Array.from(categories);
};

// Generate a fresh example with current timestamp
export const generateFreshExample = (id) => {
  const example = getExampleById(id);
  if (!example) return null;
  
  const freshContent = JSON.parse(JSON.stringify(example.content));
  freshContent.meta.last_updated = new Date().toISOString();
  
  return freshContent;
};
