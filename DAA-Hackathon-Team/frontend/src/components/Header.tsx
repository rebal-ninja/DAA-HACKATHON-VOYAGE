import React from 'react';
import type { ActiveTab } from '../types';
import { Compass, Route, BarChart3, FlaskConical, MapPin, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  stopsCount: number;
  hasResult: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  stopsCount,
  hasResult,
  theme,
  onToggleTheme,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Compass className="w-4 h-4" /> },
    {
      id: 'planner',
      label: 'Route Planner',
      icon: <Route className="w-4 h-4" />,
      badge: stopsCount > 0 ? `${stopsCount}` : undefined,
    },
    {
      id: 'results',
      label: 'Interactive Map & Results',
      icon: <MapPin className="w-4 h-4" />,
      badge: hasResult ? 'Ready' : undefined,
    },
    { id: 'comparison', label: 'Algorithm Comparison', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'lab', label: 'Algorithm Lab', icon: <FlaskConical className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#080d1a]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Title */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onTabChange('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-400 to-blue-500 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all duration-300">
              <div className="w-full h-full bg-[#070b14] rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="brand-wordmark text-xl font-extrabold tracking-tight">
                  Voyage<span className="text-cyan-400">AI</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 uppercase">
                  DAA Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 font-medium hidden sm:block">
                Intelligent Route Optimization & Complexity Analysis
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/60">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 relative ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-cyan-400 text-slate-950'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status Indicator */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">OSRM & DAA Live</span>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-pressed={theme === 'dark'}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 sm:px-3"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1.5 no-scrollbar border-t border-slate-800/60">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
