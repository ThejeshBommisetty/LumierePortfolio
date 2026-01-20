
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Showcase from './components/Showcase';
import Studio from './components/Studio';
import About from './components/About';
import Contact from './components/Contact';
import { Photo, ViewMode } from './types';

const STORAGE_KEY = 'potraits_plaza_v7_gallery';
const HERO_STORAGE_KEY = 'potraits_plaza_v7_heroes';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.SHOWCASE);
  const [hasError, setHasError] = useState(false);
  
  const [photos, setPhotos] = useState<Photo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch (e) { console.error(e); }
    
    // Premium Initial Samples
    return [
      { id: 'p1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200', title: 'Velvet Silence', category: 'Portrait', description: 'Shadow play on silk.', isPublished: true, isCategoryHero: false, layoutType: 'classic' },
      { id: 'p2', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200', title: 'The Architect', category: 'Portrait', description: 'Lines of character.', isPublished: true, isCategoryHero: false, layoutType: 'editorial' },
      { id: 'w1', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200', title: 'Eternal Gold', category: 'Pre-wed', description: 'Sunset vows.', isPublished: true, isCategoryHero: false, layoutType: 'wide' },
      { id: 'p3', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200', title: 'Golden Hour', category: 'Pre-wed', description: 'Warmth and whispers.', isPublished: true, isCategoryHero: false, layoutType: 'classic' },
      { id: 'k1', url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1200', title: 'Pure Joy', category: 'Kids', description: 'Unfiltered laughter.', isPublished: true, isCategoryHero: false, layoutType: 'classic' }
    ];
  });

  const [homeHeroes, setHomeHeroes] = useState<Photo[]>(() => {
    try {
      const saved = localStorage.getItem(HERO_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch (e) { console.error(e); }
    
    return [
      { id: 'h1', url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200', title: 'The Human Canvas', category: 'Portrait', description: 'Deep character studies.', isPublished: true, isCategoryHero: true, layoutType: 'editorial' },
      { id: 'h2', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200', title: 'Timeless Unions', category: 'Pre-wed', description: 'Cinematic wedding tales.', isPublished: true, isCategoryHero: true, layoutType: 'editorial' }
    ];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(homeHeroes));
  }, [homeHeroes]);

  const handleExport = () => {
    const data = JSON.stringify({ photos, homeHeroes }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portraits-plaza-backup.json`;
    a.click();
  };

  if (hasError) {
    return <div className="p-20 text-center font-serif">Something went wrong. Please refresh.</div>;
  }

  const renderContent = () => {
    switch (view) {
      case ViewMode.SHOWCASE: return <Showcase photos={photos} homeHeroes={homeHeroes} />;
      case ViewMode.ABOUT: return <About />;
      case ViewMode.CONTACT: return <Contact />;
      case ViewMode.ADMIN: return (
        <Studio 
          photos={photos} 
          onPhotosChange={setPhotos} 
          homeHeroes={homeHeroes} 
          onHomeHeroesChange={setHomeHeroes}
          onExport={handleExport}
        />
      );
      default: return <Showcase photos={photos} homeHeroes={homeHeroes} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navigation view={view} setView={setView} />
      <main>{renderContent()}</main>
      <footer className="border-t border-neutral-100 py-24 bg-white mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <h3 className="font-serif text-3xl mb-4 text-neutral-900">Potraits Plaza</h3>
            <p className="text-neutral-400 text-[10px] tracking-[0.3em] uppercase leading-relaxed font-bold">
              By Thejesh Bommisetty. Minimalist focus on character and light.
            </p>
          </div>
          <div className="flex gap-20">
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-bold mb-6 text-neutral-900">Navigation</h4>
              <ul className="text-xs text-neutral-400 space-y-4 uppercase tracking-[0.2em]">
                <li><button onClick={() => setView(ViewMode.SHOWCASE)} className="hover:text-amber-600 transition-colors">The Work</button></li>
                <li><button onClick={() => setView(ViewMode.ABOUT)} className="hover:text-amber-600 transition-colors">The Story</button></li>
                <li><button onClick={() => setView(ViewMode.CONTACT)} className="hover:text-amber-600 transition-colors">Connect</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-bold mb-6 text-neutral-900">Social</h4>
              <ul className="text-xs text-neutral-400 space-y-4 uppercase tracking-[0.2em]">
                <li><a href="https://instagram.com/potraits_plaza" target="_blank" className="hover:text-amber-600 transition-colors">Instagram</a></li>
                <li><a href="mailto:potraitsplaza@gmail.com" className="hover:text-amber-600 transition-colors">Email</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
