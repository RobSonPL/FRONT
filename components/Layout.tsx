
import React from 'react';
import { StepId } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentStep: StepId;
}

const Layout: React.FC<LayoutProps> = ({ children, currentStep }) => {
  const steps = [
    "Diagnoza", "Mapa", "Manifest", "Dashboard", "Głos Klienta", "Samoobsługa", "Sprint", "Feedback", "Strategia"
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar with Dark Gradient */}
      <aside className="w-full md:w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white p-8 sticky top-0 h-auto md:h-screen overflow-y-auto shadow-2xl z-10 flex flex-col">
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold tracking-tighter flex items-center gap-3">
            <span className="bg-blue-600 px-2.5 py-1 rounded-lg text-sm shadow-lg shadow-blue-500/20">AI</span> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">FRONT</span>
          </h1>
          <p className="text-blue-400/80 text-[10px] mt-2 uppercase tracking-[0.2em] font-bold">Customer Experience OS</p>
        </div>
        
        <nav className="space-y-2 flex-1">
          {steps.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;
            
            return (
              <div 
                key={label}
                className={`group flex items-center gap-4 p-3.5 rounded-xl transition-all duration-300 ${
                  isActive 
                  ? 'bg-blue-600 shadow-lg shadow-blue-600/30 text-white' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs border transition-all duration-300 ${
                  isActive 
                  ? 'border-white/40 bg-white/20 text-white font-bold rotate-3' 
                  : isCompleted 
                    ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10' 
                    : 'border-slate-700 group-hover:border-slate-500'
                }`}>
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span className={`text-sm font-semibold tracking-wide ${isActive ? 'translate-x-1' : ''} transition-transform`}>
                  {label}
                </span>
              </div>
            );
          })}
        </nav>

        <div className="mt-12 pt-8 border-t border-white/5 hidden md:block space-y-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Silnik Systemu</p>
            <p className="text-xs text-slate-300 font-medium">Gemini 3 Pro Preview</p>
          </div>
          <div className="px-4 py-2">
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Made by R | H</p>
            <p className="text-[10px] text-slate-600 font-medium">2025</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-16 max-w-6xl mx-auto w-full">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
