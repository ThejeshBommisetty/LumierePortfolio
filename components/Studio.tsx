
import React, { useState, useEffect, useMemo } from 'react';
import { Photo, LayoutType } from '../types';
import { analyzePhoto } from '../services/geminiService';

interface StudioProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  homeHeroes: Photo[];
  onHomeHeroesChange: (heroes: Photo[]) => void;
  onExport: () => void;
}

const Studio: React.FC<StudioProps> = ({ photos, onPhotosChange, homeHeroes, onHomeHeroesChange, onExport }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState<'gallery' | 'heroes'>('gallery');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [isSortMode, setIsSortMode] = useState(false);

  const LOGO_SRC = "/assets/logo/logo.png";

  const [ghToken, setGhToken] = useState(() => sessionStorage.getItem('gh_token') || '');
  const [ghRepo, setGhRepo] = useState(() => sessionStorage.getItem('gh_repo') || ''); 
  const [ghPath, setGhPath] = useState(() => sessionStorage.getItem('gh_path') || 'assets/gallery');

  const OWNER_PASSCODE = '1234';

  useEffect(() => {
    if (sessionStorage.getItem('potraits_auth') === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === OWNER_PASSCODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('potraits_auth', 'true');
    } else {
      setPasscode('');
      alert('Invalid Passcode');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length });
    const newItems: Photo[] = [];
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      const file = files[i];
      const processed = await new Promise<Photo | null>((resolve) => {
        reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          try {
            const analysis = await analyzePhoto(base64);
            resolve({
              id: Math.random().toString(36).substr(2, 9),
              url: base64, 
              title: analysis.title,
              category: analysis.category,
              description: analysis.description,
              isPublished: false,
              isCategoryHero: activeTab === 'heroes',
              layoutType: 'classic'
            });
          } catch { resolve(null); }
        };
        reader.readAsDataURL(file);
      });
      if (processed) newItems.push(processed);
      setUploadProgress(prev => ({ ...prev, current: i + 1 }));
    }
    if (activeTab === 'gallery') onPhotosChange([...photos, ...newItems]);
    else onHomeHeroesChange([...homeHeroes, ...newItems]);
    setIsUploading(false);
  };

  const moveItem = (id: string, direction: 'up' | 'down', list: Photo[], updateFn: (l: Photo[]) => void) => {
    const index = list.findIndex(p => p.id === id);
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    updateFn(next);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 px-6">
        <div className="max-w-sm w-full bg-black p-12 border border-white/5 shadow-2xl rounded-sm flex flex-col items-center">
          <div className="w-24 h-24 mb-8">
             <img 
               src={LOGO_SRC} 
               className="w-full h-full object-contain" 
               alt="Studio Logo"
               onError={(e) => {
                 (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/685/685655.png";
                 (e.target as HTMLImageElement).className = "w-full h-full object-contain invert opacity-20";
               }}
             />
          </div>
          <h2 className="font-serif text-3xl mb-10 text-center uppercase tracking-tighter text-white">Studio Vault</h2>
          <form onSubmit={handleLogin} className="w-full space-y-6">
            <input 
              type="password" 
              value={passcode} 
              onChange={e => setPasscode(e.target.value)} 
              placeholder="PASSCODE" 
              className="w-full bg-white/5 border border-white/10 p-6 text-center tracking-[0.8em] focus:outline-none focus:border-amber-600 text-white" 
              autoFocus 
            />
            <button className="w-full bg-amber-600 text-white py-5 text-[10px] uppercase tracking-widest font-bold hover:bg-amber-700 transition-colors">Open Studio</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-40 pb-32">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-12 border-b border-neutral-100 pb-16 mb-12">
        <div>
          <h2 className="font-serif text-5xl mb-4 text-neutral-900">The Studio</h2>
          <p className="text-neutral-400 text-[10px] tracking-[0.6em] uppercase">
            {isUploading ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...` : 'Archive Management'}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-end">
          <button onClick={onExport} className="bg-neutral-100 text-neutral-600 px-8 py-4 text-[9px] uppercase tracking-widest font-bold border border-neutral-200 hover:bg-neutral-200">Export JSON</button>
          <label className="cursor-pointer bg-black text-white px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-center hover:bg-neutral-800 transition-all">
            {isUploading ? 'Working...' : `Add to ${activeTab === 'gallery' ? 'Archive' : 'Home Heroes'}`}
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      <div className="flex gap-10 mb-12 border-b border-neutral-100">
        <button onClick={() => setActiveTab('gallery')} className={`pb-4 text-[10px] uppercase tracking-[0.4em] font-bold relative ${activeTab === 'gallery' ? 'text-black' : 'text-neutral-300'}`}>
          Archives ({photos.length})
          {activeTab === 'gallery' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-600"></span>}
        </button>
        <button onClick={() => setActiveTab('heroes')} className={`pb-4 text-[10px] uppercase tracking-[0.4em] font-bold relative ${activeTab === 'heroes' ? 'text-black' : 'text-neutral-300'}`}>
          Home Heroes ({homeHeroes.length})
          {activeTab === 'heroes' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-600"></span>}
        </button>
      </div>

      <div className="space-y-4 mb-20">
        {(activeTab === 'gallery' ? photos : homeHeroes).map(p => (
           <div key={p.id} className="bg-white border border-neutral-100 p-6 flex flex-wrap items-center gap-6 group hover:border-black transition-all">
            <img src={p.url} className="w-20 h-20 object-cover bg-neutral-50" />
            <div className="flex-grow">
              <span className="text-[9px] uppercase font-bold text-amber-600 tracking-widest">{p.category}</span>
              <h4 className="font-serif text-xl text-neutral-900">{p.title}</h4>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => moveItem(p.id, 'up', (activeTab === 'gallery' ? photos : homeHeroes), (activeTab === 'gallery' ? onPhotosChange : onHomeHeroesChange))} className="p-2 hover:bg-neutral-100 rounded">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
              </button>
              <button onClick={() => (activeTab === 'gallery' ? onPhotosChange(photos.filter(x => x.id !== p.id)) : onHomeHeroesChange(homeHeroes.filter(x => x.id !== p.id)))} className="text-neutral-300 hover:text-red-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Studio;
