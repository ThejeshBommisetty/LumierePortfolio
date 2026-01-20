
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
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [homeHeroes, setHomeHeroes] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      let dataLoaded = false;
      
      try {
        const response = await fetch('./portfolio-data.json');
        if (response.ok) {
          const data = await response.json();
          if (data.photos) setPhotos(data.photos);
          if (data.homeHeroes) setHomeHeroes(data.homeHeroes);
          dataLoaded = true;
        }
      } catch (e) {
        console.log("No public data found.");
      }

      if (!dataLoaded) {
        try {
          const savedPhotos = localStorage.getItem(STORAGE_KEY);
          const savedHeroes = localStorage.getItem(HERO_STORAGE_KEY);
          if (savedPhotos) setPhotos(JSON.parse(savedPhotos));
          if (savedHeroes) setHomeHeroes(JSON.parse(savedHeroes));
        } catch (e) {}
      }
      setIsLoading(false);
    };
    initData();
  }, []);

  useEffect(() => {
    if (photos.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    if (homeHeroes.length > 0) localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(homeHeroes));
  }, [homeHeroes]);

  const handleExport = () => {
    const data = JSON.stringify({ photos, homeHeroes }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-data.json`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 border-2 border-neutral-100 border-t-amber-600 rounded-full animate-spin"></div>
          <div className="text-[10px] uppercase tracking-[0.8em] font-bold text-neutral-400">Opening Archive</div>
        </div>
      </div>
    );
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
      <main className="animate-fadeIn">{renderContent()}</main>
      <footer className="border-t border-neutral-100 py-32 bg-white mt-40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="max-w-sm">
            <h3 className="font-serif text-4xl mb-6 text-neutral-900">Potraits Plaza</h3>
            <p className="text-neutral-400 text-[11px] tracking-[0.3em] uppercase leading-loose font-bold italic">
              Bengaluru based photography studio.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-24 gap-y-12">
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-bold mb-8 text-neutral-900 border-b border-neutral-50 pb-2">Archive</h4>
              <ul className="text-[10px] text-neutral-400 space-y-5 uppercase tracking-[0.3em] font-bold">
                <li><button onClick={() => { setView(ViewMode.SHOWCASE); window.scrollTo(0,0); }} className="hover:text-amber-600 transition-colors">The Work</button></li>
                <li><button onClick={() => { setView(ViewMode.ABOUT); window.scrollTo(0,0); }} className="hover:text-amber-600 transition-colors">The Artist</button></li>
                <li><button onClick={() => { setView(ViewMode.CONTACT); window.scrollTo(0,0); }} className="hover:text-amber-600 transition-colors">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-bold mb-8 text-neutral-900 border-b border-neutral-50 pb-2">Studio</h4>
              <ul className="text-[10px] text-neutral-400 space-y-5 uppercase tracking-[0.3em] font-bold">
                <li><button onClick={() => { setView(ViewMode.ADMIN); window.scrollTo(0,0); }} className="hover:text-amber-600 transition-colors">Management</button></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-24 pt-8 border-t border-neutral-50 flex justify-between items-center">
          <p className="text-[9px] uppercase tracking-widest text-neutral-300 font-bold">© {new Date().getFullYear()} Potraits Plaza</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
