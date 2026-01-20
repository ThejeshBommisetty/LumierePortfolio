
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
        <div className="relative">
          <div className="aspect-[4/5] bg-neutral-100 overflow-hidden rounded-sm">
            <img 
              src="https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=1000&auto=format&fit=crop" 
              alt="Thejesh Bommisetty" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
            />
          </div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-50 hidden lg:flex flex-col items-center justify-center p-8 rounded-full border border-amber-100 shadow-xl">
            <span className="text-amber-800 font-serif text-2xl">IN</span>
            <p className="text-[8px] uppercase tracking-widest text-center leading-relaxed text-amber-900/60 font-bold mt-2">
              Bengaluru Based<br/>—<br/>Global Vision
            </p>
          </div>
        </div>
        
        <div className="space-y-12">
          <header>
            <span className="text-[10px] uppercase tracking-[0.5em] text-amber-600 font-bold mb-4 block">The Curator</span>
            <h2 className="font-serif text-5xl md:text-8xl leading-tight text-neutral-900">Thejesh <br/><span className="italic">Bommisetty</span>.</h2>
          </header>
          
          <div className="space-y-8 text-neutral-600 leading-relaxed text-lg font-light">
            <p>
              I am the founder of <span className="text-black font-serif font-bold italic">Potraits Plaza</span>. My camera is more than just a tool; it's a third eye that helps me capture the unseen beauty of ordinary moments.
            </p>
            <p>
              Whether it's the high-energy pulse of Bengaluru's streets or the silent grace of rural India, I seek out the hidden narratives that define our shared human experience.
            </p>
            <p className="text-neutral-400 italic text-base bg-neutral-50 p-6 border-l-2 border-amber-600">
              When the camera is down, you might find me practicing card magic or exploring a new language. Every photograph here is a piece of my heart.
            </p>
          </div>

          <div className="pt-12 grid grid-cols-2 gap-12 border-t border-neutral-100">
            <div>
              <h4 className="text-[9px] uppercase tracking-[0.3em] text-neutral-900 font-bold mb-4">Focus Areas</h4>
              <ul className="text-[11px] text-neutral-400 space-y-3 tracking-[0.2em] uppercase">
                <li>Soulful Potraits</li>
                <li>Vibrant Pre-wed</li>
                <li>Childhood Innocence</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[9px] uppercase tracking-[0.3em] text-neutral-900 font-bold mb-4">Philosophy</h4>
              <p className="text-[11px] text-amber-800 leading-relaxed uppercase tracking-widest italic font-bold">"Preserving the soul of the moment through light."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
