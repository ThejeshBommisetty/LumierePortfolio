
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Photo } from '../types';

interface ShowcaseProps {
  photos: Photo[];
  homeHeroes: Photo[];
}

const Showcase: React.FC<ShowcaseProps> = ({ photos, homeHeroes }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Overview');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  
  const publishedPhotos = useMemo(() => photos.filter(p => p.isPublished), [photos]);
  const publishedHeroes = useMemo(() => homeHeroes.filter(p => p.isPublished), [homeHeroes]);
  
  const categories = useMemo(() => {
    const cats = new Set(publishedPhotos.map(p => p.category));
    return ['Overview', ...Array.from(cats).sort()];
  }, [publishedPhotos]);

  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'Overview') {
      return publishedHeroes;
    }
    return publishedPhotos.filter(p => p.category === activeCategory);
  }, [publishedPhotos, publishedHeroes, activeCategory]);

  const scrollToGalleryStart = useCallback(() => {
    const element = document.getElementById('category-title-section');
    if (element) {
      const yOffset = -140; // Space for the sticky navigation bar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  const changeCategory = useCallback((cat: string) => {
    setActiveCategory(cat);
    // Use a small timeout to ensure state update doesn't conflict with layout shift
    setTimeout(scrollToGalleryStart, 10);
  }, [scrollToGalleryStart]);

  const handleInteraction = (photo: Photo, index: number) => {
    if (activeCategory === 'Overview') {
      changeCategory(photo.category);
    } else {
      setSelectedPhotoIndex(index);
    }
  };

  const navigateLightbox = useCallback((direction: 'next' | 'prev') => {
    if (selectedPhotoIndex === null) return;
    if (direction === 'next') {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % filteredPhotos.length);
    } else {
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
    }
  }, [selectedPhotoIndex, filteredPhotos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'ArrowRight') navigateLightbox('next');
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
      if (e.key === 'Escape') setSelectedPhotoIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, navigateLightbox]);

  useEffect(() => {
    if (selectedPhotoIndex !== null) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedPhotoIndex]);

  const currentPhoto = selectedPhotoIndex !== null ? filteredPhotos[selectedPhotoIndex] : null;

  return (
    <div className="pt-0">
      {/* Cinematic Splash */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2400&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-25 scale-105"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black"></div>
        </div>
        
        <div className="relative z-10 text-center px-6">
          <div className="overflow-hidden mb-8">
            <span className="block text-amber-500 text-[10px] uppercase tracking-[2.5em] font-bold animate-slideUp ml-[2.5em]">
              Visions of India
            </span>
          </div>
          <h1 className="font-serif text-white text-7xl md:text-[11rem] leading-[0.8] tracking-tighter opacity-90 mb-12">
            Portraits<br/><span className="italic pl-12 md:pl-48 text-amber-500/70">Plaza.</span>
          </h1>
          <div className="flex flex-col items-center">
            <button 
              onClick={() => changeCategory('Overview')}
              className="w-12 h-32 flex items-center justify-center group"
            >
              <div className="w-[1px] h-full bg-gradient-to-b from-amber-600 to-transparent group-hover:from-white transition-all duration-1000"></div>
            </button>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <div className="max-w-7xl mx-auto px-6 py-20" id="gallery-root">
        <header className="mb-32 flex flex-col items-center">
             <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 py-8 border-y border-neutral-100 w-full mb-28 sticky top-20 bg-[#fafafa]/90 backdrop-blur-xl z-40">
               {categories.map((cat) => (
                 <button
                   key={cat}
                   onClick={() => changeCategory(cat)}
                   className={`whitespace-nowrap text-[10px] uppercase tracking-[0.6em] font-bold transition-all relative py-2 ${
                     activeCategory === cat ? 'text-black' : 'text-neutral-300 hover:text-black'
                   }`}
                 >
                   {cat}
                   {activeCategory === cat && (
                     <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-600"></span>
                   )}
                 </button>
               ))}
             </div>
             
             <div id="category-title-section" className="text-center animate-fadeIn max-w-4xl px-4">
                <span className="text-[10px] uppercase tracking-[1.2em] text-amber-600 font-bold block mb-8">
                  {activeCategory === 'Overview' ? 'The Collection' : 'Archive Gallery'}
                </span>
                <h2 className="font-serif text-6xl md:text-9xl mb-12 tracking-tighter leading-none">
                  {activeCategory === 'Overview' ? 'Masterpieces' : activeCategory}
                </h2>
                <div className="w-20 h-[1.5px] bg-neutral-900 mx-auto mb-12"></div>
                <p className="text-[12px] text-neutral-400 uppercase tracking-[0.5em] leading-loose max-w-2xl mx-auto">
                  {activeCategory === 'Overview' 
                    ? `A curated selection of our most definitive works. Choose a signature piece to explore the full collection.` 
                    : `Showcasing the complete series of ${filteredPhotos.length} captures from the ${activeCategory} archive.`}
                </p>
             </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-x-14 gap-y-48">
          {filteredPhotos.map((photo, index) => {
            let colSpan = "lg:col-span-2";
            let aspect = "aspect-[4/5]";

            if (photo.layoutType === 'editorial') {
              colSpan = "lg:col-span-4";
              aspect = "aspect-[16/10]";
            } else if (photo.layoutType === 'wide') {
              colSpan = "lg:col-span-6";
              aspect = "aspect-[21/9] md:aspect-[16/7]";
            }

            return (
              <div key={photo.id} className={`${colSpan} group relative animate-fadeIn`}>
                <div 
                  className={`relative w-full overflow-hidden rounded-sm bg-neutral-50 cursor-pointer shadow-sm transition-all duration-1000 ${aspect}`}
                  onClick={() => handleInteraction(photo, index)}
                >
                  <img src={photo.url} className="w-full h-full object-cover transition-transform duration-[5s] cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-110" loading="lazy" />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none flex flex-col items-center justify-center p-12">
                     <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.95)] opacity-80"></div>
                     
                     <div className="relative z-10 text-center scale-95 group-hover:scale-100 transition-transform duration-700">
                        <span className="text-[9px] uppercase tracking-[1.2em] text-amber-500 font-bold mb-6 block opacity-0 group-hover:opacity-100 transition-opacity delay-150">
                          {activeCategory === 'Overview' ? 'Enter Archive' : 'Focus View'}
                        </span>
                        <h4 className="font-serif text-4xl text-white mb-4">{photo.title}</h4>
                        <div className="w-12 h-[1px] bg-white/20 mx-auto"></div>
                     </div>
                  </div>
                </div>
                
                {/* Visual Label */}
                <div className="mt-12 flex flex-col gap-5 border-l-2 border-neutral-100 pl-10">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[13px] uppercase tracking-[0.4em] font-bold text-neutral-900">
                      {photo.title}
                    </h4>
                    <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">{photo.category}</span>
                  </div>
                  <p className="text-[12px] text-neutral-400 font-light leading-relaxed max-w-sm italic opacity-80">
                    {photo.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Focused Lightbox */}
      {currentPhoto && (
        <div 
          className="fixed inset-0 z-[200] bg-black/99 backdrop-blur-3xl flex flex-col items-center justify-center p-6 md:p-16 animate-fadeIn"
          onClick={(e) => e.target === e.currentTarget && setSelectedPhotoIndex(null)}
        >
          <div className="fixed top-0 left-0 right-0 h-40 flex items-center justify-between px-16 pointer-events-none">
            <span className="text-[10px] text-white/30 uppercase tracking-[1.2em] pointer-events-auto select-none">
              {activeCategory} Archive / 0{selectedPhotoIndex + 1}
            </span>
            <button 
              onClick={() => setSelectedPhotoIndex(null)}
              className="text-white/40 hover:text-white transition-all pointer-events-auto p-6 group"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="group-hover:rotate-90 transition-transform duration-500">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <button 
            onClick={() => navigateLightbox('prev')}
            className="fixed left-6 md:left-20 top-1/2 -translate-y-1/2 text-white/10 hover:text-white transition-all p-12 group hidden md:block"
          >
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="group-hover:-translate-x-3 transition-transform duration-500">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          
          <button 
            onClick={() => navigateLightbox('next')}
            className="fixed right-6 md:right-20 top-1/2 -translate-y-1/2 text-white/10 hover:text-white transition-all p-12 group hidden md:block"
          >
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="group-hover:translate-x-3 transition-transform duration-500">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          
          <div className="relative w-full h-full max-w-7xl max-h-[70vh] flex items-center justify-center pointer-events-none">
             <img 
               src={currentPhoto.url} 
               className="max-w-full max-h-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-fadeIn pointer-events-auto select-none"
               alt={currentPhoto.title}
               key={currentPhoto.id}
             />
          </div>

          <div className="mt-20 text-center text-white max-w-4xl animate-slideUp">
            <div className="flex items-center justify-center gap-8 mb-10">
              <span className="text-[11px] uppercase tracking-[0.8em] text-amber-500 font-bold">{currentPhoto.category}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
              <span className="text-[11px] uppercase tracking-[0.8em] text-white/40">{selectedPhotoIndex + 1} OF {filteredPhotos.length}</span>
            </div>
            <h2 className="font-serif text-6xl mb-8 tracking-tighter leading-none">{currentPhoto.title}</h2>
            <p className="text-[13px] text-white/20 leading-loose uppercase tracking-[0.6em] italic max-w-2xl mx-auto">{currentPhoto.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Showcase;
