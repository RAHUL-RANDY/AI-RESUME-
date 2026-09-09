import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  Mic,
  BookOpen,
  Menu
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu }) => {
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Home', icon: Sparkles },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/voice-interview', label: 'Voice AI', icon: Mic, badge: 'AI' },
    { to: '/courses', label: 'Courses', icon: BookOpen },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-800/80 backdrop-blur-2xl bg-slate-950/90 px-3 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'text-sky-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2.5 px-1 py-0.2 rounded-full text-[8px] font-extrabold bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-0.5 shadow-sm shadow-sky-400/80" />
              )}
            </Link>
          );
        })}

        {/* More / Menu Drawer Trigger */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          aria-label="Open Full Mobile Menu"
        >
          <Menu className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
};
