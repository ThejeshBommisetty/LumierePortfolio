
import React from 'react';
import { ViewMode } from '../types';

interface NavigationProps {
  view: ViewMode;
  setView: (view: ViewMode) => void;
}

const Navigation: React.FC<NavigationProps> = ({ view, setView }) => {
  const navLinks = [
    { mode: ViewMode.SHOWCASE, label: 'Work' },
    { mode: ViewMode.ABOUT, label: 'Story' },
    { mode: ViewMode.CONTACT, label: 'Connect' }
  ];

  // Pointing to your requested local directory
  const LOGO_SRC = "/assets/logo/logo.png";

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <button 
          onClick={() => setView(ViewMode.SHOWCASE)}
          className="flex items-center gap-4 group"
        >
          <div className="h-10 w-16 flex items-center justify-center transition-all group-hover:scale-110 duration-500">
            <img 
              src={LOGO_SRC} 
              alt="Portraits Plaza Logo" 
              className="h-full w-full object-contain"
              onError={(e) => {
                // Fallback icon if the file isn't uploaded yet
                (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/685/685655.png";
                (e.target as HTMLImageElement).className = "h-full w-full object-contain opacity-20 grayscale";
              }}
            />
          </div>
          <div className="flex flex-col items-start leading-none border-l border-neutral-100 pl-4">
            <span className="text-lg font-serif font-bold tracking-[0.1em] uppercase">Potraits Plaza</span>
            <span className="text-[7px] tracking-[0.5em] uppercase text-amber-600 font-bold mt-1">By Thejesh Bommisetty</span>
          </div>
        </button>
        
        <div className="flex items-center space-x-10 text-[9px] uppercase tracking-[0.4em] font-bold">
          {navLinks.map((link) => (
            <button 
              key={link.mode}
              onClick={() => setView(link.mode)}
              className={`${view === link.mode ? 'text-black' : 'text-neutral-300'} hover:text-black transition-all relative py-2`}
            >
              {link.label}
              {view === link.mode && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-black"></span>
              )}
            </button>
          ))}
          <button 
            onClick={() => setView(ViewMode.ADMIN)}
            className={`pl-4 border-l border-neutral-100 flex items-center gap-2 ${view === ViewMode.ADMIN ? 'text-black' : 'text-neutral-300 hover:text-black'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Studio
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
