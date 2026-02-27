import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe2, ScanFace, Compass, ArrowRight, ShieldCheck, Users, Eye } from 'lucide-react';
import Button from '../components/ui/Button';
import { useTheme } from '../contexts/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
    const navigate = useNavigate();
    const heroRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const ctaRef = useRef(null);
    const { theme } = useTheme();

    // The hero images change dynamically based on whether dark mode is active
    const heroImages = [
        "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=2500&auto=format&fit=crop", // Lion
        "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=80&w=2500&auto=format&fit=crop", // Elephant
        "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?q=80&w=2500&auto=format&fit=crop", // Panda
        "https://images.unsplash.com/photo-1504173010664-32509aeebb62?q=80&w=2500&auto=format&fit=crop"  // Tiger
    ];
    const [currentBg, setCurrentBg] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBg((prevBg) => (prevBg + 1) % heroImages.length);
        }, 5000); // Change image every 5 seconds
        return () => clearInterval(interval);
    }, []);

    // Pour la section features
    const cardsRef = useRef([]);
    cardsRef.current = []; // Clear to prevent accumulation in Strict Mode
    const addToCardsRef = (el) => {
        if (el && !cardsRef.current.includes(el)) cardsRef.current.push(el);
    };

    // Pour la section Mission
    const missionImageRef = useRef(null);
    const missionTextRef = useRef(null);

    // Pour la section Statistiques
    const statsContainerRef = useRef(null);
    const statNumbersRef = useRef([]);
    statNumbersRef.current = []; // Clear to prevent accumulation in Strict Mode
    const addToStatsRef = (el) => {
        if (el && !statNumbersRef.current.includes(el)) statNumbersRef.current.push(el);
    };

    useEffect(() => {
        let ctx = gsap.context(() => {
            // --- ANIMATIONS D'ENTRÉE (HERO) - Douces et rapides ---
            gsap.from(heroRef.current, { scale: 1.02, duration: 1.5, ease: "power2.out" });
            gsap.fromTo(titleRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.1, ease: "power2.out" });
            gsap.fromTo(subtitleRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: "power2.out" });
            gsap.fromTo(ctaRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.5, ease: "power2.out" });

            // --- ANIMATIONS AU SCROLL (FEATURES) - Allégées ---
            gsap.fromTo(cardsRef.current,
                { y: 30, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: ".features-section",
                        start: "top 85%",
                    },
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "power1.out"
                }
            );

            // --- ANIMATIONS AU SCROLL (MISSION) - Allégées ---
            gsap.fromTo(missionImageRef.current,
                { opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: ".mission-section",
                        start: "top 80%",
                    },
                    opacity: 1,
                    duration: 0.8,
                    ease: "power2.out"
                }
            );

            gsap.fromTo(missionTextRef.current,
                { y: 20, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: ".mission-section",
                        start: "top 80%",
                    },
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    delay: 0.2,
                    ease: "power2.out"
                }
            );

            // --- ANIMATIONS AU SCROLL (STATISTIQUES) ---
            gsap.fromTo(statsContainerRef.current,
                { opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: ".stats-section",
                        start: "top 90%",
                    },
                    opacity: 1,
                    duration: 0.5
                }
            );

            // Animation de comptage pour les chiffres (Optimisée)
            statNumbersRef.current.forEach((el) => {
                const target = parseInt(el.getAttribute("data-target")) || 0;
                gsap.to(el, {
                    scrollTrigger: {
                        trigger: ".stats-section",
                        start: "top 90%",
                    },
                    innerHTML: target,
                    duration: 1.5,
                    snap: { innerHTML: 1 },
                    ease: "power1.out",
                    onUpdate: function () {
                        el.innerHTML = Math.round(this.targets()[0].innerHTML) + (el.getAttribute("data-suffix") || "");
                    }
                });
            });
        });

        return () => ctx.revert();
    }, []);

    const features = [
        {
            id: 1,
            title: "Globe Interactif",
            description: "Plongez en immersion dans une reconstitution 3D de la Terre et explorez les habitats naturels.",
            icon: <Globe2 className="w-10 h-10 text-primary group-hover:text-secondary transition-colors" />,
            link: "/catalog",
            bgClass: "bg-emerald-50 dark:bg-emerald-900/20"
        },
        {
            id: 2,
            title: "Technologie IA",
            description: "Notre algorithme de reconnaissance analyse vos clichés pour identifier instantanément les espèces.",
            icon: <ScanFace className="w-10 h-10 text-primary group-hover:text-secondary transition-colors" />,
            link: "/scanner",
            bgClass: "bg-teal-50 dark:bg-teal-900/20"
        },
        {
            id: 3,
            title: "Base de Données",
            description: "Accédez à des fiches descriptives complètes, régimes alimentaires et données de conservation.",
            icon: <Compass className="w-10 h-10 text-primary group-hover:text-secondary transition-colors" />,
            link: "/catalog",
            bgClass: "bg-green-50 dark:bg-green-900/20"
        }
    ];

    const stats = [
        { id: 1, label: "Espèces Référencées", value: 350, suffix: "+" },
        { id: 2, label: "Membres Actifs", value: 12, suffix: "k" },
        { id: 3, label: "Analyses IA Réalisées", value: 85, suffix: "k" },
        { id: 4, label: "Partenaires ONG", value: 15, suffix: "" },
    ];

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">

            {/* --- HERO SECTION --- */}
            <section className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden border-none m-0 p-0">
                {/* Background Image Parallax Carousel */}
                <div ref={heroRef} className="absolute inset-0 z-0 w-full h-full transform scale-105">
                    {heroImages.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full transition-opacity duration-1000 ${index === currentBg ? 'opacity-100' : 'opacity-0'
                                }`}
                            style={{ backgroundImage: `url('${img}')` }}
                        />
                    ))}
                </div>

                {/* Hero Content */}
                <div className="relative z-20 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
                    <div className="overflow-hidden mb-6 py-2">
                        <h1
                            ref={titleRef}
                            className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter drop-shadow-2xl leading-none"
                        >
                            Wild<span className="text-secondary">Lens.</span>
                        </h1>
                    </div>

                    <p
                        ref={subtitleRef}
                        className="text-xl md:text-2xl lg:text-3xl text-gray-200 font-light max-w-3xl mx-auto mb-12 drop-shadow-lg"
                    >
                        Redécouvrez la nature sauvage grâce à l'exploration 3D et l'intelligence artificielle.
                    </p>

                    <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 items-center">
                        <Button
                            onClick={() => navigate('/catalog')}
                            className="text-lg px-8 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform duration-300 w-full sm:w-auto bg-primary hover:bg-secondary text-white border-none"
                        >
                            Ouvrir le Catalogue <Globe2 className="w-5 h-5 ml-2" />
                        </Button>
                        <Button
                            onClick={() => navigate('/scanner')}
                            className="text-lg px-8 py-4 rounded-full shadow-xl hover:scale-105 transition-transform duration-300 bg-white/20 text-white border border-white/50 hover:bg-white/30 w-full sm:w-auto backdrop-blur-md"
                            variant="outline"
                        >
                            Scanner une photo <ScanFace className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* --- FEATURES SECTION --- */}
            <section className="features-section py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-20 relative z-30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            ref={addToCardsRef}
                            onClick={() => navigate(feature.link)}
                            className={`group cursor-pointer rounded-[2rem] p-10 shadow-xl dark:shadow-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-slate-800/80 backdrop-blur-sm transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl flex flex-col items-start`}
                        >
                            <div className={`p-4 rounded-2xl mb-8 ${feature.bgClass} flex items-center justify-center w-16 h-16 transition-colors shadow-inner`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8 flex-grow">
                                {feature.description}
                            </p>
                            <div className="mt-auto flex items-center font-bold text-primary group-hover:text-secondary transition-colors uppercase tracking-wider text-sm">
                                Découvrir <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- MISSION SECTION --- */}
            <section className="mission-section py-24 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-white/5 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div ref={missionImageRef} className="relative w-full h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/20 dark:shadow-black/50 border-[6px] border-white dark:border-slate-800">
                            <img
                                src="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2000&auto=format&fit=crop"
                                alt="Observation de la nature"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white">
                                    <p className="italic font-light text-lg">"La compréhension est le premier pas vers la conservation de la biodiversité mondiale."</p>
                                </div>
                            </div>
                        </div>

                        <div ref={missionTextRef} className="flex flex-col justify-center">
                            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5" /> Notre Mission
                            </h2>
                            <h3 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                                Protéger en apprenant à <span className="text-primary italic">connaître</span>.
                            </h3>
                            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                                Chez WildLens, nous croyons fermement que l'éducation et la sensibilisation sont les outils les plus puissants pour préserver notre écosystème. Notre plateforme regroupe des données précises, des visuels immersifs et une technologie de pointe pour transformer chaque curieux en véritable ambassadeur de la nature.
                            </p>
                            <ul className="space-y-4 mb-10">
                                <li className="flex items-center gap-4 text-slate-700 dark:text-slate-200 font-medium text-lg">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shadow-sm"><Eye className="w-5 h-5" /></div>
                                    Observation éthique et responsable
                                </li>
                                <li className="flex items-center gap-4 text-slate-700 dark:text-slate-200 font-medium text-lg">
                                    <div className="w-10 h-10 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center text-accent shadow-sm"><Users className="w-5 h-5" /></div>
                                    Communauté d'experts et de passionnés
                                </li>
                            </ul>
                            <Button onClick={() => navigate('/contact')} className="w-fit text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-shadow bg-slate-900 text-white hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary/90">Rejoindre le mouvement</Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- STATISTIQUES SECTION --- */}
            <section className="stats-section py-24 relative overflow-hidden bg-primary dark:bg-slate-900 dark:border-t dark:border-white/10">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

                <div ref={statsContainerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        {stats.map((stat) => (
                            <div key={stat.id} className="text-center flex flex-col items-center">
                                <div className="text-5xl md:text-6xl font-black text-white mb-2 drop-shadow-md flex">
                                    <span ref={addToStatsRef} data-target={stat.value} data-suffix={stat.suffix}>0</span>
                                </div>
                                <div className="h-1 w-12 bg-secondary rounded-full mb-4"></div>
                                <p className="text-primary-foreground/90 font-medium text-lg md:text-xl">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
