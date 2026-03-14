import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { 
  Code2, 
  FormInput, 
  LayoutGrid, 
  FileJson, 
  Menu,
  X,
  Github,
  ExternalLink
} from "lucide-react";
import { Button } from "./components/ui/button";
import { EditorPage } from "./pages/EditorPage";
import { BuilderPage } from "./pages/BuilderPage";
import { GalleryPage } from "./pages/GalleryPage";
import "@/App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Navigation items
const navItems = [
  { path: "/", label: "Editor", icon: Code2, description: "JSON Editor with validation" },
  { path: "/builder", label: "Builder", icon: FormInput, description: "Visual form builder" },
  { path: "/gallery", label: "Gallery", icon: LayoutGrid, description: "Example templates" },
];

// Sidebar Component
const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-zinc-950 border-r border-zinc-800
          transform transition-transform duration-200 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        data-testid="sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-indigo-500/20 flex items-center justify-center">
                <FileJson className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white">PKML</h1>
                <p className="text-[10px] text-zinc-500 tracking-wide">v0.1.0</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"
              data-testid="close-sidebar-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1" data-testid="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors
                    ${isActive 
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    }
                  `}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{item.label}</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{item.description}</p>
                  </div>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <a 
                href="https://pkml.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                data-testid="pkml-docs-link"
              >
                <ExternalLink className="w-3 h-3" />
                Spec v0.1
              </a>
              <a 
                href="https://github.com/pkml/spec" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
                data-testid="github-link"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// Header Component
const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const currentNav = navItems.find(item => item.path === location.pathname) || navItems[0];

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center px-4 lg:px-6" data-testid="app-header">
      <button 
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 mr-2 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"
        data-testid="menu-btn"
      >
        <Menu className="w-5 h-5" />
      </button>
      
      <div className="flex items-center gap-3">
        {currentNav && (
          <>
            <currentNav.icon className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-semibold text-white">{currentNav.label}</h2>
              <p className="text-xs text-zinc-500">{currentNav.description}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-xs text-zinc-500 px-2 py-1 bg-zinc-900 rounded border border-zinc-800">
          PKML v0.1.0
        </span>
      </div>
    </header>
  );
};

// Main App Component
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pkmlContent, setPkmlContent] = useState(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('pkml-draft');
    if (saved) {
      try {
        return saved;
      } catch {
        return '';
      }
    }
    return '';
  });

  // Save to localStorage whenever content changes
  useEffect(() => {
    if (pkmlContent) {
      localStorage.setItem('pkml-draft', pkmlContent);
    }
  }, [pkmlContent]);

  // Health check
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/`);
        const data = await response.json();
        console.log('API Status:', data);
      } catch (error) {
        console.error('API health check failed:', error);
      }
    };
    checkHealth();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 flex" data-testid="app-container">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-hidden" data-testid="main-content">
            <Routes>
              <Route 
                path="/" 
                element={
                  <EditorPage 
                    content={pkmlContent} 
                    onContentChange={setPkmlContent} 
                  />
                } 
              />
              <Route 
                path="/builder" 
                element={
                  <BuilderPage 
                    content={pkmlContent} 
                    onContentChange={setPkmlContent} 
                  />
                } 
              />
              <Route 
                path="/gallery" 
                element={
                  <GalleryPage 
                    onSelectTemplate={(template) => {
                      setPkmlContent(JSON.stringify(template, null, 2));
                      toast.success('Template loaded! Switch to Editor to view.');
                    }} 
                  />
                } 
              />
            </Routes>
          </main>
        </div>
        
        <Toaster 
          theme="dark" 
          position="bottom-right"
          toastOptions={{
            className: 'bg-zinc-900 border border-zinc-800 text-white',
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
