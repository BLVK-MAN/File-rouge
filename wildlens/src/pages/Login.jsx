import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUserThunk, loginUserThunk } from '../store/usersSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const backgroundImages = [
    "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=80&w=2500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540182879577-0ccae7ac932f?q=80&w=2500&auto=format&fit=crop", // Loup
    "https://images.unsplash.com/photo-1517512001402-9eed165e3056?q=80&w=2500&auto=format&fit=crop", // Girafe
    "https://images.unsplash.com/photo-1456926631375-92c8ce872def?q=80&w=2500&auto=format&fit=crop"  // Leopard
];

const Login = () => {
    const { t } = useTranslation();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [currentBg, setCurrentBg] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
        }, 8000); // 8 seconds per image
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);

        try {
            if (isLogin) {

                if (!username || !password) return;

                // On utilise unwrap() pour récupérer directement le payload ou jeter une erreur
                const user = await dispatch(loginUserThunk({ username, password })).unwrap();

                toast.success(`Bienvenue, ${user.username} !`);

                if (user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/profile');
                }

            } else {

                if (!username || !email || !password || !confirmPassword) return;

                if (password.length < 8) {
                    toast.error(t('login.err_pwd_length'));
                    setIsLoading(false);
                    return;
                }

                if (password !== confirmPassword) {
                    toast.error(t('login.err_pwd_match'));
                    setIsLoading(false);
                    return;
                }

                const user = await dispatch(registerUserThunk({ username, email, password })).unwrap();

                toast.success('Compte créé avec succès ! Bienvenue.');

                if (user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/profile');
                }
            }
        } catch (error) {
            toast.error(error || "Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] relative overflow-hidden group flex flex-col items-center justify-center py-16 px-4 w-full">


            <div className="absolute inset-0 z-0 transition-transform duration-[30s] ease-linear group-hover:scale-110">
                {backgroundImages.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute top-0 left-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${index === currentBg ? 'opacity-100' : 'opacity-0'}`}
                        style={{ backgroundImage: `url('${img}')` }}
                    />
                ))}
            </div>


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
                            {t('login.login_tab')}
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-white shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setIsLogin(false)}
                        >
                            {t('login.register_tab')}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 text-gray-800">
                        <Input
                            label={t('login.username')}
                            type="text"
                            placeholder={t('login.username_placeholder')}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />

                        <AnimatePresence mode="popLayout">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <Input
                                        label={t('login.email')}
                                        type="email"
                                        placeholder={t('login.email_placeholder')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required={!isLogin}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Input
                            label={t('login.password')}
                            type="password"
                            placeholder={t('login.password_placeholder')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <AnimatePresence mode="popLayout">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="pt-5"
                                >
                                    <Input
                                        label={t('login.confirm_password')}
                                        type="password"
                                        placeholder={t('login.confirm_password_placeholder')}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required={!isLogin}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button type="submit" disabled={isLoading} className="w-full justify-center mt-6 text-lg py-3">
                            {isLoading ? (
                                <div className="flex justify-center items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>{t('login.loading')}</span>
                                </div>
                            ) : (
                                isLogin ? t('login.btn_login') : t('login.btn_register')
                            )}
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
