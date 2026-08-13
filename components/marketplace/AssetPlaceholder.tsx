import React from "react";

interface AssetPlaceholderProps {
  category: string;
  name?: string;
  assetId?: number | string;
  className?: string;
}

export function AssetPlaceholder({
  category,
  name = "Lumen Asset",
  assetId = 1,
  className = "",
}: AssetPlaceholderProps) {
  const cat = (category || "").toLowerCase();

  const idNum = Number(assetId) || 1;
  const hashVal = (idNum * 2654435761) % 100;

  if (cat.includes("collectible")) {
    return (
      <div className={`relative w-full h-full bg-[#101418] flex items-center justify-center overflow-hidden ${className}`}>
        <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0B0D10" stopOpacity="0.9" />
            </linearGradient>
            <radialGradient id="tealGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0B0D10" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="200" r="160" fill="url(#tealGlow)" />
          {/* Diamond Crystal Facet */}
          <polygon points="200,60 310,150 200,340 90,150" fill="url(#tealGrad)" stroke="#2DD4BF" strokeWidth="1.5" />
          <polygon points="200,60 200,340 90,150" fill="#2DD4BF" fillOpacity="0.15" />
          <line x1="90" y1="150" x2="310" y2="150" stroke="#2DD4BF" strokeWidth="1.5" />
          <line x1="200" y1="60" x2="200" y2="340" stroke="#2DD4BF" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="200" cy="150" r="4" fill="#2DD4BF" />
        </svg>
        <span className="absolute bottom-3 left-3 text-[10px] uppercase font-mono tracking-widest text-teal/70">
          COLLECTIBLE #{assetId}
        </span>
      </div>
    );
  }

  if (cat.includes("domain")) {
    return (
      <div className={`relative w-full h-full bg-[#0E1015] flex items-center justify-center overflow-hidden ${className}`}>
        <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="domainGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#D4A650" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {/* Network Hexagon Lattice */}
          <circle cx="200" cy="200" r="120" stroke="#22262B" strokeWidth="1" fill="none" />
          <circle cx="200" cy="200" r="70" stroke="#D4A650" strokeWidth="1" strokeDasharray="6 6" fill="none" opacity="0.4" />
          <polygon points="200,90 295,145 295,255 200,310 105,255 105,145" stroke="#6366F1" strokeWidth="1.5" fill="none" />
          <circle cx="200" cy="90" r="5" fill="#D4A650" />
          <circle cx="295" cy="145" r="5" fill="#6366F1" />
          <circle cx="295" cy="255" r="5" fill="#D4A650" />
          <circle cx="200" cy="310" r="5" fill="#6366F1" />
          <circle cx="105" cy="255" r="5" fill="#D4A650" />
          <circle cx="105" cy="145" r="5" fill="#6366F1" />
          <line x1="200" y1="90" x2="200" y2="310" stroke="#22262B" strokeWidth="1" />
          <line x1="105" y1="145" x2="295" y2="255" stroke="#22262B" strokeWidth="1" />
          <line x1="105" y1="255" x2="295" y2="145" stroke="#22262B" strokeWidth="1" />
        </svg>
        <span className="absolute bottom-3 left-3 text-[10px] uppercase font-mono tracking-widest text-indigo-400/70">
          WEB3 DOMAIN #{assetId}
        </span>
      </div>
    );
  }

  if (cat.includes("music")) {
    return (
      <div className={`relative w-full h-full bg-[#120F16] flex items-center justify-center overflow-hidden ${className}`}>
        <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="musicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E879F9" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#D4A650" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path
            d="M 60 200 Q 130 100 200 200 T 340 200"
            fill="none"
            stroke="url(#musicGrad)"
            strokeWidth="3"
          />
          <path
            d="M 60 200 Q 130 280 200 200 T 340 200"
            fill="none"
            stroke="#D4A650"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <circle cx="130" cy="150" r="6" fill="#E879F9" />
          <circle cx="270" cy="150" r="6" fill="#D4A650" />
          <circle cx="200" cy="200" r="8" fill="#F2F3F4" />
        </svg>
        <span className="absolute bottom-3 left-3 text-[10px] uppercase font-mono tracking-widest text-fuchsia-400/70">
          AUDIO NFT #{assetId}
        </span>
      </div>
    );
  }

  if (cat.includes("photography")) {
    return (
      <div className={`relative w-full h-full bg-[#111210] flex items-center justify-center overflow-hidden ${className}`}>
        <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="200" r="110" stroke="#22262B" strokeWidth="2" fill="none" />
          <circle cx="200" cy="200" r="80" stroke="#D4A650" strokeWidth="1.5" fill="none" opacity="0.7" />
          <circle cx="200" cy="200" r="40" stroke="#2DD4BF" strokeWidth="2" fill="#15181C" />
          <polygon points="170,120 230,120 250,160 150,160" fill="#D4A650" fillOpacity="0.2" stroke="#D4A650" strokeWidth="1" />
          <circle cx="200" cy="200" r="8" fill="#D4A650" />
        </svg>
        <span className="absolute bottom-3 left-3 text-[10px] uppercase font-mono tracking-widest text-amber-300/70">
          PHOTOGRAPHY #{assetId}
        </span>
      </div>
    );
  }

  if (cat.includes("virtual") || cat.includes("world")) {
    return (
      <div className={`relative w-full h-full bg-[#0D1212] flex items-center justify-center overflow-hidden ${className}`}>
        <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gridGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0B0D10" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {/* Isometric Cyber Grid */}
          <polygon points="200,80 340,160 200,240 60,160" fill="url(#gridGrad)" stroke="#2DD4BF" strokeWidth="1.5" />
          <polygon points="200,240 340,160 340,240 200,320" fill="#15181C" stroke="#22262B" strokeWidth="1" />
          <polygon points="200,240 60,160 60,240 200,320" fill="#101316" stroke="#22262B" strokeWidth="1" />
          <circle cx="200" cy="160" r="5" fill="#2DD4BF" />
        </svg>
        <span className="absolute bottom-3 left-3 text-[10px] uppercase font-mono tracking-widest text-emerald-400/70">
          VIRTUAL REALM #{assetId}
        </span>
      </div>
    );
  }

  // Default: Art / Genesis Digital Asset
  return (
    <div className={`relative w-full h-full bg-[#121316] flex items-center justify-center overflow-hidden ${className}`}>
      <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="amberGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D4A650" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0B0D10" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="amberGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D061" />
            <stop offset="100%" stopColor="#D4A650" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="200" r="140" fill="url(#amberGlow)" />
        <circle cx="200" cy="200" r="110" stroke="#22262B" strokeWidth="1.5" fill="none" />
        <circle cx="200" cy="200" r="80" stroke="#D4A650" strokeWidth="2" strokeDasharray="8 6" fill="none" opacity="0.6" />
        <polygon
          points="200,100 270,160 270,240 200,300 130,240 130,160"
          stroke="url(#amberGold)"
          strokeWidth="2"
          fill="#15181C"
          fillOpacity="0.8"
        />
        <circle cx="200" cy="200" r="12" fill="url(#amberGold)" />
      </svg>
      <span className="absolute bottom-3 left-3 text-[10px] uppercase font-mono tracking-widest text-accent/70">
        DIGITAL ASSET #{assetId}
      </span>
    </div>
  );
}
