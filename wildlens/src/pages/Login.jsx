import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../store/usersSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Background Slider Logic
    const backgroundImages = [
        "https://images.unsplash.com/photo-1540182879577-0ccae7ac932f?q=80&w=2500&auto=format&fit=crop", // Loup
        "https://images.unsplash.com/photo-1497752531616-c3afd9760a11?q=80&w=2500&auto=format&fit=crop", // Raccoon
        "https://images.unsplash.com/photo-1517512001402-9eed165e3056?q=80&w=2500&auto=format&fit=crop", // Girafe
        "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=2500&auto=format&fit=crop"  // Lion
    ];
    const [currentBg, setCurrentBg] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
        }, 8000); // 8 seconds per image
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) return;

        // Simuler un login/register vers Redux
        dispatch(loginUser({ email, username: isLogin ? '' : username }));

        // Notification
        toast.success(isLogin ? 'Connexion réussie !' : 'Compte créé avec succès !');

        // Admin redirect logic
        if (isLogin && email.toLowerCase() === 'admin@wildlens.com') {
            navigate('/admin');
        } else {
            navigate('/profile'); // Redirection vers le profil
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] relative overflow-hidden group flex flex-col items-center justify-center py-16 px-4 w-full">

            {/* Background animé dynamique avec Carousel */}
            <div className="absolute inset-0 z-0 transition-transform duration-[30s] ease-linear group-hover:scale-110">
                {backgroundImages.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute top-0 left-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${index === currentBg ? 'opacity-100' : 'opacity-0'}`}
                        style={{ backgroundImage: `url('${img}')` }}
                    />
                ))}
            </div>

            {/* Overlay d'assombrissement pour l'ambiance et la lisibilité */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 transition-colors duration-300 pointer-events-none"></div>

            <div className="relative z-20 flex flex-col items-center w-full">
                <div className="mb-10 text-center">
                    <div className="flex items-center justify-center gap-2 drop-shadow-lg mb-4">
                        <Leaf className="w-12 h-12 text-emerald-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                        Rejoignez <span className="text-emerald-400">WildLens</span>
                    </h1>
                    <p className="text-gray-200 mt-3 text-lg drop-shadow-md font-medium">Votre portail vers la vie sauvage.</p>
                </div>

                <motion.div
                    className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-gray-800"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-white shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setIsLogin(true)}
                        >
                            Connexion
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-white shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setIsLogin(false)}
                        >
                            Inscription
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 text-gray-800">
                        <AnimatePresence mode="popLayout">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <Input
                                        label="Nom d'utilisateur"
                                        type="text"
                                        placeholder="Ex: JaneDoeExplorer"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required={!isLogin}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Input
                            label="Email"
                            type="email"
                            placeholder="vous@exemple.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            label="Mot de passe"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button type="submit" className="w-full justify-center mt-6 text-lg py-3">
                            {isLogin ? 'Se connecter' : 'Créer un compte'}
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
