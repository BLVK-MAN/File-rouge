import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, Leaf, User, LogOut, Settings, Sun, Moon } from 'lucide-react';
import gsap from 'gsap';
import { logoutUser } from '../store/usersSlice';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext'; // IMPORT THEME HOOK
import { useTranslation } from 'react-i18next'; // IMPORT I18N HOOK

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    const currentUser = useSelector((state) => state.users.currentUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { theme, toggleTheme } = useTheme(); // USE THEME

    const toggleMenu = () => setIsOpen(!isOpen);

    useEffect(() => {
        if (isOpen) {
            gsap.to(menuRef.current, {
                height: 'auto',
                opacity: 1,
                duration: 0.3,
                ease: 'power2.out',
            });
        } else {
            gsap.to(menuRef.current, {
                height: 0,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in',
            });
        }
    }, [isOpen]);

    const navLinks = [
        { name: t('navbar.home'), path: '/' },
        { name: t('navbar.catalog'), path: '/catalog' },
        { name: t('navbar.scanner'), path: '/scanner' },
        { name: t('navbar.contact'), path: '/contact' },
    ];

    const changeLanguage = () => {
        const nextLang = i18n.language.startsWith('fr') ? 'en' : 'fr';
        i18n.changeLanguage(nextLang);
    };

    const handleLogout = () => {
        dispatch(logoutUser());
        toast.success('Déconnexion réussie ! À bientôt.');
        navigate('/');
    };

    const navBgClass = theme === 'dark'
        ? "bg-[url('https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2500&auto=format&fit=crop')]" // Esthétique Dark Forest statique
        : "bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2500&auto=format&fit=crop')]";

    return (
        <nav className={`text-primary-foreground shadow-xl sticky top-0 z-50 relative overflow-hidden group`}>
            <div className={`absolute inset-0 ${navBgClass} bg-cover bg-center transition-transform duration-[30s] ease-linear group-hover:scale-110 z-0`}></div>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 transition-colors duration-300"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                <div className="flex justify-between md:grid md:grid-cols-3 h-16 items-center w-full">

                    <div className="flex justify-start items-center">
                        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white hover:text-emerald-300 transition-colors drop-shadow-md shrink-0">
                            <Leaf className="w-8 h-8 drop-shadow-md text-emerald-400" />
                            <span className="tracking-tight">WildLens</span>
                        </Link>
                    </div>


                    <div className="hidden md:flex justify-center space-x-6 lg:space-x-8 items-center w-full">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className={({ isActive }) =>
                                    `transition-colors font-bold border-b-2 py-1 px-1 drop-shadow-md whitespace-nowrap ${isActive ? 'text-emerald-300 border-emerald-300' : 'text-white border-transparent hover:text-emerald-200 hover:border-emerald-200'}`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </div>


                    <div className="hidden md:flex justify-end items-center gap-3 lg:gap-4 shrink-0">
                        {/* THEME TOGGLE (DESKTOP) */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white backdrop-blur-md shrink-0"
                            title={theme === 'dark' ? "Mode Clair" : "Mode Sombre"}
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5 drop-shadow-md" /> : <Moon className="w-5 h-5 drop-shadow-md" />}
                        </button>

                        <div className="w-px h-6 bg-white/20 hidden lg:block"></div>

                        {/* Si Connecté */}
                        <div className="flex items-center gap-3">
                            {currentUser ? (
                                <>
                                    {currentUser.role === 'admin' && (
                                        <NavLink
                                            to="/admin"
                                            className={({ isActive }) =>
                                                `flex items-center gap-2 font-bold transition-colors drop-shadow-md ${isActive ? 'text-emerald-300' : 'text-white hover:text-emerald-200'}`
                                            }
                                            title={t('navbar.admin')}
                                        >
                                            <Settings className="w-5 h-5 bg-black/20 p-1 rounded-md" />
                                        </NavLink>
                                    )}
                                    <NavLink
                                        to="/profile"
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 font-bold transition-colors drop-shadow-md ${isActive ? 'text-emerald-300' : 'text-white hover:text-emerald-200'}`
                                        }
                                        title={t('navbar.profile')}
                                    >
                                        <User className="w-5 h-5 bg-black/20 p-1 rounded-full shrink-0" />
                                        <span className="max-w-[100px] truncate hidden lg:block">{currentUser.username}</span>
                                    </NavLink>
                                    <button onClick={handleLogout} className="text-red-300 hover:text-red-400 p-1 transition-colors drop-shadow-md" title={t('navbar.logout')}>
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                /* Si Déconnecté */
                                <NavLink
                                    to="/login"
                                    className={({ isActive }) =>
                                        `px-4 lg:px-5 py-2 rounded-full transition-all font-bold border-2 drop-shadow-md whitespace-nowrap ${isActive ? 'bg-black/40 border-emerald-300 text-emerald-300' : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-500 hover:border-emerald-500'}`
                                    }
                                >
                                    {t('navbar.login')}
                                </NavLink>
                            )}
                        </div>

                        {/* LANGUAGE TOGGLE ON THE RIGHT */}
                        <button
                            onClick={changeLanguage}
                            className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white backdrop-blur-md font-bold text-sm tracking-wider uppercase border border-white/30 shrink-0 ml-1"
                            title="Change Language"
                        >
                            {i18n.language.startsWith('fr') ? 'EN' : 'FR'}
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={changeLanguage}
                            className="px-2 py-1 rounded bg-white/10 text-white font-bold text-xs"
                        >
                            {i18n.language.startsWith('fr') ? 'EN' : 'FR'}
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="p-1.5 rounded-full bg-white/10 text-secondary"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={toggleMenu}
                            className="text-primary-foreground hover:text-secondary focus:outline-none"
                        >
                            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                        </button>
                    </div>
                </div>
            </div>


            <div ref={menuRef} className="md:hidden overflow-hidden h-0 opacity-0 bg-primary border-t border-white/10 shadow-inner">
                <div className="px-4 pt-4 pb-6 space-y-2">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                `block px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive ? 'bg-secondary/20 text-secondary' : 'text-primary-foreground hover:bg-white/10'}`
                            }
                        >
                            {link.name}
                        </NavLink>
                    ))}

                    <div className="border-t border-white/10 pt-4 mt-2">
                        {currentUser ? (
                            <>
                                {currentUser.role === 'admin' && (
                                    <NavLink
                                        to="/admin"
                                        onClick={() => setIsOpen(false)}
                                        className={({ isActive }) =>
                                            `block px-4 py-3 rounded-xl text-base font-medium mb-2 ${isActive ? 'bg-secondary/20 text-secondary' : 'text-primary-foreground bg-white/5 hover:bg-white/10'}`
                                        }
                                    >
                                        {t('navbar.admin')}
                                    </NavLink>
                                )}
                                <NavLink
                                    to="/profile"
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `block px-4 py-3 rounded-xl text-base font-medium mb-2 ${isActive ? 'bg-secondary/20 text-secondary' : 'text-primary-foreground bg-white/10'}`
                                    }
                                >
                                    {t('navbar.profile')} ({currentUser.username})
                                </NavLink>
                                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-base font-bold text-accent bg-accent/10 hover:bg-accent/20">
                                    {t('navbar.logout')}
                                </button>
                            </>
                        ) : (
                            <NavLink
                                to="/login"
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `block text-center px-4 py-3 rounded-full text-base font-bold mt-2 ${isActive ? 'bg-transparent border-2 border-secondary text-secondary' : 'text-primary bg-secondary'}`
                                }
                            >
                                {t('navbar.login')}
                            </NavLink>
                        )}
                    </div>
                </div>
            </div>
        </nav >
    );
};

export default Navbar;
