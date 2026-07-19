import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TestConsole from './TestConsole';

export default function Layout({ children }) {
  const [showTestConsole, setShowTestConsole] = useState(false);

  return (
    <div className="min-h-screen flex bg-municipal-light w-full">
      <Sidebar onToggleTestConsole={() => setShowTestConsole(!showTestConsole)} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between" role="banner">
          <div className="flex items-center gap-2">
            <div className="bg-municipal-indigo text-white p-1.5 rounded-md" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 9-5-9-5-9 5 9 5z"/><path d="m12 14 9-5-9-5-9 5 9 5z"/><path d="m12 14 9-5-9-5-9 5 9 5z"/><path d="m12 14 9-5-9-5-9 5 9 5z"/></svg>
            </div>
            <span className="font-bold text-lg">CivicAI</span>
          </div>
          <button className="p-2 text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-municipal-indigo rounded-md" aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10" id="main-content" role="main">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>

        {/* Live Testing Console Drawer */}
        {showTestConsole && (
          <div className="absolute top-0 right-0 h-full w-full max-w-md shadow-2xl z-50">
            <TestConsole onClose={() => setShowTestConsole(false)} />
          </div>
        )}
      </main>
    </div>
  );
}
