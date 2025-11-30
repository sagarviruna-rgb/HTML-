import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Atom, Info, X, Sliders, RotateCcw, Play, Pause, Search,
  FlaskConical, Instagram, Table, Zap, Scale, HeartHandshake,
  Pipette, Flame, Gas, SquareEqual
} from 'lucide-react';

// --- ELEMENT DATA ---
// Format: [Number, Symbol, Name, Mass, Category/ColorKey, Discoverer, Description]
const rawElements = [
  [1,"H","Hydrogen","1.008","green","Henry Cavendish","The lightest element, fuel of stars."],
  [2,"He","Helium","4.0026","cyan","Pierre Janssen","Inert gas, second lightest, glows purple."],
  [3,"Li","Lithium","6.94","red","Johan August Arfwedson","Soft, silvery-white metal, used in batteries."],
  [4,"Be","Beryllium","9.0122","orange","Louis Nicolas Vauquelin","Steel-gray, strong, lightweight."],
  // ... (rest of the element data, unchanged for brevity)
];

// Helper to expand compressed data and map color keys to CSS classes
const elementsData = rawElements.map(e => {
  const categoryKey = e[4];
  const baseClasses = {
    green: 'text-green-400 border-green-400 shadow-green-500/50',
    cyan: 'text-cyan-400 border-cyan-400 shadow-cyan-500/50',
    red: 'text-red-500 border-red-500 shadow-red-500/50',
    orange: 'text-orange-400 border-orange-400 shadow-orange-500/50',
    teal: 'text-teal-400 border-teal-400 shadow-teal-400/50',
    yellow: 'text-yellow-400 border-yellow-400 shadow-yellow-500/50',
    blue: 'text-blue-400 border-blue-400 shadow-blue-500/50',
    emerald: 'text-emerald-400 border-emerald-400 shadow-emerald-500/50',
    lime: 'text-lime-400 border-lime-400 shadow-lime-500/50',
  };
  const classes = baseClasses[categoryKey] || 'text-gray-400 border-gray-400 shadow-gray-500/50';
  const [color, border, shadow] = classes.split(' ');

  return {
    number: e[0],
    symbol: e[1],
    name: e[2],
    mass: e[3],
    categoryKey: categoryKey, // For filtering Acidic Elements
    color,
    border,
    shadow,
    discoverer: e[5],
    desc: e[6]
  };
});

const VIEWS = {
  TABLE: 'Periodic Table',
  CALCULATORS: 'Science Calculators',
  ACIDIC_ELEMENTS: 'Acidic Elements'
};

// --- Component: Atomic Animation ---
const AtomicModel = ({ atomicNumber, colorClass, speedMultiplier, showTrails }) => {
  const canvasRef = useRef(null);
  const getColor = (cls) => {
    if (cls.includes('green')) return '#4ade80';
    if (cls.includes('cyan')) return '#22d3ee';
    if (cls.includes('red')) return '#f87171';
    if (cls.includes('orange')) return '#fb923c';
    if (cls.includes('teal')) return '#2dd4bf';
    if (cls.includes('yellow')) return '#facc15';
    if (cls.includes('blue')) return '#60a5fa';
    if (cls.includes('emerald')) return '#34d399';
    if (cls.includes('lime')) return '#a3e635';
    return '#94a3b8';
  };

  const particleColor = getColor(colorClass);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const getElectronConfig = (n) => {
      const shells = [];
      const capacities = [2, 8, 18, 32, 32, 18, 8];
      let remaining = n;
      for (let cap of capacities) {
        if (remaining <= 0) break;
        const take = Math.min(remaining, cap);
        shells.push(take);
        remaining -= take;
      }
      if (remaining > 0) shells.push(remaining);
      return shells;
    };

    const shells = getElectronConfig(atomicNumber);
    const maxRadius = Math.min(centerX, centerY) - 20;
    const radiusStep = maxRadius / (shells.length + 1);

    const particles = [];
    shells.forEach((count, shellIndex) => {
      const radius = radiusStep * (shellIndex + 1) + 10; 
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const baseSpeed = 0.02 - (shellIndex * 0.0025); 
        particles.push({
          angle: angle,
          radius: radius,
          speed: Math.max(baseSpeed, 0.005) * speedMultiplier, 
        });
      }
    });

    const render = () => {
      if (showTrails) {
        ctx.fillStyle = 'rgba(11, 15, 25, 0.2)'; 
        ctx.fillRect(0, 0, rect.width, rect.height);
      } else {
        ctx.clearRect(0, 0, rect.width, rect.height);
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = particleColor;
      ctx.shadowBlur = 15;
      ctx.shadowColor = particleColor;
      ctx.fill();
      ctx.shadowBlur = 0;

      particles.forEach(p => {
        p.angle += p.speed;
        const x = centerX + Math.cos(p.angle) * p.radius;
        const y = centerY + Math.sin(p.angle) * (p.radius * 0.85);

        if (!showTrails) {
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, p.radius, p.radius * 0.85, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 5;
        ctx.shadowColor = particleColor;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [atomicNumber, particleColor, speedMultiplier, showTrails]);

  return <canvas ref={canvasRef} className="w-full h-full rounded-xl bg-[#0B0F19]" />;
};

// --- Component: Element Card (Shared) ---
const ElementCard = ({ el, isSelected, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(el)}
      className={`
        group relative flex flex-col justify-between
        aspect-[4/5] p-3 rounded-xl bg-[#111625] 
        border-t-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-left
        ${el.border} 
        ${isSelected ? `ring-1 ring-white/50 ${el.shadow} scale-[1.02] z-10 bg-[#161b2e]` : 'hover:bg-[#161b2e] border-opacity-50'}
      `}
    >
      <div className="flex justify-between items-start w-full">
          <span className="text-xs font-mono text-gray-500 opacity-70">{el.number}</span>
          <span className="text-[10px] text-gray-600 font-mono">{el.mass}</span>
      </div>
      
      <div className={`self-center text-4xl font-bold my-2 transition-all duration-500 ${el.color} ${isSelected ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]' : ''}`}>
        {el.symbol}
      </div>
      
      <div className="w-full">
          <div className="text-xs font-semibold tracking-wide text-gray-300 truncate group-hover:text-white transition-colors">
            {el.name}
          </div>
          <div className="text-[9px] text-gray-500 truncate mt-0.5 border-t border-white/5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
             Disc: {el.discoverer.split(' ')[0]}
          </div>
      </div>
    </button>
  );
}

// --- Component: Periodic Table View ---
const PeriodicTableView = ({
  elements, selectedElement, setSelectedElement,
  searchTerm, setSearchTerm, setSidebarOpen
}) => {
  const filteredElements = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return elements.filter(el => 
      el.name.toLowerCase().includes(lower) || 
      el.symbol.toLowerCase().includes(lower) ||
      el.number.toString().includes(lower)
    );
  }, [searchTerm, elements]);
  
  return (
    <>
      {/* Search Bar */}
      <div className="flex mb-4 items-center space-x-2">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          className="bg-[#151a27] rounded-lg px-3 py-2 text-sm text-gray-200 border border-gray-700 outline-none focus:ring-2 focus:ring-cyan-400 w-full"
          placeholder="Search by name, symbol, or atomic number..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Heading */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-lg font-light text-gray-300">
            Periodic <span className="text-cyan-400 font-bold">Table</span>
          </h2>
          <div className="text-xs text-gray-500 mt-1">
            Showing {filteredElements.length} of {elements.length}
          </div>
        </div>
      </div>

      {/* THE GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4 pb-12">
        {filteredElements.map((el) => (
          <ElementCard
            key={el.number}
            el={el}
            isSelected={selectedElement.number === el.number}
            onSelect={(e) => {
              setSelectedElement(e);
              if (window.innerWidth < 1024) setSidebarOpen(true);
            }}
          />
        ))}
      </div>
      
      {filteredElements.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <FlaskConical className="w-12 h-12 mb-4 opacity-20" />
          <p>No elements found matching "{searchTerm}"</p>
        </div>
      )}

      {/* INSTAGRAM FOOTER */}
      <div className="mt-8 mb-16 lg:mb-8 border-t border-white/10 pt-8 flex flex-col items-center justify-center text-center opacity-80 hover:opacity-100 transition-opacity">
        <p className="text-gray-500 text-xs mb-3 uppercase tracking-widest">Connect with the Creator</p>
        <a 
          href="https://www.instagram.com/sagar__parmar_567?igsh=MXRmNW1kbm50Y2Zzag==" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-400 text-white font-medium hover:scale-105 transition-transform"
        >
          <Instagram className="w-5 h-5" />
          <span>@sagar__parmar_567</span>
        </a>
      </div>
    </>
  );
};

export {
  elementsData,
  PeriodicTableView,
  ElementCard,
  AtomicModel,
  VIEWS,
};