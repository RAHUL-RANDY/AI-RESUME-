import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  UploadCloud,
  Bot,
  Briefcase,
  ShieldCheck,
  LogOut,
  LogIn,
  UserCheck,
  CreditCard,
  Crown,
  BookOpen,
  Mic,
  FileText,
  Send,
  Kanban,
  Code2,
  ChevronDown,
  Menu,
  X,
  User,
  DollarSign,
  Terminal,
  Globe,
  FileQuestion,
  Award
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mobileMenuOpen: controlledOpen,
  setMobileMenuOpen: controlledSetOpen,
}) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDrawerOpen = controlledOpen !== undefined ? controlledOpen : internalMobileOpen;
  const setDrawerOpen = (open: boolean) => {
    if (controlledSetOpen) {
      controlledSetOpen(open);
    } else {
      setInternalMobileOpen(open);
    }
  };

  // Close drawer on route navigation
  useEffect(() => {
    setDrawerOpen(false);
    setToolsOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const aiFeatures = [
    { to: '/jobs', label: 'AI Job Search & Match', icon: Briefcase, badge: 'SBERT' },
    { to: '/salary-negotiator', label: 'Offer & Salary Studio', icon: DollarSign, badge: 'High TC' },
    { to: '/coding-arena', label: 'AI Coding & DSA Arena', icon: Terminal, badge: 'Live DSA' },
    { to: '/portfolio-builder', label: 'AI Portfolio Builder', icon: Globe, badge: '1-Click Site' },
    { to: '/smart-answers', label: 'Smart Job Answers', icon: FileQuestion, badge: 'Greenhouse' },
    { to: '/assessments', label: 'Skill Badges & Certs', icon: Award, badge: 'Verified' },
    { to: '/voice-interview', label: 'Voice AI Interview', icon: Mic, badge: 'Live Audio' },
    { to: '/resume-builder', label: 'ATS Resume Builder', icon: FileText, badge: '1-Click PDF' },
    { to: '/cover-letter', label: 'AI Cover Letter & DMs', icon: Send, badge: 'High Yield' },
    { to: '/tracker', label: 'Job Application Tracker', icon: Kanban, badge: 'Kanban' },
    { to: '/developer-profile', label: 'Dev Profile Intel', icon: Code2, badge: 'GitHub + DSA' },
  ];

  const navLinks = [
    { to: '/', label: 'Home', icon: Sparkles },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/jobs', label: 'Find Jobs', icon: Briefcase },
    { to: '/upload', label: 'Analyze Resume', icon: UploadCloud },
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/mentor', label: 'AI Mentor', icon: Bot },
    { to: '/pricing', label: 'Pricing', icon: CreditCard },
  ];

  const isAiToolActive = aiFeatures.some(f => location.pathname === f.to);

  return (
    <>
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-sky-400" />
              </div>
            </div>
            <div>
              <span className="font-bold text-base tracking-tight gradient-text">CareerIntel</span>
              <span className="text-[10px] text-slate-400 block tracking-widest uppercase font-semibold">AI Intelligence</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}

            {/* AI Studio Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isAiToolActive
                    ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>AI Tools</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>

              {toolsOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl glass-card border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    AI Power Features
                  </div>
                  {aiFeatures.map((tool) => {
                    const ToolIcon = tool.icon;
                    const isCurrent = location.pathname === tool.to;
                    return (
                      <Link
                        key={tool.to}
                        to={tool.to}
                        onClick={() => setToolsOpen(false)}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs transition ${
                          isCurrent
                            ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                            : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ToolIcon className="w-4 h-4 text-sky-400" />
                          <span>{tool.label}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {tool.badge}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Desktop User Status */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/pricing"
                  className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition border ${
                    user.subscription_tier === 'pro'
                      ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-300 border-sky-500/40 shadow-sm shadow-sky-500/10'
                      : user.subscription_tier === 'enterprise'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-sky-300 border-slate-700'
                  }`}
                  title="Manage Subscription"
                >
                  {user.subscription_tier === 'pro' ? (
                    <>
                      <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>PRO</span>
                    </>
                  ) : user.subscription_tier === 'enterprise' ? (
                    <>
                      <Crown className="w-3 h-3 text-purple-400 fill-purple-400" />
                      <span>ENTERPRISE</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-sky-400" />
                      <span>UPGRADE</span>
                    </>
                  )}
                </Link>

                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">{user.name}</span>
                  <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow hover:opacity-90 transition-opacity"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setDrawerOpen(!isDrawerOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors focus:outline-none cursor-pointer border border-slate-800"
              aria-label="Toggle navigation menu"
            >
              {isDrawerOpen ? <X className="w-5 h-5 text-sky-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer Overlay */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative ml-auto w-full max-w-xs h-full bg-slate-900 border-l border-slate-800 flex flex-col justify-between p-5 z-10 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 p-0.5">
                    <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                  </div>
                  <span className="font-bold text-sm text-white">Career Navigation</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Quick Info */}
              {user ? (
                <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800 mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-tight truncate max-w-[140px]">{user.name}</div>
                      <div className="text-[10px] text-sky-400 uppercase font-semibold tracking-wider mt-0.5">
                        {user.role} • {user.subscription_tier || 'Free'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setDrawerOpen(false);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <Link
                    to="/login"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 text-xs font-semibold text-white border border-slate-700"
                  >
                    <LogIn className="w-3.5 h-3.5 text-sky-400" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-xs font-semibold text-white shadow-md"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Register
                  </Link>
                </div>
              )}

              {/* Main Links */}
              <div className="space-y-1 mb-5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                  Core Pages
                </div>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-sky-500/15 text-sky-300 font-bold border border-sky-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-sky-400" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* AI Features */}
              <div className="space-y-1 mb-5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400 px-2 py-1 flex items-center justify-between">
                  <span>AI Power Tools</span>
                  <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded-full font-bold">{aiFeatures.length} Tools</span>
                </div>
                {aiFeatures.map((tool) => {
                  const ToolIcon = tool.icon;
                  const isCurrent = location.pathname === tool.to;
                  return (
                    <Link
                      key={tool.to}
                      to={tool.to}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition ${
                        isCurrent
                          ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ToolIcon className="w-4 h-4 text-sky-400" />
                        <span>{tool.label}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                        {tool.badge}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Other Roles & Administration */}
              <div className="space-y-1 pt-3 border-t border-slate-800">
                <Link
                  to="/admin"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800/60"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Admin Panel</span>
                </Link>
                <Link
                  to="/recruiter"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800/60"
                >
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span>Recruiter Portal</span>
                </Link>
              </div>
            </div>

            {/* Bottom of Drawer */}
            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
              CareerIntel • AI Intelligence Suite
            </div>
          </div>
        </div>
      )}
    </>
  );
};

