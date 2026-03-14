// PKML JSON Schema for Monaco Editor validation
export const PKML_SCHEMA = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://pkml.dev/schema/v0.1.json",
  "title": "PKML",
  "description": "Product Knowledge Markup Language Schema v0.1",
  "type": "object",
  "required": ["$schema", "meta", "product"],
  "properties": {
    "$schema": {
      "type": "string",
      "description": "PKML schema URL",
      "const": "https://pkml.dev/schema/v0.1.json"
    },
    "meta": {
      "type": "object",
      "description": "Metadata about the PKML document",
      "required": ["version", "pkml_version", "last_updated"],
      "properties": {
        "version": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+$",
          "description": "Document version (SemVer)"
        },
        "pkml_version": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+$",
          "description": "PKML spec version"
        },
        "last_updated": {
          "type": "string",
          "format": "date-time",
          "description": "Last modification timestamp (ISO8601)"
        },
        "created_at": {
          "type": "string",
          "format": "date-time",
          "description": "Creation timestamp (ISO8601)"
        },
        "author": {
          "type": "string",
          "description": "Document author"
        },
        "license": {
          "type": "string",
          "description": "Content license"
        }
      }
    },
    "product": {
      "type": "object",
      "description": "Core product information",
      "required": ["name", "tagline"],
      "properties": {
        "name": {
          "type": "string",
          "minLength": 1,
          "description": "Product name"
        },
        "tagline": {
          "type": "string",
          "minLength": 1,
          "description": "One-sentence description"
        },
        "description": {
          "type": "string",
          "description": "Longer description (2-3 sentences)"
        },
        "category": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Product categories"
        },
        "website": {
          "type": "string",
          "format": "uri",
          "description": "Product website"
        },
        "repository": {
          "type": "string",
          "format": "uri",
          "description": "Source repository"
        },
        "positioning": {
          "type": "object",
          "description": "Product positioning",
          "properties": {
            "problem": {
              "type": "string",
              "description": "Problem being solved"
            },
            "solution": {
              "type": "string",
              "description": "How product solves it"
            },
            "target_audience": {
              "type": "string",
              "description": "Who it's for"
            },
            "competitive_advantage": {
              "type": "string",
              "description": "Key competitive advantage"
            },
            "differentiators": {
              "type": "array",
              "items": { "type": "string" },
              "description": "Key differentiators"
            }
          }
        }
      }
    },
    "features": {
      "type": "array",
      "description": "Product features with evidence",
      "items": {
        "type": "object",
        "required": ["id", "name", "description", "user_benefit", "priority"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Unique identifier"
          },
          "name": {
            "type": "string",
            "description": "Feature name"
          },
          "description": {
            "type": "string",
            "description": "What it does"
          },
          "user_benefit": {
            "type": "string",
            "description": "Why it matters"
          },
          "priority": {
            "type": "string",
            "enum": ["primary", "secondary", "tertiary"],
            "description": "Feature priority"
          },
          "evidence": {
            "type": "object",
            "description": "Evidence for this feature",
            "properties": {
              "screenshots": {
                "type": "array",
                "items": { "type": "string" },
                "description": "Screenshot URLs"
              },
              "videos": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "file": { "type": "string" },
                    "segment": {
                      "type": "object",
                      "properties": {
                        "start": { "type": "number" },
                        "end": { "type": "number" }
                      }
                    },
                    "description": { "type": "string" }
                  }
                },
                "description": "Video demonstrations"
              },
              "documentation": {
                "type": "string",
                "description": "Documentation link"
              }
            }
          },
          "technical_details": {
            "type": "string",
            "description": "Technical implementation details"
          },
          "keywords": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Related keywords"
          },
          "related_features": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Related feature IDs"
          },
          "availability": {
            "type": "object",
            "properties": {
              "since_version": { "type": "string" },
              "deprecated": { "type": "boolean" },
              "deprecation_date": { "type": "string" },
              "replacement": { "type": "string" }
            }
          }
        }
      }
    },
    "workflows": {
      "type": "array",
      "description": "User workflows and task sequences",
      "items": {
        "type": "object",
        "required": ["id", "name", "description", "difficulty", "steps", "outcome"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Unique identifier"
          },
          "name": {
            "type": "string",
            "description": "Workflow name"
          },
          "description": {
            "type": "string",
            "description": "What this accomplishes"
          },
          "difficulty": {
            "type": "string",
            "enum": ["beginner", "intermediate", "advanced"],
            "description": "Workflow difficulty"
          },
          "estimated_time": {
            "type": "string",
            "description": "Estimated time to complete"
          },
          "steps": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "order": { "type": "number" },
                "action": { "type": "string" },
                "ui_element": {
                  "type": "object",
                  "properties": {
                    "type": { "type": "string" },
                    "label": { "type": "string" },
                    "screenshot": { "type": "string" },
                    "bbox": {
                      "type": "object",
                      "properties": {
                        "x": { "type": "number" },
                        "y": { "type": "number" },
                        "width": { "type": "number" },
                        "height": { "type": "number" }
                      }
                    }
                  }
                },
                "expected_outcome": { "type": "string" },
                "tips": {
                  "type": "array",
                  "items": { "type": "string" }
                },
                "common_errors": {
                  "type": "array",
                  "items": { "type": "string" }
                }
              }
            },
            "description": "Workflow steps"
          },
          "outcome": {
            "type": "string",
            "description": "Expected result"
          },
          "prerequisites": {
            "type": "array",
            "items": { "type": "string" },
            "description": "What's needed first"
          },
          "related_workflows": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Related workflow IDs"
          }
        }
      }
    },
    "ui_patterns": {
      "type": "array",
      "description": "Common UI patterns and components",
      "items": {
        "type": "object",
        "required": ["id", "name", "type", "description", "evidence"],
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "type": { "type": "string" },
          "description": { "type": "string" },
          "evidence": {
            "type": "object",
            "properties": {
              "screenshot": { "type": "string" },
              "bbox": {
                "type": "object",
                "properties": {
                  "x": { "type": "number" },
                  "y": { "type": "number" },
                  "width": { "type": "number" },
                  "height": { "type": "number" }
                }
              }
            }
          },
          "context": { "type": "string" },
          "interaction": { "type": "string" },
          "states": {
            "type": "array",
            "items": { "type": "string" }
          },
          "style_notes": {
            "type": "object",
            "properties": {
              "colors": {
                "type": "array",
                "items": { "type": "string" }
              },
              "typography": { "type": "string" },
              "spacing": { "type": "string" },
              "borders": { "type": "string" }
            }
          }
        }
      }
    },
    "brand": {
      "type": "object",
      "description": "Brand identity and design system",
      "properties": {
        "visual": {
          "type": "object",
          "properties": {
            "logo": {
              "type": "object",
              "properties": {
                "primary": { "type": "string" },
                "dark_mode": { "type": "string" },
                "light_mode": { "type": "string" },
                "icon_only": { "type": "string" },
                "formats": {
                  "type": "object",
                  "properties": {
                    "svg": { "type": "string" },
                    "png": { "type": "string" },
                    "pdf": { "type": "string" }
                  }
                }
              }
            },
            "colors": {
              "type": "object",
              "properties": {
                "primary": {
                  "type": "array",
                  "items": { "type": "string" }
                },
                "secondary": {
                  "type": "array",
                  "items": { "type": "string" }
                },
                "accent": {
                  "type": "array",
                  "items": { "type": "string" }
                },
                "semantic": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "string" },
                    "warning": { "type": "string" },
                    "error": { "type": "string" },
                    "info": { "type": "string" }
                  }
                },
                "neutral": {
                  "type": "array",
                  "items": { "type": "string" }
                }
              }
            },
            "typography": {
              "type": "object",
              "properties": {
                "headings": { "type": "string" },
                "body": { "type": "string" },
                "mono": { "type": "string" },
                "scales": {
                  "type": "object",
                  "properties": {
                    "h1": { "type": "string" },
                    "h2": { "type": "string" },
                    "h3": { "type": "string" },
                    "body": { "type": "string" },
                    "small": { "type": "string" }
                  }
                }
              }
            },
            "design_system": {
              "type": "object",
              "properties": {
                "border_radius": { "type": "string" },
                "spacing_unit": { "type": "string" },
                "shadow_style": { "type": "string" },
                "grid_columns": { "type": "number" }
              }
            }
          }
        },
        "voice": {
          "type": "object",
          "properties": {
            "tone": {
              "type": "array",
              "items": { "type": "string" }
            },
            "vocabulary": {
              "type": "object",
              "properties": {
                "preferred": {
                  "type": "array",
                  "items": { "type": "string" }
                },
                "avoid": {
                  "type": "array",
                  "items": { "type": "string" }
                }
              }
            },
            "sample_copy": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "type": { "type": "string" },
                  "text": { "type": "string" },
                  "source": { "type": "string" }
                }
              }
            },
            "grammar_style": {
              "type": "object",
              "properties": {
                "sentence_structure": {
                  "type": "string",
                  "enum": ["short", "medium", "varied"]
                },
                "active_voice_preference": { "type": "number" },
                "technical_depth": {
                  "type": "string",
                  "enum": ["surface", "moderate", "deep"]
                }
              }
            }
          }
        }
      }
    },
    "tech_stack": {
      "type": "object",
      "description": "Technical infrastructure",
      "properties": {
        "frontend": {
          "type": "array",
          "items": { "type": "string" }
        },
        "backend": {
          "type": "array",
          "items": { "type": "string" }
        },
        "infrastructure": {
          "type": "array",
          "items": { "type": "string" }
        },
        "databases": {
          "type": "array",
          "items": { "type": "string" }
        },
        "monitoring": {
          "type": "array",
          "items": { "type": "string" }
        },
        "testing": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "integrations": {
      "type": "array",
      "description": "Third-party integrations",
      "items": {
        "type": "object",
        "required": ["id", "name", "category"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Integration identifier"
          },
          "name": {
            "type": "string",
            "description": "Integration name"
          },
          "category": {
            "type": "string",
            "description": "Integration category"
          },
          "description": {
            "type": "string",
            "description": "Integration description"
          },
          "logo": {
            "type": "string",
            "description": "Logo URL"
          },
          "documentation": {
            "type": "string",
            "description": "Documentation URL"
          },
          "required": {
            "type": "boolean",
            "description": "Whether integration is required"
          }
        }
      }
    },
    "evidence": {
      "type": "object",
      "description": "Metadata about evidence files",
      "properties": {
        "screenshots": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "string" },
              "file": { "type": "string" },
              "title": { "type": "string" },
              "description": { "type": "string" },
              "context": { "type": "string" },
              "captured_at": { "type": "string" },
              "dimensions": {
                "type": "object",
                "properties": {
                  "width": { "type": "number" },
                  "height": { "type": "number" }
                }
              },
              "detected_elements": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "type": { "type": "string" },
                    "label": { "type": "string" },
                    "bbox": {
                      "type": "object",
                      "properties": {
                        "x": { "type": "number" },
                        "y": { "type": "number" },
                        "width": { "type": "number" },
                        "height": { "type": "number" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "videos": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "string" },
              "file": { "type": "string" },
              "title": { "type": "string" },
              "description": { "type": "string" },
              "duration": { "type": "number" },
              "created_at": { "type": "string" },
              "transcript": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "start": { "type": "number" },
                    "end": { "type": "number" },
                    "text": { "type": "string" },
                    "speaker": { "type": "string" }
                  }
                }
              }
            }
          }
        },
        "recordings": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "string" },
              "file": { "type": "string" },
              "title": { "type": "string" },
              "purpose": { "type": "string" },
              "duration": { "type": "number" },
              "created_at": { "type": "string" }
            }
          }
        }
      }
    }
  },
  "additionalProperties": true
};

// Default minimal PKML template
export const DEFAULT_PKML = {
  "$schema": "https://pkml.dev/schema/v0.1.json",
  "meta": {
    "version": "1.0.0",
    "pkml_version": "0.1.0",
    "last_updated": new Date().toISOString()
  },
  "product": {
    "name": "Your Product Name",
    "tagline": "Your product tagline here",
    "category": ["productivity"]
  }
};

// Monaco editor options for PKML
export const MONACO_OPTIONS = {
  theme: 'vs-dark',
  language: 'json',
  automaticLayout: true,
  minimap: { enabled: false },
  fontSize: 14,
  fontFamily: "'JetBrains Mono', monospace",
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  roundedSelection: true,
  padding: { top: 16, bottom: 16 },
  renderLineHighlight: 'all',
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  smoothScrolling: true,
  tabSize: 2,
  wordWrap: 'on',
  formatOnPaste: true,
  formatOnType: true,
  bracketPairColorization: { enabled: true },
  guides: {
    bracketPairs: true,
    indentation: true
  }
};

// Configure Monaco with PKML schema
export const configureMonaco = (monaco) => {
  // Set JSON defaults with PKML schema
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemas: [
      {
        uri: 'https://pkml.dev/schema/v0.1.json',
        fileMatch: ['*'],
        schema: PKML_SCHEMA
      }
    ],
    enableSchemaRequest: false
  });

  // Define custom dark theme for PKML
  monaco.editor.defineTheme('pkml-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'string.key.json', foreground: '6366f1' },
      { token: 'string.value.json', foreground: '22c55e' },
      { token: 'number', foreground: 'eab308' },
      { token: 'keyword', foreground: '8b5cf6' },
      { token: 'comment', foreground: '6b7280' }
    ],
    colors: {
      'editor.background': '#09090b',
      'editor.foreground': '#fafafa',
      'editor.lineHighlightBackground': '#18181b',
      'editor.selectionBackground': '#6366f140',
      'editorCursor.foreground': '#6366f1',
      'editorLineNumber.foreground': '#52525b',
      'editorLineNumber.activeForeground': '#a1a1aa',
      'editor.inactiveSelectionBackground': '#27272a',
      'editorIndentGuide.background': '#27272a',
      'editorIndentGuide.activeBackground': '#3f3f46'
    }
  });
};
