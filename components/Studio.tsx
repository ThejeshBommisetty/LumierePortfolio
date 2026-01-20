
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
    if (!ghConfig.token || !ghConfig.repo) return base64;

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
          message: `Upload ${fileName} via Portraits Plaza Studio`,
          content: cleanBase64,
          branch: ghConfig.branch
        })
      });

      if (!res.ok) throw new Error('GitHub upload failed');
      const data = await res.json();
      return data.content.download_url;
    } catch (err) {
      console.error(err);
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
              category: "Archive",
              description: "Captured moment.",
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
    const update = (list: Photo[]) => list.map(p => {
      if (p.id === id) {
        const nextIdx = (layouts.indexOf(p.layoutType) + 1) % layouts.length;
        return { ...p, layoutType: layouts[nextIdx] };
      }
      return p;
    });
    activeTab === 'gallery' ? onPhotosChange(update(photos)) : onHomeHeroesChange(update(homeHeroes));
  };

  const updateCategory = (id: string, newCat: string) => {
    const update = (list: Photo[]) => list.map(p => p.id === id ? { ...p, category: newCat } : p);
    activeTab === 'gallery' ? onPhotosChange(update(photos)) : onHomeHeroesChange(update(homeHeroes));
  };

  const deletePhoto = (id: string) => {
    if (!confirm('Remove this piece?')) return;
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
          <h2 className="font-serif text-3xl mb-12 text-center uppercase tracking-[0.2em] text-white">Studio Login</h2>
          <form onSubmit={handleLogin} className="w-full space-y-8">
            <input type="password" value={passcode} onChange={e => setPasscode(e.target.value)} placeholder="••••" className="w-full bg-white/5 border border-white/10 p-6 text-center tracking-[1em] focus:outline-none focus:border-amber-600 text-white font-bold" autoFocus />
            <button className="w-full bg-amber-600 text-white py-5 text-[10px] uppercase tracking-widest font-bold">Access</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-40 pb-32 animate-fadeIn">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-12 border-b border-neutral-100 pb-16 mb-12">
        <div>
          <h2 className="font-serif text-5xl mb-4 text-neutral-900 tracking-tighter">Studio</h2>
          <p className="text-neutral-400 text-[10px] tracking-[0.6em] uppercase font-bold">
            {isUploading ? `Syncing ${uploadProgress.current}/${uploadProgress.total}...` : 'Archive Management'}
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('settings')} className="bg-neutral-100 text-neutral-600 px-8 py-4 text-[9px] uppercase tracking-widest font-bold border border-neutral-200">GitHub Config</button>
          <button onClick={onExport} className="bg-neutral-100 text-neutral-600 px-8 py-4 text-[9px] uppercase tracking-widest font-bold border border-neutral-200">Export</button>
          {activeTab !== 'settings' && (
            <label className="cursor-pointer bg-black text-white px-8 py-4 text-[10px] uppercase tracking-widest font-bold">
              Upload
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={isUploading} />
            </label>
          )}
        </div>
      </div>

      <div className="flex gap-10 mb-12 border-b border-neutral-100">
        <button onClick={() => setActiveTab('gallery')} className={`pb-4 text-[10px] uppercase tracking-[0.4em] font-bold relative ${activeTab === 'gallery' ? 'text-black' : 'text-neutral-300'}`}>
          Archive {activeTab === 'gallery' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-600"></span>}
        </button>
        <button onClick={() => setActiveTab('heroes')} className={`pb-4 text-[10px] uppercase tracking-[0.4em] font-bold relative ${activeTab === 'heroes' ? 'text-black' : 'text-neutral-300'}`}>
          Showcase {activeTab === 'heroes' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-600"></span>}
        </button>
      </div>

      {activeTab === 'settings' ? (
        <div className="max-w-xl bg-white border border-neutral-100 p-10 space-y-6">
           <h3 className="font-serif text-2xl">GitHub CDN Setup</h3>
           <input type="text" value={ghConfig.repo} onChange={e => setGhConfig({...ghConfig, repo: e.target.value})} placeholder="user/repo" className="w-full bg-neutral-50 border border-neutral-100 p-4 text-sm" />
           <input type="password" value={ghConfig.token} onChange={e => setGhConfig({...ghConfig, token: e.target.value})} placeholder="token" className="w-full bg-neutral-50 border border-neutral-100 p-4 text-sm" />
           <div className="grid grid-cols-2 gap-4">
            <input type="text" value={ghConfig.path} onChange={e => setGhConfig({...ghConfig, path: e.target.value})} placeholder="path" className="bg-neutral-50 border border-neutral-100 p-4 text-sm" />
            <input type="text" value={ghConfig.branch} onChange={e => setGhConfig({...ghConfig, branch: e.target.value})} placeholder="branch" className="bg-neutral-50 border border-neutral-100 p-4 text-sm" />
           </div>
           <button onClick={() => setActiveTab('gallery')} className="w-full bg-black text-white py-4 text-[10px] uppercase tracking-widest">Save Config</button>
        </div>
      ) : (
        <div className="space-y-16">
          {Object.entries(groupedPhotos).map(([category, items]) => (
            <section key={category}>
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-[10px] uppercase tracking-[0.6em] font-bold text-amber-600">{category}</h3>
                <div className="flex-grow h-[1px] bg-neutral-100"></div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {items.map(p => (
                  <div key={p.id} className="bg-white border border-neutral-100 p-4 flex items-center gap-6 group">
                    <img src={p.url} className="w-20 h-20 object-cover rounded-sm" />
                    <div className="flex-grow">
                      <div className="flex gap-2 mb-2">
                        <input type="text" value={p.category} onChange={e => updateCategory(p.id, e.target.value)} className="text-[8px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-sm border-none w-24" />
                        <button onClick={() => toggleLayout(p.id)} className="text-[8px] uppercase font-bold text-neutral-400 bg-neutral-50 px-2 py-1 rounded-sm">Aspect: {p.layoutType}</button>
                      </div>
                      <h4 className="font-serif text-lg">{p.title}</h4>
                    </div>
                    <button onClick={() => deletePhoto(p.id)} className="p-3 text-neutral-200 hover:text-red-500">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
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
