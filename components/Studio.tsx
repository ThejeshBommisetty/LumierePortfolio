
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
  const [activeTab, setActiveTab] = useState<'gallery' | 'heroes' | 'publish'>('gallery');
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  
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
      alert('Invalid PIN');
    }
  };

  const handleManualAdd = async () => {
    if (!manualUrl) return;
    setIsProcessing(true);
    try {
      // Analyze the image from your GitHub URL using AI
      const analysis = await analyzePhoto(manualUrl);
      const newPhoto: Photo = {
        id: Math.random().toString(36).substr(2, 9),
        url: manualUrl, // Use the existing GitHub URL
        title: analysis.title,
        category: analysis.category,
        description: analysis.description,
        isPublished: true,
        isCategoryHero: activeTab === 'heroes',
        layoutType: 'classic'
      };

      if (activeTab === 'gallery') onPhotosChange([...photos, newPhoto]);
      else onHomeHeroesChange([...homeHeroes, newPhoto]);
      setManualUrl('');
    } catch (err) {
      alert("Verification failed. Ensure it is a direct image link.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleLayout = (id: string) => {
    const layouts: LayoutType[] = ['classic', 'editorial', 'wide'];
    const update = (list: Photo[]) => list.map(p => {
      if (p.id === id) {
        const nextIdx = (layouts.indexOf(p.layoutType) + 1) % layouts.length;
        return { ...p, layoutType: layouts[nextIdx] };
      }
      return p;
    });
    activeTab === 'gallery' ? onPhotosChange(update(photos)) : onHomeHeroesChange(update(homeHeroes));
  };

  const groupedPhotos = useMemo(() => {
    const currentList = activeTab === 'gallery' ? photos : homeHeroes;
    const groups: Record<string, Photo[]> = {};
    currentList.forEach(p => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return groups;
  }, [photos, homeHeroes, activeTab]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-6">
        <div className="max-w-sm w-full bg-black p-12 border border-white/5 rounded-sm flex flex-col items-center">
          <h2 className="font-serif text-3xl mb-12 text-center tracking-[0.2em] text-white uppercase">Archive Access</h2>
          <form onSubmit={handleLogin} className="w-full space-y-8">
            <input 
              type="password" 
              value={passcode} 
              onChange={e => setPasscode(e.target.value)} 
              placeholder="••••" 
              className="w-full bg-white/5 border border-white/10 p-6 text-center tracking-[1em] text-white font-bold text-2xl" 
              autoFocus 
            />
            <button className="w-full bg-amber-600 text-white py-5 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-amber-700 transition-all">Authorize</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-40 pb-32 animate-fadeIn">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-10 border-b border-neutral-100 pb-16 mb-16">
        <div>
          <h2 className="font-serif text-5xl mb-4 tracking-tighter">Studio Management</h2>
          <p className="text-neutral-400 text-[10px] tracking-[0.5em] uppercase font-bold">
            {isProcessing ? `AI Syncing Meta-data...` : 'Live Portfolio Controller'}
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => setActiveTab('publish')} className="bg-amber-600 text-white px-8 py-4 text-[10px] uppercase tracking-widest font-bold shadow-2xl hover:bg-amber-700 transition-all">Publish To Live</button>
          <button onClick={onExport} className="bg-black text-white px-8 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-neutral-800 transition-all">Download Data</button>
        </div>
      </div>

      <div className="flex gap-12 mb-16 border-b border-neutral-100">
        {['gallery', 'heroes'].map((t) => (
          <button key={t} onClick={() => setActiveTab(t as any)} className={`pb-6 text-[11px] uppercase tracking-[0.4em] font-bold relative transition-colors ${activeTab === t ? 'text-black' : 'text-neutral-300 hover:text-black'}`}>
            {t === 'gallery' ? 'Archive Collection' : 'Featured Showcase'}
            {activeTab === t && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-600 animate-fadeIn"></span>}
          </button>
        ))}
      </div>

      {activeTab === 'publish' ? (
        <div className="max-w-4xl bg-white border border-neutral-100 p-16 space-y-12 animate-slideUp shadow-sm">
          <h3 className="font-serif text-4xl leading-tight text-neutral-900">Finalizing your live portfolio</h3>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-2xl">
            You've already uploaded photos to GitHub. Now, click <strong>"Download Data"</strong> above to get your <code>portfolio-data.json</code>. 
            Upload this JSON file to your GitHub root to make your curated gallery public.
          </p>
          <div className="p-8 bg-neutral-900 text-white text-[10px] uppercase tracking-[0.4em] font-bold leading-loose text-center">
            Note: Your JPG files on GitHub are safe and ignored by the code updates.
          </div>
          <button onClick={() => setActiveTab('gallery')} className="border border-neutral-200 text-neutral-400 px-8 py-4 text-[10px] uppercase tracking-widest font-bold hover:text-black transition-all">Back to Studio</button>
        </div>
      ) : (
        <div className="space-y-20">
          {/* Add Section */}
          <div className="bg-neutral-50 p-10 rounded-sm border border-neutral-100">
             <div className="space-y-6 max-w-2xl">
               <label className="text-[10px] text-neutral-400 uppercase tracking-[0.4em] font-bold block">Add photo from GitHub path</label>
               <div className="flex gap-4">
                 <input 
                  type="text" 
                  placeholder="https://raw.githubusercontent.com/username/repo/main/path/to/photo.jpg" 
                  className="flex-grow bg-white border border-neutral-200 p-5 text-xs font-mono outline-none focus:border-amber-600 transition-colors"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                 />
                 <button 
                  onClick={handleManualAdd} 
                  disabled={isProcessing}
                  className="bg-black text-white px-10 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-neutral-800 disabled:bg-neutral-200 transition-all"
                 >
                   {isProcessing ? 'Analysing...' : 'Link Piece'}
                 </button>
               </div>
               <p className="text-[9px] text-neutral-400 uppercase tracking-widest leading-loose italic">
                 The AI will automatically generate a title, category, and description based on the image content.
               </p>
             </div>
          </div>

          {/* List View */}
          {Object.entries(groupedPhotos).map(([category, items]) => (
            <section key={category} className="animate-fadeIn">
              <div className="flex items-center gap-6 mb-8">
                <h3 className="text-[11px] uppercase tracking-[0.6em] font-bold text-amber-600">{category}</h3>
                <div className="flex-grow h-[1px] bg-neutral-100"></div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {items.map(p => (
                  <div key={p.id} className="bg-white border border-neutral-100 p-6 flex items-center gap-10 group hover:border-amber-600/30 transition-all">
                    <img src={p.url} className="w-24 h-24 object-cover rounded-sm grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <div className="flex-grow">
                      <div className="flex gap-4 mb-3">
                         <button onClick={() => toggleLayout(p.id)} className="text-[8px] uppercase font-bold text-neutral-400 bg-neutral-50 px-3 py-1 hover:text-black">Layout: {p.layoutType}</button>
                      </div>
                      <h4 className="font-serif text-xl text-neutral-900">{p.title}</h4>
                      <p className="text-[10px] text-neutral-300 font-mono mt-1 truncate max-w-xs">{p.url}</p>
                    </div>
                    <button onClick={() => { if(confirm('Unlink this photo?')) activeTab === 'gallery' ? onPhotosChange(photos.filter(x => x.id !== p.id)) : onHomeHeroesChange(homeHeroes.filter(x => x.id !== p.id)) }} className="p-4 text-neutral-200 hover:text-red-500">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default Studio;
