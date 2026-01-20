
import React, { useState, useEffect } from 'react';
import { Photo } from '../types';
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

  const LOGO_SRC = "/assets/logo/logo.png";
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
      const file = files[i];
      const processed = await new Promise<Photo | null>((resolve) => {
        const reader = new FileReader();
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
              isPublished: true, // Auto-publish for convenience, can be toggled
              isCategoryHero: activeTab === 'heroes',
              layoutType: 'classic'
            });
          } catch { 
            resolve({
              id: Math.random().toString(36).substr(2, 9),
              url: base64, 
              title: "Untitiled Composition",
              category: "General",
              description: "A moment captured.",
              isPublished: true,
              isCategoryHero: activeTab === 'heroes',
              layoutType: 'classic'
            }); 
          }
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

  const togglePublish = (id: string) => {
    const list = activeTab === 'gallery' ? photos : homeHeroes;
    const updated = list.map(p => p.id === id ? { ...p, isPublished: !p.isPublished } : p);
    activeTab === 'gallery' ? onPhotosChange(updated) : onHomeHeroesChange(updated);
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const list = [...(activeTab === 'gallery' ? photos : homeHeroes)];
    const index = list.findIndex(p => p.id === id);
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    activeTab === 'gallery' ? onPhotosChange(list) : onHomeHeroesChange(list);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-6">
        <div className="max-w-sm w-full bg-black p-12 border border-white/5 shadow-2xl rounded-sm flex flex-col items-center">
          <div className="w-20 h-20 mb-10 overflow-hidden flex items-center justify-center">
             <img 
               src={LOGO_SRC} 
               className="w-full h-full object-contain brightness-200" 
               alt="Studio Logo"
               onError={(e) => {
                 const target = e.target as HTMLImageElement;
                 target.src = "https://cdn-icons-png.flaticon.com/512/685/685655.png";
                 target.className = "w-12 h-12 object-contain invert opacity-10";
               }}
             />
          </div>
          <h2 className="font-serif text-3xl mb-12 text-center uppercase tracking-[0.2em] text-white">Studio</h2>
          <form onSubmit={handleLogin} className="w-full space-y-8">
            <input 
              type="password" 
              value={passcode} 
              onChange={e => setPasscode(e.target.value)} 
              placeholder="••••" 
              className="w-full bg-white/5 border border-white/10 p-6 text-center tracking-[1em] focus:outline-none focus:border-amber-600 text-white font-bold" 
              autoFocus 
            />
            <button className="w-full bg-amber-600 text-white py-5 text-[10px] uppercase tracking-widest font-bold hover:bg-amber-700 transition-colors">Access Archive</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-40 pb-32 animate-fadeIn">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-12 border-b border-neutral-100 pb-16 mb-12">
        <div>
          <h2 className="font-serif text-5xl mb-4 text-neutral-900 tracking-tighter">Studio Management</h2>
          <p className="text-neutral-400 text-[10px] tracking-[0.6em] uppercase font-bold">
            {isUploading ? `AI Processing ${uploadProgress.current}/${uploadProgress.total}...` : 'Curate your vision'}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-end">
          <button onClick={onExport} className="bg-neutral-100 text-neutral-600 px-8 py-4 text-[9px] uppercase tracking-widest font-bold border border-neutral-200 hover:bg-neutral-200">Download Backup</button>
          <label className="cursor-pointer bg-black text-white px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-center hover:bg-neutral-800 transition-all">
            {isUploading ? 'Working...' : `Upload to ${activeTab === 'gallery' ? 'Gallery' : 'Hero Slider'}`}
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      <div className="flex gap-10 mb-12 border-b border-neutral-100">
        <button onClick={() => setActiveTab('gallery')} className={`pb-4 text-[10px] uppercase tracking-[0.4em] font-bold relative transition-colors ${activeTab === 'gallery' ? 'text-black' : 'text-neutral-300 hover:text-neutral-500'}`}>
          Full Archive ({photos.length})
          {activeTab === 'gallery' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-600"></span>}
        </button>
        <button onClick={() => setActiveTab('heroes')} className={`pb-4 text-[10px] uppercase tracking-[0.4em] font-bold relative transition-colors ${activeTab === 'heroes' ? 'text-black' : 'text-neutral-300 hover:text-neutral-500'}`}>
          Showcase Heroes ({homeHeroes.length})
          {activeTab === 'heroes' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-600"></span>}
        </button>
      </div>

      <div className="space-y-4 mb-20">
        {(activeTab === 'gallery' ? photos : homeHeroes).map((p, idx) => (
           <div key={p.id} className="bg-white border border-neutral-100 p-6 flex flex-wrap items-center gap-8 group hover:border-amber-600/30 transition-all duration-500">
            <div className="w-24 h-24 overflow-hidden rounded-sm bg-neutral-50 flex-shrink-0 relative">
               <img src={p.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
               {!p.isPublished && (
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-[8px] text-white uppercase tracking-widest font-bold bg-red-600 px-2">Draft</span>
                 </div>
               )}
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[8px] uppercase font-bold text-amber-600 tracking-widest px-2 py-0.5 bg-amber-50 rounded-sm">{p.category}</span>
                <span className="text-[8px] uppercase font-bold text-neutral-300 tracking-widest">#{idx + 1}</span>
              </div>
              <h4 className="font-serif text-2xl text-neutral-900 mb-1">{p.title}</h4>
              <p className="text-[11px] text-neutral-400 font-light italic truncate max-w-md">{p.description}</p>
            </div>
            <div className="flex items-center gap-4 border-l border-neutral-100 pl-8">
              <div className="flex flex-col gap-2">
                <button onClick={() => moveItem(p.id, 'up')} className="p-2 hover:bg-neutral-50 text-neutral-400 hover:text-black transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <button onClick={() => moveItem(p.id, 'down')} className="p-2 hover:bg-neutral-50 text-neutral-400 hover:text-black transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
              
              <button 
                onClick={() => togglePublish(p.id)}
                className={`px-4 py-2 text-[9px] uppercase tracking-widest font-bold border transition-all ${p.isPublished ? 'bg-neutral-50 text-neutral-400 border-neutral-100 hover:bg-red-50 hover:text-red-500' : 'bg-black text-white border-black hover:bg-neutral-800'}`}
              >
                {p.isPublished ? 'Unpublish' : 'Publish'}
              </button>

              <button 
                onClick={() => {
                  const confirmed = confirm(`Are you sure you want to remove "${p.title}"?`);
                  if (confirmed) {
                    activeTab === 'gallery' 
                      ? onPhotosChange(photos.filter(x => x.id !== p.id)) 
                      : onHomeHeroesChange(homeHeroes.filter(x => x.id !== p.id));
                  }
                }} 
                className="p-4 text-neutral-200 hover:text-red-500 hover:bg-red-50 transition-all rounded-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        ))}
        {(activeTab === 'gallery' ? photos : homeHeroes).length === 0 && (
          <div className="py-32 text-center border-2 border-dashed border-neutral-100 rounded-sm bg-neutral-50/50">
            <p className="text-neutral-300 text-[10px] uppercase tracking-[0.5em] font-bold">No assets found in this collection</p>
            <p className="text-neutral-400 text-[9px] mt-4">Upload high-resolution images to begin your showcase</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Studio;
