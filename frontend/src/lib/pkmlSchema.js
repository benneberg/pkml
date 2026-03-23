// PKML JSON Schema v0.2 for Monaco Editor validation

export const PKML_SCHEMA = {
“$schema”: “http://json-schema.org/draft-07/schema#”,
“$id”: “https://pkml.dev/schema/v0.2.json”,
“title”: “Product Knowledge Markup Language (PKML)”,
“description”: “A schema for capturing product and engineering knowledge in a machine-readable, LLM-optimized format”,
“type”: “object”,
“required”: [”$schema”, “meta”, “product”],
“additionalProperties”: true,
“properties”: {
“$schema”: {
“type”: “string”,
“const”: “https://pkml.dev/schema/v0.2.json”,
“description”: “PKML schema version identifier”
},

```
"meta": {
  "type": "object",
  "required": ["version", "pkml_version", "last_updated"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Semantic version of this knowledge document (e.g. 1.4.2)"
    },
    "pkml_version": {
      "type": "string",
      "const": "0.2",
      "description": "PKML spec version — must be '0.2'"
    },
    "last_updated": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp of last modification"
    },
    "last_updated_by": { "type": "string", "description": "Who last updated this (e.g. @username)" },
    "authors": { "type": "array", "items": { "type": "string" }, "description": "Primary maintainers" },
    "generated": { "type": "boolean", "default": false, "description": "True if auto-generated (e.g. by CCC)" }
  }
},

"product": {
  "type": "object",
  "required": ["name", "tagline"],
  "properties": {
    "name": { "type": "string", "minLength": 1 },
    "tagline": { "type": "string", "minLength": 1 },
    "description": { "type": "string" },
    "category": { "type": "array", "items": { "type": "string" } },
    "website": { "type": "string", "format": "uri" },
    "repository": { "type": "string", "format": "uri" },
    "positioning": {
      "type": "object",
      "required": ["problem", "solution"],
      "properties": {
        "problem": { "type": "string" },
        "solution": { "type": "string" },
        "target_audience": { "type": "string" },
        "differentiators": { "type": "array", "items": { "type": "string" } }
      }
    }
  }
},

"features": {
  "type": "array",
  "items": {
    "type": "object",
    "required": ["id", "name"],
    "properties": {
      "id": { "type": "string", "pattern": "^[a-z0-9_]+$" },
      "name": { "type": "string" },
      "description": { "type": "string" },
      "user_benefit": { "type": "string" },
      "priority": {
        "type": "string",
        "enum": ["p0", "p1", "p2", "p3"],
        "description": "p0=critical, p1=high, p2=medium, p3=nice-to-have"
      },
      "status": {
        "type": "string",
        "enum": ["planned", "wip", "live", "deprecated"]
      },
      "introduced": { "type": "string", "format": "date" },
      "keywords": { "type": "array", "items": { "type": "string" } },
      "related": {
        "type": "object",
        "description": "Bridge to engineering implementation",
        "properties": {
          "patterns": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["id"],
              "properties": {
                "id": { "type": "string" },
                "relationship": { "type": "string", "enum": ["implements_using", "extends", "modifies"] },
                "required": { "type": "boolean" }
              }
            }
          },
          "constraints": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["id"],
              "properties": {
                "id": { "type": "string" },
                "relationship": { "type": "string", "enum": ["must_not_violate", "must_satisfy", "should_consider"] },
                "severity": { "type": "string", "enum": ["critical", "high", "medium", "low"] }
              }
            }
          },
          "technical_debt": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["id"],
              "properties": {
                "id": { "type": "string" },
                "relationship": { "type": "string", "enum": ["should_refactor_alongside", "blocks", "related_to"] },
                "optional": { "type": "boolean" }
              }
            }
          }
        }
      }
    }
  }
},

"workflows": {
  "type": "array",
  "items": {
    "type": "object",
    "required": ["id", "name", "steps"],
    "properties": {
      "id": { "type": "string", "pattern": "^[a-z0-9_]+$" },
      "name": { "type": "string" },
      "description": { "type": "string" },
      "happy_path": { "type": "boolean", "default": true },
      "steps": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "order": { "type": "integer" },
            "action": { "type": "string" },
            "actor": { "type": "string" },
            "system_response": { "type": "string" },
            "expected_outcome": { "type": "string" }
          }
        }
      },
      "error_paths": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "condition": { "type": "string" },
            "outcome": { "type": "string" }
          }
        }
      },
      "outcome": { "type": "string" }
    }
  }
},

"ui_patterns": {
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": { "type": "string" },
      "name": { "type": "string" },
      "component": { "type": "string" },
      "description": { "type": "string" },
      "screenshot": { "type": "string", "format": "uri" },
      "bounding_boxes": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["label", "x", "y", "width", "height"],
          "properties": {
            "label": { "type": "string" },
            "x": { "type": "number" }, "y": { "type": "number" },
            "width": { "type": "number" }, "height": { "type": "number" }
          }
        }
      }
    }
  }
},

"brand": {
  "type": "object",
  "properties": {
    "colors": { "type": "object", "additionalProperties": { "type": "string" } },
    "typography": {
      "type": "object",
      "properties": {
        "primary_font": { "type": "string" },
        "secondary_font": { "type": "string" }
      }
    },
    "voice": { "type": "string" },
    "tone": { "type": "string" }
  }
},

"tech_stack": {
  "description": "Technology stack — array of {layer, technology} items, or legacy object format",
  "oneOf": [
    {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "layer": { "type": "string", "enum": ["frontend", "backend", "database", "infrastructure", "tooling", "monitoring", "testing"] },
          "technology": { "type": "string" },
          "version": { "type": "string" },
          "purpose": { "type": "string" }
        }
      }
    },
    {
      "type": "object",
      "description": "Legacy v0.1 format — accepted but array format preferred",
      "properties": {
        "frontend": { "type": "array", "items": { "type": "string" } },
        "backend": { "type": "array", "items": { "type": "string" } },
        "databases": { "type": "array", "items": { "type": "string" } },
        "infrastructure": { "type": "array", "items": { "type": "string" } },
        "monitoring": { "type": "array", "items": { "type": "string" } },
        "testing": { "type": "array", "items": { "type": "string" } }
      }
    }
  ]
},

"integrations": {
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "service": { "type": "string" },
      "purpose": { "type": "string" },
      "critical": { "type": "boolean" },
      "documentation": { "type": "string", "format": "uri" }
    }
  }
},

"evidence": {
  "type": "object",
  "properties": {
    "screenshots": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "url": { "type": "string", "format": "uri" },
          "caption": { "type": "string" },
          "date": { "type": "string", "format": "date" }
        }
      }
    },
    "videos": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "url": { "type": "string", "format": "uri" },
          "title": { "type": "string" },
          "duration": { "type": "string" }
        }
      }
    }
  }
},

"engineering": {
  "type": "object",
  "description": "Engineering implementation knowledge — how to BUILD the product",
  "properties": {
    "meta": {
      "type": "object",
      "properties": {
        "last_updated": { "type": "string", "format": "date-time" },
        "maintainers": { "type": "array", "items": { "type": "string" } }
      }
    },
    "architecture": {
      "type": "object",
      "properties": {
        "repositories": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "name", "role"],
            "properties": {
              "id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
              "name": { "type": "string" },
              "url": { "type": "string", "format": "uri" },
              "role": { "type": "string" },
              "language": { "type": "string" },
              "framework": { "type": "string" },
              "ownership": {
                "type": "object",
                "properties": {
                  "team": { "type": "string" },
                  "primary_contact": { "type": "string" },
                  "slack_channel": { "type": "string" }
                }
              },
              "critical_paths": { "type": "array", "items": { "type": "string" } }
            }
          }
        },
        "dependencies": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["from", "to", "relationship"],
            "properties": {
              "from": { "type": "string" },
              "to": { "type": "string" },
              "relationship": { "type": "string", "enum": ["publishes_to", "subscribes_to", "calls", "depends_on", "imports"] },
              "critical": { "type": "boolean" },
              "coordination_required": { "type": "boolean" },
              "notes": { "type": "string" }
            }
          }
        }
      }
    },
    "implementation_patterns": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "when_to_use"],
        "properties": {
          "id": { "type": "string", "pattern": "^[a-z0-9_]+$" },
          "name": { "type": "string" },
          "when_to_use": { "type": "string" },
          "status": { "type": "string", "enum": ["active", "deprecated", "experimental"] },
          "repositories_involved": { "type": "array", "items": { "type": "string" } },
          "steps": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["order", "action", "repository"],
              "properties": {
                "order": { "type": "integer" },
                "action": { "type": "string" },
                "repository": { "type": "string" },
                "estimated_time": { "type": "string" },
                "why": { "type": "string" },
                "reference_file": { "type": "string" },
                "code_snippet": { "type": "string" },
                "validation": { "type": "string" }
              }
            }
          },
          "examples": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["feature", "outcome"],
              "properties": {
                "feature": { "type": "string" },
                "implemented": { "type": "string", "format": "date" },
                "pr": { "type": "string", "format": "uri" },
                "outcome": { "type": "string", "enum": ["success", "failure", "partial"] },
                "actual_time_taken": { "type": "string" },
                "deviations_from_pattern": { "type": "array", "items": { "type": "string" } },
                "what_went_wrong": { "type": "string" },
                "rolled_back": { "type": "boolean" }
              }
            }
          },
          "history": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["version"],
              "properties": {
                "version": { "type": "integer" },
                "introduced": { "type": "string", "format": "date" },
                "updated": { "type": "string", "format": "date" },
                "changes": { "type": "string" },
                "reason": { "type": "string" },
                "description": { "type": "string" }
              }
            }
          }
        }
      }
    },
    "constraints": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "rule", "reason"],
        "properties": {
          "id": { "type": "string", "pattern": "^[a-z0-9_]+$" },
          "type": { "type": "string", "enum": ["library_restriction", "architecture_rule", "business_rule", "performance", "security", "compliance"] },
          "context": { "type": "string" },
          "rule": { "type": "string" },
          "reason": { "type": "string" },
          "severity": { "type": "string", "enum": ["critical", "high", "medium", "low"] },
          "discovered": { "type": "string", "format": "date" },
          "incident": { "type": "string" },
          "approved_alternatives": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": { "type": "string" },
                "approved_by": { "type": "string" },
                "used_in": { "type": "array", "items": { "type": "string" } }
              }
            }
          },
          "validation": {
            "type": "object",
            "properties": {
              "method": { "type": "string", "enum": ["static_analysis", "unit_test", "integration_test", "code_review", "manual"] },
              "tool": { "type": "string" },
              "enforced_in": { "type": "string", "enum": ["ci", "pre-commit", "pr_checklist", "manual_review", "none"] },
              "enforcement_level": { "type": "string", "enum": ["blocking", "required_approval", "warning", "none"] }
            }
          }
        }
      }
    },
    "technical_debt": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "issue"],
        "properties": {
          "id": { "type": "string", "pattern": "^[a-z0-9_]+$" },
          "location": { "type": "string" },
          "issue": { "type": "string" },
          "created": { "type": "string", "format": "date" },
          "priority": { "type": "string", "enum": ["high", "medium", "low"] },
          "refactor_when": { "type": "string" },
          "estimated_effort": { "type": "string" },
          "benefit": { "type": "string" },
          "blocked_by": { "type": "string" }
        }
      }
    },
    "lessons_learned": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "what_happened", "correct_approach"],
        "properties": {
          "id": { "type": "string", "pattern": "^[a-z0-9_]+$" },
          "date": { "type": "string", "format": "date" },
          "what_happened": { "type": "string" },
          "what_was_tried": { "type": "string" },
          "why_it_failed": { "type": "string" },
          "correct_approach": { "type": "string" },
          "incident": { "type": "string" },
          "never_forget": { "type": "boolean" },
          "related_pattern": { "type": "string" },
          "related_constraint": { "type": "string" }
        }
      }
    },
    "decision_log": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "decision", "context"],
        "properties": {
          "id": { "type": "string", "pattern": "^[a-z0-9_]+$" },
          "date": { "type": "string", "format": "date" },
          "decision": { "type": "string" },
          "context": { "type": "string" },
          "alternatives_considered": { "type": "array", "items": { "type": "string" } },
          "why_this_choice": { "type": "string" },
          "owner": { "type": "string" },
          "status": { "type": "string", "enum": ["active", "superseded", "deprecated"] }
        }
      }
    },
    "glossary": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["term", "definition"],
        "properties": {
          "term": { "type": "string" },
          "definition": { "type": "string" },
          "aliases": { "type": "array", "items": { "type": "string" } },
          "not_to_be_confused_with": { "type": "string" },
          "implementation_note": { "type": "string" },
          "threshold": { "type": "number" }
        }
      }
    },
    "coordination": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["trigger", "notify"],
        "properties": {
          "trigger": { "type": "string" },
          "notify": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["team", "contact"],
              "properties": {
                "team": { "type": "string" },
                "contact": { "type": "string" },
                "lead_time": { "type": "string" },
                "reason": { "type": "string" }
              }
            }
          }
        }
      }
    }
  }
},

"validation_rules": {
  "type": "array",
  "items": {
    "type": "object",
    "required": ["rule_id", "check", "severity"],
    "properties": {
      "rule_id": { "type": "string", "pattern": "^[a-z0-9_]+$" },
      "applies_to": { "type": "string" },
      "check": { "type": "string" },
      "severity": { "type": "string", "enum": ["error", "warning", "info"] },
      "message": { "type": "string" }
    }
  }
}
```

}
};

// Default minimal PKML v0.2 template
export const DEFAULT_PKML = {
“$schema”: “https://pkml.dev/schema/v0.2.json”,
“meta”: {
“version”: “1.0.0”,
“pkml_version”: “0.2”,
“last_updated”: new Date().toISOString()
},
“product”: {
“name”: “Your Product Name”,
“tagline”: “Your product tagline here”,
“category”: [“productivity”]
}
};

// Monaco editor options
export const MONACO_OPTIONS = {
theme: ‘vs-dark’,
language: ‘json’,
automaticLayout: true,
minimap: { enabled: false },
fontSize: 14,
fontFamily: “‘JetBrains Mono’, monospace”,
lineNumbers: ‘on’,
scrollBeyondLastLine: false,
roundedSelection: true,
padding: { top: 16, bottom: 16 },
renderLineHighlight: ‘all’,
cursorBlinking: ‘smooth’,
cursorSmoothCaretAnimation: ‘on’,
smoothScrolling: true,
tabSize: 2,
wordWrap: ‘on’,
formatOnPaste: true,
formatOnType: true,
bracketPairColorization: { enabled: true },
guides: { bracketPairs: true, indentation: true }
};

// Configure Monaco with PKML v0.2 schema
export const configureMonaco = (monaco) => {
monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
validate: true,
schemas: [
{
uri: ‘https://pkml.dev/schema/v0.2.json’,
fileMatch: [’*’],
schema: PKML_SCHEMA
}
],
enableSchemaRequest: false
});

monaco.editor.defineTheme(‘pkml-dark’, {
base: ‘vs-dark’,
inherit: true,
rules: [
{ token: ‘string.key.json’, foreground: ‘6366f1’ },
{ token: ‘string.value.json’, foreground: ‘22c55e’ },
{ token: ‘number’, foreground: ‘eab308’ },
{ token: ‘keyword’, foreground: ‘8b5cf6’ },
{ token: ‘comment’, foreground: ‘6b7280’ }
],
colors: {
‘editor.background’: ‘#09090b’,
‘editor.foreground’: ‘#fafafa’,
‘editor.lineHighlightBackground’: ‘#18181b’,
‘editor.selectionBackground’: ‘#6366f140’,
‘editorCursor.foreground’: ‘#6366f1’,
‘editorLineNumber.foreground’: ‘#52525b’,
‘editorLineNumber.activeForeground’: ‘#a1a1aa’,
‘editor.inactiveSelectionBackground’: ‘#27272a’,
‘editorIndentGuide.background’: ‘#27272a’,
‘editorIndentGuide.activeBackground’: ‘#3f3f46’
}
});
};