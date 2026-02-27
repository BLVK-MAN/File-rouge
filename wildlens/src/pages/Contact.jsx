import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Background Slider Logic
const backgroundImages = [
    "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=80&w=2500&auto=format&fit=crop", // Éléphant
    "https://images.unsplash.com/photo-1540182879577-0ccae7ac932f?q=80&w=2500&auto=format&fit=crop", // Loup
    "https://images.unsplash.com/photo-1517512001402-9eed165e3056?q=80&w=2500&auto=format&fit=crop", // Girafe
    "https://images.unsplash.com/photo-1456926631375-92c8ce872def?q=80&w=2500&auto=format&fit=crop"  // Leopard
];

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error'

    const [currentBg, setCurrentBg] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
        }, 8000); // 8 seconds per image
        return () => clearInterval(interval);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            toast.error("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        setStatus('submitting');

        // =========================================================================
        // INTÉGRATION n8n
        // =========================================================================
        const webhookUrl = import.meta.env.VITE_N8N_CONTACT_WEBHOOK_URL;

        if (!webhookUrl) {
            console.error("VITE_N8N_CONTACT_WEBHOOK_URL is not defined in .env");
            setStatus('error');
            toast.error("Erreur de configuration. Le webhook n'est pas défini.");
            return;
        }

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject,
                    message: formData.message,
                    source: "wildlens-contact-form",
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error("Erreur réseau");
            }

            setStatus('success');
            toast.success("Votre message a bien été envoyé !");
        } catch (error) {
            console.error("Erreur d'envoi webhook:", error);
            setStatus('error');
            toast.error("Une erreur est survenue lors de l'envoi.");
        }
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', subject: '', message: '' });
        setStatus('idle');
    };

    return (
        <div className="min-h-[calc(100vh-64px)] relative overflow-hidden group py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center w-full">

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

            <div className="relative z-20 w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col md:flex-row">

                {/* Panneau d'informations (Gauche) */}
                <div className="md:w-2/5 bg-primary/95 text-white p-10 flex flex-col justify-between backdrop-blur-md">
                    <div>
                        <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                            <Mail className="w-8 h-8 text-secondary" /> Contactez-nous
                        </h2>
                        <p className="text-primary-foreground/80 mb-8 leading-relaxed">
                            Une question sur une espèce ? Envie de contribuer à notre encyclopédie ?
                            Remplissez ce formulaire et notre équipe technique vous répondra.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/10 p-3 rounded-full"><MessageSquare className="w-5 h-5 text-secondary" /></div>
                            <div>
                                <p className="text-sm text-primary-foreground/70">Support Technique</p>
                                <p className="font-semibold">support@wildlens.com</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formulaire de Contact (Droite) */}
                <div className="md:w-3/5 p-10 bg-white/95">
                    <AnimatePresence mode="wait">

                        {status !== 'success' ? (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">Envoyer un message</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Input
                                        label="Votre Nom" name="name" type="text"
                                        placeholder="Jane Doe" required
                                        value={formData.name} onChange={handleChange}
                                    />
                                    <Input
                                        label="Votre Email" name="email" type="email"
                                        placeholder="jane@example.com" required
                                        value={formData.email} onChange={handleChange}
                                    />
                                </div>

                                <Input
                                    label="Sujet" name="subject" type="text"
                                    placeholder="Proposition d'ajout d'animal" required
                                    value={formData.subject} onChange={handleChange}
                                />

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">Message</label>
                                    <textarea
                                        name="message" required
                                        rows="5"
                                        className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                                        placeholder="Écrivez votre message ici..."
                                        value={formData.message} onChange={handleChange}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full justify-center py-4 text-lg"
                                    disabled={status === 'submitting'}
                                >
                                    {status === 'submitting' ? (
                                        <span className="flex items-center gap-2">
                                            Envoi en cours <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">Envoyer le message <Send className="w-5 h-5" /></span>
                                    )}
                                </Button>
                            </motion.form>
                        ) : (
                            /* Message de Succès */
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center py-12"
                            >
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800 mb-4">Message Envoyé !</h3>
                                <p className="text-gray-500 mb-8 max-w-sm">
                                    Merci de nous avoir contactés. Nous avons bien reçu votre demande et
                                    reviendrons vers vous très prochainement.
                                </p>
                                <Button onClick={resetForm} variant="outline" className="border-primary text-primary hover:bg-primary/5">
                                    Envoyer un autre message
                                </Button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};

export default Contact;
