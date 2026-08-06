import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Sun,
  ChevronDown,
  User,
  LogOut,
  Lock
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { moduleRegistry } from '../../config/moduleRegistry';
import { businessApi } from '../../services/api/businessApi';
import { NotificationCenter } from './NotificationCenter';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Check if user has a business profile, otherwise force onboarding
    const checkOnboarding = async () => {
      try {
        const profiles = await businessApi.getAllProfiles();
        if (profiles.length === 0) {
          navigate('/onboarding');
        }
      } catch (e) {
        console.error("Failed to check business profiles", e);
      }
    };
    checkOnboarding();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-surface flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AG</span>
            </div>
            <span className="font-semibold tracking-tight text-sm">AI Growth Agent</span>
          </div>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          
          {/* WORKSPACE */}
          <div className="space-y-1">
            <div className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Workspace</div>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-secondary text-primary shadow-sm ring-1 ring-border"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                )
              }
            >
              <Home className="mr-3 h-4 w-4 flex-shrink-0" />
              AI Operations Dashboard
            </NavLink>
          </div>

          {/* DYNAMIC CATEGORIES */}
          {[
            { id: 'core', label: 'Intelligence' },
            { id: 'strategy', label: 'Planning' },
            { id: 'execution', label: 'Execution' },
            { id: 'analytics', label: 'Insights' },
            { id: 'foundation', label: 'System' }
          ].map(category => {
            const categoryModules = moduleRegistry
              .filter(m => m.category === category.id)
              .sort((a, b) => a.order - b.order);
              
            if (categoryModules.length === 0) return null;

            return (
              <div key={category.id} className="space-y-1">
                <div className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">{category.label}</div>
                {categoryModules.map((module) => (
                  <NavLink
                    key={module.id}
                    to={module.route}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-secondary text-primary shadow-sm ring-1 ring-border"
                          : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                      )
                    }
                  >
                    <div className="flex items-center">
                      <module.icon className={cn("mr-3 h-4 w-4 flex-shrink-0 transition-colors", module.status === 'Locked' ? 'text-text-muted/50' : '')} />
                      <span className={cn(module.status === 'Locked' ? 'text-text-muted/70' : '')}>{module.name}</span>
                    </div>
                    {module.status === 'Locked' && (
                      <Lock className="w-3 h-3 text-text-muted/50" />
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}

        </nav>

        {/* Minimal AI Status area */}
        <div className="p-4 mt-auto border-t border-border bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </div>
            <div>
              <div className="text-sm font-medium text-text-primary">System Online</div>
              <div className="text-xs text-text-muted">All agents idle</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center">
            {/* Workspace Switcher Placeholder */}
            <button className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              {user?.name || 'Workspace'}
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <button className="text-text-secondary hover:text-text-primary transition-colors">
              <Sun className="w-5 h-5" />
            </button>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium border border-border cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              >
                {user?.name?.charAt(0) || 'U'}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-surface border border-border py-1 animate-in">
                  <div className="px-4 py-2 border-b border-border mb-1">
                    <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                    <p className="text-xs text-text-muted truncate">{user?.email}</p>
                  </div>
                  <button 
                    onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}
                    className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-surface-hover flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-background w-full">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
