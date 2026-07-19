import React from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { FileText, Map, ShieldAlert, Settings, Clock, UserCog, User, TerminalSquare, CloudRain, Sun } from 'lucide-react';
import { cn } from './ui/Card';

export default function Sidebar({ onToggleTestConsole }) {
  const { activeView, setActiveView, role, setRole, weather, setWeather, fastForwardTime, resetTime, simulatedTime } = useComplaints();

  const citizenNav = [
    { id: 'file', label: 'File Complaint', icon: FileText },
    { id: 'track', label: 'Track Issues', icon: Map },
  ];

  const staffNav = [
    { id: 'admin', label: 'Admin Dashboard', icon: ShieldAlert },
  ];

  const isSimulatedFuture = simulatedTime > Date.now() + 1000;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col hidden md:flex shrink-0" aria-label="Sidebar Navigation">
      <header className="p-6 border-b border-slate-100 flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-municipal-indigo" tabIndex={0}>
        <div className="bg-municipal-indigo text-white p-2 rounded-lg" aria-hidden="true">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg text-slate-900 leading-tight">CivicAI</h1>
          <p className="text-xs text-slate-500 font-medium">Smart City Agent</p>
        </div>
      </header>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        <section aria-labelledby="role-context-heading">
          <h2 id="role-context-heading" className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
            Role Context
          </h2>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              className={cn("flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400", role === 'citizen' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              onClick={() => { setRole('citizen'); if(activeView === 'admin') setActiveView('file'); }}
              aria-pressed={role === 'citizen'}
            >
              <User size={14} aria-hidden="true" /> Citizen
            </button>
            <button
              className={cn("flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400", role === 'staff' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              onClick={() => setRole('staff')}
              aria-pressed={role === 'staff'}
            >
              <UserCog size={14} aria-hidden="true" /> Staff
            </button>
          </div>
        </section>

        <section aria-labelledby="citizen-portal-heading">
          <h2 id="citizen-portal-heading" className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
            Citizen Portal
          </h2>
          <ul className="space-y-1">
            {citizenNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveView(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-municipal-indigo",
                      isActive 
                        ? "bg-indigo-50 text-municipal-indigo" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={18} className={cn("transition-colors", isActive ? "text-municipal-indigo" : "text-slate-400 group-hover:text-slate-600")} aria-hidden="true" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {role === 'staff' && (
          <section aria-labelledby="staff-operations-heading">
            <h2 id="staff-operations-heading" className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mt-2 mb-3 px-3">
              Staff Operations
            </h2>
            <ul className="space-y-1">
              {staffNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveView(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-municipal-emerald",
                        isActive 
                          ? "bg-emerald-50 text-municipal-emerald" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon size={18} className={cn("transition-colors", isActive ? "text-municipal-emerald" : "text-slate-400 group-hover:text-slate-600")} aria-hidden="true" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </nav>

      <section className="p-4 border-t border-slate-100 space-y-3 bg-slate-50" aria-label="Simulation Controls">
        <div className="text-xs font-semibold text-slate-500 px-2 flex items-center justify-between">
          <span>Simulation Controls</span>
          <Settings size={12} aria-hidden="true" />
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-lg">
          <button
            className={cn("flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2", weather === 'Clear' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            onClick={() => setWeather('Clear')}
            aria-pressed={weather === 'Clear'}
          >
            <Sun size={12} aria-hidden="true" /> Clear
          </button>
          <button
            className={cn("flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2", weather === 'Heavy Rain' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            onClick={() => setWeather('Heavy Rain')}
            aria-pressed={weather === 'Heavy Rain'}
          >
            <CloudRain size={12} aria-hidden="true" /> Rain
          </button>
        </div>

        <button 
          onClick={fastForwardTime}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:border-amber-300 text-amber-700 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-sm"
          title="Simulate 5 days passing"
        >
          <Clock size={14} aria-hidden="true" /> Fast Forward 5 Days
        </button>
        
        {isSimulatedFuture && (
          <button 
            onClick={resetTime}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Reset Time
          </button>
        )}
        
        <button 
          onClick={onToggleTestConsole}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
        >
          <TerminalSquare size={14} aria-hidden="true" /> Unit Tests Console
        </button>
      </section>
    </aside>
  );
}
