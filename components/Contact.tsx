
import React from 'react';

const Contact: React.FC = () => {
  const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfHwYdExvJHwjaXTBY4z6EzTfYFnCv84PjW6NPPW_nNBUd9XA/viewform";

  return (
    <div className="pt-40 pb-20 px-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
        <div>
          <span className="text-[10px] uppercase tracking-[0.5em] text-amber-600 font-bold mb-6 block">Inquiries</span>
          <h2 className="font-serif text-5xl md:text-6xl mb-8 leading-tight">Let's craft <br/><span className="italic">forever</span>.</h2>
          <p className="text-neutral-500 font-light text-lg leading-relaxed mb-12">
            Whether you're looking for a portrait session, a cinematic wedding story, or a collaborative project, I'd love to hear your vision.
          </p>
          
          <div className="space-y-6">
             <div className="flex flex-col gap-1">
               <span className="text-[9px] uppercase tracking-widest text-neutral-300">Direct Message</span>
               <a href="mailto:potraitsplaza@gmail.com" className="text-lg hover:text-amber-600 transition-colors">potraitsplaza@gmail.com</a>
             </div>
             <div className="flex flex-col gap-1">
               <span className="text-[9px] uppercase tracking-widest text-neutral-300">Social Studio</span>
               <a href="https://www.instagram.com/potraits_plaza/" target="_blank" rel="noreferrer" className="text-lg hover:text-amber-600 transition-colors">@potraits_plaza</a>
             </div>
          </div>
        </div>

        <div className="bg-white p-10 border border-neutral-100 rounded-sm premium-shadow flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <h3 className="font-serif text-2xl mb-4">Official Questionnaire</h3>
          <p className="text-xs text-neutral-400 uppercase tracking-widest leading-relaxed mb-8">
            To provide the best experience, please fill out my detailed inquiry form on Google Docs.
          </p>
          <a 
            href={googleFormUrl} 
            target="_blank" 
            rel="noreferrer"
            className="w-full py-4 bg-black text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-neutral-800 transition-all text-center"
          >
            Open Questionnaire
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
