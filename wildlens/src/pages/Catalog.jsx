import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Globe from 'react-globe.gl';
import gsap from 'gsap';
import { fetchAnimals } from '../store/animalsSlice';
import Loader from '../components/ui/Loader';
import { Leaf } from 'lucide-react';

const Catalog = () => {
    const globeEl = useRef(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { animals, status, error } = useSelector((state) => state.animals);

    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchAnimals());
        }
    }, [dispatch, status]);

    // Redimensionnement dynamique du canvas WebGL
    useEffect(() => {
        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Détermination des coordonnées
    const globeData = useMemo(() => {
        return animals.map((animal, index) => {
            // 1. Fallback if latitude/longitude is missing from MockAPI
            // It splits them deterministically across the globe based on their index
            const lat = animal.latitude !== undefined ? animal.latitude : (Math.sin(index * 123) * 60);
            const lng = animal.longitude !== undefined ? animal.longitude : (Math.cos(index * 321) * 180);

            return {
                ...animal,
                lat,
                lng,
            };
        });
    }, [animals]);

    // 4. ANIMATION GSAP + GLOBE AU CLIC
    const handleMarkerClick = (animal) => {
        if (!globeEl.current || !containerRef.current) return;

        // A. Zoom de la caméra spectaculaire vers les coordonnées de l'animal
        globeEl.current.pointOfView({
            lat: animal.lat,
            lng: animal.lng,
            altitude: 0.2 // Zoom très rapproché
        }, 1000);

        // B. Fade out avec GSAP sur l'écran entier
        gsap.to(containerRef.current, {
            opacity: 0,
            backgroundColor: '#000000', // Fondu au noir
            duration: 1.2,
            ease: "power2.inOut",
            onComplete: () => {
                // C. Redirection à la fin de l'animation
                navigate(`/animal/${animal.id}`);
            }
        });
    };

    if (status === 'loading') {
        return (
            <div className="w-screen h-screen bg-[#050510] flex flex-col items-center justify-center fixed inset-0 z-[100]">
                <Loader className="mb-4" />
                <p className="text-secondary font-medium mt-4">Initialisation du globe spatial...</p>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="w-screen h-screen bg-[#050510] flex flex-col items-center justify-center fixed inset-0 z-[100] p-6">
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20 text-center max-w-md">
                    <h2 className="text-accent font-bold text-xl mb-4">Perte de signal</h2>
                    <p className="text-white/80">{error || "Impossible de charger les données du globe."}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 px-6 py-2 bg-secondary text-white rounded-md hover:bg-yellow-600 transition-colors"
                    >
                        Mission avortée (Accueil)
                    </button>
                </div>
            </div>
        );
    }

    return (
        // 2. Le GLobe prend tout l'écran avec fond sombre
        <div
            ref={containerRef}
            className="catalog-globe-container w-screen h-screen bg-[#050510] overflow-hidden fixed top-0 left-0 z-[100]"
        >
            {/* UI Superposée */}
            <div className="absolute top-6 left-6 z-[110] flex items-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                    <span>←</span> Retour Base
                </button>
            </div>

            <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none z-[110] text-center flex flex-col items-center">
                <div className="flex items-center gap-2 text-primary drop-shadow-[0_0_15px_rgba(34,139,34,0.5)]">
                    <Leaf className="w-6 h-6" />
                    <h1 className="text-3xl font-bold font-sans tracking-wide text-white">WildLens Earth</h1>
                </div>
                <p className="text-white/70 text-sm mt-1 font-light bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5">
                    Faites glisser pour explorer. Cliquez sur un signal pour zoomer.
                </p>
            </div>

            {/* 2. LE GLOBE */}
            <Globe
                ref={globeEl}
                width={dimensions.width}
                height={dimensions.height}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                backgroundColor="#050510" // Dark Theme
                autoRotate={true}         // Auto-rotation
                autoRotateSpeed={0.5}     // Lente

                // 3. LES MARQUEURS HTML
                htmlElementsData={globeData}
                htmlElement={d => {
                    const el = document.createElement('div');

                    // Injection DOM avec stylisation Tailwind CSS / Hover state
                    el.innerHTML = `
            <div class="relative group cursor-pointer flex flex-col items-center justify-center">
              
              <!-- 3. Petit point lumineux par défaut -->
              <div class="w-4 h-4 rounded-full bg-secondary shadow-[0_0_15px_#D4AF37] border-2 border-white/50 animate-pulse"></div>
              
              <!-- 3. Tooltip au survol (Group-Hover Tailwind) -->
              <div class="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[120] flex flex-col items-center w-52 translate-y-2 group-hover:translate-y-0">
                
                <!-- Fond Glassmorphism -->
                <div class="bg-black/60 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-2xl flex flex-col items-center w-full">
                  <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-primary shadow-[0_0_10px_#228B22] mb-3">
                    <img src="${d.image_url}" alt="${d.name}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/150?text=Animal'" />
                  </div>
                  <span class="text-white font-semibold text-sm text-center leading-tight truncate w-full px-2">${d.name}</span>
                  <span class="text-secondary/80 text-[10px] uppercase font-bold tracking-wider mt-1">${d.habitat || 'Habitat Inconnu'}</span>
                </div>
                
                <!-- Flèche pointant vers le bas -->
                <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white/20 mt-[-1px]"></div>
              </div>

            </div>
          `;

                    // Activation de l'interactivité par dessus le canevas WebGL
                    el.style.pointerEvents = 'auto';
                    el.onclick = () => handleMarkerClick(d);

                    return el;
                }}
            />
        </div>
    );
};

export default Catalog;
