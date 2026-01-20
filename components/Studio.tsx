
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

interface GitHubConfig {
  repo: string;
  token: string;
  path: string;
  branch: string;
}

const Studio: React.FC<StudioProps> = ({ photos, onPhotosChange, homeHeroes, onHomeHeroesChange, onExport }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState<'gallery' | 'heroes' | 'settings'>('gallery');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  
  // GitHub Integration State
  const [ghConfig, setGhConfig] = useState<GitHubConfig>(() => {
    const saved = localStorage.getItem('gh_config');
    return saved ? JSON.parse(saved) : { repo: '', token: '', path: 'gallery', branch: 'main' };
  });

  const LOGO_SRC = "/assets/logo/logo.png";
  const OWNER_PASSCODE = '1234';

  useEffect(() => {
    if (sessionStorage.getItem('potraits_auth') === 'true') setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('gh_config', JSON.stringify(ghConfig));
  }, [ghConfig]);

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

  const uploadToGitHub = async (file: File, base64: string): Promise<string> => {
    if (!ghConfig.token || !ghConfig.repo) return base64; // Fallback to local base64

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const cleanBase64 = base64.split(',')[1];
    const url = `https://api.github.com/repos/${ghConfig.repo}/contents/${ghConfig.path}/${fileName}`;

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${ghConfig.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Upload ${fileName} via Studio`,
          content: cleanBase64,
          branch: ghConfig.branch
        })
      });

      if (!res.ok) throw new Error('GitHub upload failed');
      const data = await res.json();
      return data.content.download_url;
    } catch (err) {
      console.error(err);
      alert('GitHub upload failed. Falling back to local storage.');
      return base64;
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
            const finalUrl = await uploadToGitHub(file, base64);
            
            resolve({
              id: Math.random().toString(36).substr(2, 9),
              url: finalUrl, 
              title: analysis.title,
              category: analysis.category,
              description: analysis.description,
              isPublished: true,
              isCategoryHero: activeTab === 'heroes',
              layoutType: 'classic'
            });
          } catch { 
            resolve({
              id: Math.random().toString(36).substr(2, 9),
              url: base64, 
              title: "Untitled Composition",
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
    else if (activeTab === 'heroes') onHomeHeroesChange([...homeHeroes, ...newItems]);
    setIsUploading(false);
  };

  const toggleLayout = (id: string) => {
    const layouts: LayoutType[] = ['classic', 'editorial', 'wide'];
    const list = activeTab === 'gallery' ? photos : homeHeroes;
    const updated = list.map(p => {
      if (p.id === id) {
        const currIdx = layouts.indexOf(p.layoutType);
        const nextIdx = (currIdx + 1) % layouts.length;
        return { ...p, layoutType: layouts[nextIdx] };
      }
      return p;
    });
    activeTab === 'gallery' ? onPhotosChange(updated) : onHomeHeroesChange(updated);
  };

  const updateCategory = (id: string, newCat: string) => {
    const list = activeTab === 'gallery' ? photos : homeHeroes;
    const updated = list.map(p => p.id === id ? { ...p, category: newCat } : p);
    activeTab === 'gallery' ? onPhotosChange(updated) : onHomeHeroesChange(updated);
  };

  const deletePhoto = (id: string) => {
    if (!confirm('Permanently remove this piece from your collection?')) return;
    activeTab === 'gallery' 
      ? onPhotosChange(photos.filter(p => p.id !== id))
      : onHomeHeroesChange(homeHeroes.filter(p => p.id !== id));
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
        <div className="max-w-sm w-full bg-black p-12 border border-white/5 shadow-2xl rounded-sm flex flex-col items-center">
          <div className="w-20 h-20 mb-10 overflow-hidden flex items-center justify-center">
             <img src={LOGO_SRC} className="w-full h-full object-contain brightness-200" alt="Studio Logo" onError={(e) => { (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/685/685655.png"; (e.target as HTMLImageElement).className="w-12 h-12 invert opacity-10"; }} />
          </div>
          <h2 className="font-serif text-3xl mb-12 text-center uppercase tracking-[0.2em] text-white">Studio</h2>
          <form onSubmit={handleLogin} className="w-full space-y-8">
            <input type="password" value={passcode} onChange={e => setPasscode(e.target.value)} placeholder="••••" className="w-full bg-white/5 border border-white/10 p-6 text-center tracking-[1em] focus:outline-none focus:border-amber-600 text-white font-bold" autoFocus />
            <button className="w-full bg-amber-600 text-white py-5 text-[10px] uppercase tracking-widest font-bold hover:bg-amber-700 transition-colors">Access Archive</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-40 pb-32 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-end gap-12 border-b border-neutral-100 pb-16 mb-12">
        <div>
          <h2 className="font-serif text-5xl mb-4 text-neutral-900 tracking-tighter">Studio Management</h2>
          <p className="text-neutral-400 text-[10px] tracking-[0.6em] uppercase font-bold">
            {isUploading ? `AI Syncing with GitHub ${uploadProgress.current}/${uploadProgress.total}...` : 'Configure your photography archive'}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-end">
          <button onClick={() => setActiveTab('settings')} className="bg-neutral-100 text-neutral-600 px-8 py-4 text-[9px] uppercase tracking-widest font-bold border border-neutral-200 hover:bg-neutral-200">GitHub Setup</button>
          <button onClick={onExport} className="bg-neutral-100 text-neutral-600 px-8 py-4 text-[9px] uppercase tracking-widest font-bold border border-neutral-200 hover:bg-neutral-200">Export Backup</button>
          {activeTab !== 'settings' && (
            <label className="cursor-pointer bg-black text-white px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-center hover:bg-neutral-800 transition-all">
              {isUploading ? 'Syncing...' : `Upload to ${activeTab === 'gallery' ? 'Archive' : 'Showcase'}`}
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={isUploading} />
            </label>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-10 mb-12 border-b border-neutral-100">
        <button onClick={() => setActiveTab('gallery')} className={`pb-4 text-[10px] uppercase tracking-[0.4em] font-bold relative transition-colors ${activeTab === 'gallery' ? 'text-black' : 'text-neutral-300 hover:text-neutral-500'}`}>
          Full Archive
          {activeTab === 'gallery' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-600"></span>}
        </button>
        <button onClick={() => setActiveTab('heroes')} className={`pb-4 text-[10px] uppercase tracking-[0.4em] font-bold relative transition-colors ${activeTab === 'heroes' ? 'text-black' : 'text-neutral-300 hover:text-neutral-500'}`}>
          Showcase Heroes
          {activeTab === 'heroes' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-600"></span>}
        </button>
      </div>

      {activeTab === 'settings' ? (
        <div className="max-w-2xl bg-white border border-neutral-100 p-12 space-y-8 animate-fadeIn">
           <h3 className="font-serif text-3xl">GitHub CDN Configuration</h3>
           <p className="text-xs text-neutral-400 uppercase tracking-widest leading-loose">Connect your GitHub repository to host images permanently. Otherwise, images will be stored as temporary base64 strings.</p>
           
           <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-widest font-bold">Repository (user/repo)</label>
                <input type="text" value={ghConfig.repo} onChange={e => setGhConfig({...ghConfig, repo: e.target.value})} placeholder="thejesh/my-portfolio-images" className="bg-neutral-50 border border-neutral-100 p-4 text-sm focus:outline-none focus:border-amber-600" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-widest font-bold">Personal Access Token</label>
                <input type="password" value={ghConfig.token} onChange={e => setGhConfig({...ghConfig, token: e.target.value})} placeholder="ghp_xxxxxxxxxxxx" className="bg-neutral-50 border border-neutral-100 p-4 text-sm focus:outline-none focus:border-amber-600" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] uppercase tracking-widest font-bold">Storage Path</label>
                  <input type="text" value={ghConfig.path} onChange={e => setGhConfig({...ghConfig, path: e.target.value})} placeholder="gallery" className="bg-neutral-50 border border-neutral-100 p-4 text-sm focus:outline-none focus:border-amber-600" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] uppercase tracking-widest font-bold">Branch</label>
                  <input type="text" value={ghConfig.branch} onChange={e => setGhConfig({...ghConfig, branch: e.target.value})} placeholder="main" className="bg-neutral-50 border border-neutral-100 p-4 text-sm focus:outline-none focus:border-amber-600" />
                </div>
              </div>
           </div>
           <button onClick={() => setActiveTab('gallery')} className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold">Save & Return</button>
        </div>
      ) : (
        <div className="space-y-20">
          {Object.entries(groupedPhotos).map(([category, items]) => (
            <section key={category}>
              <div className="flex items-center gap-6 mb-8">
                <h3 className="text-[11px] uppercase tracking-[0.8em] font-bold text-amber-600">{category}</h3>
                <div className="flex-grow h-[1px] bg-neutral-100"></div>
                <span className="text-[10px] text-neutral-300 font-bold uppercase tracking-widest">{items.length} PIECES</span>
              </div>

              <div className="space-y-4">
                {items.map((p) => (
                  <div key={p.id} className="bg-white border border-neutral-100 p-6 flex flex-wrap items-center gap-8 group hover:border-amber-600/30 transition-all duration-500">
                    <div className="w-24 h-24 overflow-hidden rounded-sm bg-neutral-50 flex-shrink-0">
                      <img src={p.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={p.title} />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                         <input 
                           type="text" 
                           value={p.category} 
                           onChange={(e) => updateCategory(p.id, e.target.value)}
                           className="text-[8px] uppercase font-bold text-amber-600 tracking-widest px-2 py-0.5 bg-amber-50 rounded-sm border-none focus:ring-1 focus:ring-amber-500 w-24"
                         />
                         <button 
                            onClick={() => toggleLayout(p.id)}
                            className="text-[8px] uppercase font-bold text-neutral-400 tracking-widest px-2 py-0.5 bg-neutral-50 rounded-sm hover:bg-neutral-100 transition-colors"
                          >
                            Aspect: {p.layoutType}
                          </button>
                      </div>
                      <h4 className="font-serif text-2xl text-neutral-900 mb-1">{p.title}</h4>
                      <p className="text-[11px] text-neutral-400 font-light italic truncate max-w-md">{p.description}</p>
                    </div>

                    <div className="flex items-center gap-4 border-l border-neutral-100 pl-8">
                      <button 
                        onClick={() => deletePhoto(p.id)}
                        className="p-4 text-neutral-200 hover:text-red-500 hover:bg-red-50 transition-all rounded-sm"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
          {Object.keys(groupedPhotos).length === 0 && (
            <div className="py-32 text-center border-2 border-dashed border-neutral-100 rounded-sm bg-neutral-50/50">
              <p className="text-neutral-300 text-[10px] uppercase tracking-[0.5em] font-bold">Archive Empty</p>
              <p className="text-neutral-400 text-[9px] mt-4 uppercase tracking-widest">Connect GitHub or upload directly to start your collection</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Studio;
