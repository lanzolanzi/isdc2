import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import { generateCoralPoints, Point } from './lib/coral';

// Cervo coordinates
const CERVO_CENTER: [number, number] = [43.9261, 8.1136];
// Root of coral in the sea closer to Cervo coast, pushed further out to ensure it's on water
const CORAL_ROOT: [number, number] = [43.9220, 8.1180];

export default function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [visiblePoints, setVisiblePoints] = useState<Point[]>([]);
  const animationRef = useRef<number | null>(null);

  // Memoize all points so we don't regenerate them
  const allPoints = useMemo(() => generateCoralPoints(CORAL_ROOT[0], CORAL_ROOT[1]), []);
  const totalPoints = allPoints.length;

  useEffect(() => {
    if (isScanning && scanProgress < 100) {
      const startTime = performance.now();
      const duration = 12000; // 12 seconds to fully form

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        let nextProgress = (elapsed / duration) * 100;
        
        if (nextProgress >= 100) {
           nextProgress = 100;
           setIsScanning(false);
        }

        const pointsToShow = Math.floor((nextProgress / 100) * totalPoints);
        setVisiblePoints(allPoints.slice(0, pointsToShow));
        setScanProgress(nextProgress);

        if (nextProgress < 100) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isScanning, allPoints, totalPoints]);

  const handleStartScan = () => {
    if (isScanning || scanProgress === 100) return;
    setIsScanning(true);
    setScanProgress(0);
    setVisiblePoints([]);
  };

  const handleClearData = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsScanning(false);
    setScanProgress(0);
    setVisiblePoints([]);
  };

  return (
    <div className="w-full h-screen bg-[#050505] text-[#d1d1d1] font-mono flex flex-col p-4 gap-4 overflow-hidden">
      
      {/* Header Section */}
      <div className="flex justify-between items-center bg-[#0a0a0a] border border-[#222] p-4 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] shrink-0 z-10 relative">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#ff3b3b] tracking-[0.2em] font-bold">PROGETTO: CORALLIUM // ARCHIVIO CERVO (IM)</span>
          <h1 className="text-2xl font-black text-white tracking-tighter">DATA_NODE_SEC-12</h1>
        </div>
        <div className="flex gap-6 items-center">
          <div className="text-right hidden sm:block">
            <span className="block text-[9px] opacity-40 uppercase">Status Collegamento</span>
            <span className="text-[#00ff41] text-xs">● SISTEMA OPERATIVO</span>
          </div>
          <div className="h-8 w-[1px] bg-[#222] hidden sm:block"></div>
          <div className="text-right">
            <span className="block text-[9px] opacity-40 uppercase">Coordinate</span>
            <span className="text-white text-xs">43.9261° N / 8.1144° E</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 md:grid-rows-6 gap-4 min-h-0 relative z-0">
        
        {/* Left Control Column */}
        <div className="flex flex-col col-span-1 md:col-span-3 md:row-span-6 gap-4 relative z-10 pointer-events-auto">
          
          {/* Status/Activation UI */}
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-6 flex flex-col shrink-0 justify-center flex-1 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[12px] font-bold uppercase text-[#fff] tracking-wide">Pannello di Controllo</span>
              <div className={`w-4 h-4 rounded-full transition-colors ${isScanning ? 'bg-yellow-500 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.8)]' : (scanProgress === 100 ? 'bg-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.6)]' : 'bg-[#ff3b3b] opacity-30')}`}></div>
            </div>
            
            <div className="flex flex-col gap-4">
              <button 
                 onClick={handleStartScan}
                 disabled={isScanning || scanProgress === 100}
                 className={`flex-1 py-8 text-center font-black text-[16px] uppercase tracking-widest rounded border transition-all active:scale-95 ${
                 isScanning 
                   ? 'text-[#ff3b3b] border-[#ff3b3b] bg-[#ff3b3b]/10 cursor-not-allowed shadow-[inset_0_0_20px_rgba(255,59,59,0.2)]' 
                   : (scanProgress === 100 
                      ? 'text-[#00ff41] border-[#00ff41] bg-[#00ff41]/5 cursor-not-allowed' 
                      : 'text-[#ff3b3b] border-[#ff3b3b] hover:bg-[#ff3b3b] hover:text-black shadow-[0_0_15px_rgba(255,59,59,0.4)] hover:shadow-[0_0_30px_rgba(255,59,59,0.8)]')
              }`}>
                {isScanning ? 'ACCRESCIMENTO IN CORSO...' : (scanProgress === 100 ? 'CICLO COMPLETATO' : 'AVVIA SEQUENZA')}
              </button>
              
              <button 
                 onClick={handleClearData}
                 className="w-full py-4 bg-transparent border-2 border-dashed border-[#ff3b3b]/60 text-[#ff3b3b]/80 font-black text-[14px] uppercase tracking-tighter hover:bg-[#ff3b3b] hover:text-black hover:border-solid active:bg-white transition-all active:scale-95 rounded cursor-pointer"
              >
                ELIMINA DATI
              </button>
            </div>
            
            {/* Decorative Dummy Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-2 opacity-50 pointer-events-none select-none">
              <div className="px-2 py-3 bg-[#111] border border-[#333] text-[9px] text-[#666] uppercase text-center font-bold tracking-wider">
                CALIBRAZIONE OHR
              </div>
              <div className="px-2 py-3 bg-[#111] border border-[#333] text-[9px] text-[#666] uppercase text-center font-bold tracking-wider">
                FILTRO STRUTTURA
              </div>
              <div className="px-2 py-3 bg-[#111] border border-[#333] text-[9px] text-[#666] uppercase text-center font-bold tracking-wider">
                SINCRO NODI
              </div>
              <div className="px-2 py-3 bg-[#111] border border-[#333] text-[9px] text-[#666] uppercase text-center font-bold tracking-wider">
                BYPASS SICUREZZA
              </div>
              <div className="px-2 py-3 bg-[#111] border border-[#333] text-[9px] text-[#666] uppercase text-center font-bold tracking-wider">
                DIAGNOSTICA
              </div>
              <div className="px-2 py-3 bg-[#111] border border-[#333] text-[9px] text-[#666] uppercase text-center font-bold tracking-wider">
                OVERRIDE MANUALE
              </div>
            </div>

            <div className="mt-6">
              <div className={`h-[80px] w-full ${isScanning ? 'opacity-40 border-[#ff3b3b]/50' : 'opacity-20 border-[#222]'} bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] border relative overflow-hidden transition-all duration-500 rounded`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${isScanning ? 'animate-pulse text-[#ff3b3b]' : 'text-white'}`}>
                    {isScanning ? 'Analisi substrato...' : 'In attesa'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Central Map Area */}
        <div className="col-span-1 md:col-span-9 md:row-span-6 bg-[#000] border border-[#222] rounded-lg relative overflow-hidden h-[40vh] md:h-auto z-0 flex flex-col">
          {/* Custom Map Grid Overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none z-[400]" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          {/* Coastal Outline Label Overlay */}
          <div className="absolute top-6 left-6 text-[10px] border border-white/20 px-2 py-1 bg-black z-[400] pointer-events-none shadow-lg rounded">
            SETTORE: BORGO ANTICO CERVO
          </div>

          <div className="absolute bottom-4 right-4 text-right z-[400] pointer-events-none drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
            <span className="block text-[10px] opacity-60 uppercase mb-1 drop-shadow-md">RILEVAMENTO FORMAZIONI</span>
            <span className={`text-sm font-bold truncate drop-shadow-md transition-colors ${scanProgress === 100 ? 'text-[#ff3b3b]' : 'text-white/60'}`}>
              {scanProgress === 100 ? 'CORALLIUM RUBRUM_DETECTION' : 'RICERCA_IN_CORSO'}
            </span>
          </div>
          
          <MapContainer 
            center={CERVO_CENTER} 
            zoom={15} 
            zoomControl={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            className="w-full h-full z-0 relative focus:outline-none"
            attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            
            {visiblePoints.map((pt, i) => (
               <Circle 
                 key={`pt-${i}`}
                 center={[pt.lat, pt.lng]}
                 radius={pt.radius}
                 pathOptions={{ 
                     color: '#ff5555', 
                     fillColor: '#ff1111', 
                     fillOpacity: 0.9,
                     stroke: false,
                     className: 'coral-dot'
                 }}
               />
           ))}
          </MapContainer>
        </div>

      </div>
    </div>
  );
}
