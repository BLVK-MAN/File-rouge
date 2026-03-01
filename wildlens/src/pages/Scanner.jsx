import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, ScanLine, CheckCircle, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useTranslation } from 'react-i18next';


const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");


const backgroundImages = [
    "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?q=80&w=2500&auto=format&fit=crop", // Panda
    "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=2500&auto=format&fit=crop", // Jungle Night
    "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=2500&auto=format&fit=crop", // Lion
    "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=80&w=2500&auto=format&fit=crop"  // Elephant
];

const Scanner = () => {
    const { t, i18n } = useTranslation();
    const [preview, setPreview] = useState(null);
    const [fileData, setFileData] = useState(null);
    const [scanStatus, setScanStatus] = useState('idle'); // 'idle', 'scanning', 'success', 'error'
    const [matchedAnimal, setMatchedAnimal] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const fileInputRef = useRef(null);

    const [currentBg, setCurrentBg] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
        }, 8000); // 8 seconds per image
        return () => clearInterval(interval);
    }, []);


    const fileToGenerativePart = async (file) => {
        const base64EncodedDataPromise = new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(file);
        });
        return {
            inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
        };
    };

    const handleFileSelected = async (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            setFileData(file);
            setScanStatus('idle');
            setMatchedAnimal(null);
        }
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            setFileData(file);
            setScanStatus('idle');
            setMatchedAnimal(null);
        }
    };

    const startScan = async () => {
        if (!preview || !fileData) return;

        if (!import.meta.env.VITE_GEMINI_API_KEY) {
            setScanStatus('error');
            setErrorMessage("Clé API Gemini introuvable dans le fichier .env");
            return;
        }

        setScanStatus('scanning');

        try {
            // Utiliser le modèle rapide et capable de vision, en forçant le format JSON
            const model = genAI.getGenerativeModel({
                // Mise à jour vers Gemini 2.5 Flash car la clé API ne supporte que ces modèles récents
                model: "gemini-2.5-flash",
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });

            const imagePart = await fileToGenerativePart(fileData);

            const langStr = i18n.language.startsWith('fr') ? 'French' : 'English';

            // Prompt souple demandant du JSON pour n'importe quel animal
            const prompt = `
            Identify the animal (or insect, fish, bird, etc) in this image. 
            You MUST return ONLY a valid JSON object with these EXACT keys, in ${langStr}:
            {
               "name": "${langStr} common name of the animal (make your best guess if unsure)",
               "species": "Scientific binomial name (make your best guess)",
               "habitat": "Short description of its natural habitat in ${langStr}",
               "diet": "Short description of its diet in ${langStr}",
               "description": "A fascinating 2-sentence fact about this animal in ${langStr}"
            }
            Do not refuse to answer. If it's a very obscure animal, just give me your closest guess using the JSON format above. If it's completely not an animal at all (like a car), return {"error": "Ceci n'est pas un animal reconnu."}
            `;

            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            let text = response.text().trim();

            const aiData = JSON.parse(text);

            if (aiData.error) {
                setScanStatus('error');
                setErrorMessage(aiData.error);
            } else {
                setMatchedAnimal(aiData);
                setScanStatus('success');
            }

        } catch (error) {
            console.error("Erreur Gemini:", error);
            setScanStatus('error');
            setErrorMessage(error.message || "L'analyse a échoué. Veuillez réessayer.");
        }
    };

    const resetScanner = () => {
        setPreview(null);
        setFileData(null);
        setScanStatus('idle');
        setMatchedAnimal(null);
        setErrorMessage('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="min-h-[calc(100vh-64px)] relative overflow-hidden group py-16 w-full flex flex-col justify-center">

            <div className="absolute inset-0 z-0">
                {backgroundImages.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute top-0 left-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${index === currentBg ? 'opacity-100' : 'opacity-0'}`}
                        style={{ backgroundImage: `url('${img}')` }}
                    />
                ))}
            </div>


            <div className="absolute inset-0 bg-transparent transition-transform duration-[30s] ease-linear group-hover:scale-110 z-0 pointer-events-none"></div>


            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 transition-colors duration-300 pointer-events-none"></div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-20">

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3 drop-shadow-lg">
                        <ScanLine className="w-10 h-10 text-emerald-400" /> {t('scanner.title')}
                    </h1>
                    <p className="text-gray-200 max-w-2xl mx-auto drop-shadow-md font-medium">
                        {t('scanner.subtitle')}
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">


                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-secondary" />
                                1. Image à analyser
                            </h2>

                            {!preview ? (

                                <div
                                    className="flex-grow border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-12 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer min-h-[300px]"
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    <UploadCloud className="w-16 h-16 text-gray-400 mb-4" />
                                    <p className="text-gray-600 font-medium text-center mb-2">{t('scanner.dropzone.main')}</p>
                                    <span className="text-xs text-gray-400">{t('scanner.dropzone.sub')}</span>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileSelected}
                                    />
                                </div>
                            ) : (

                                <div className="flex-grow relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 flex items-center justify-center min-h-[300px]">
                                    <img src={preview} alt="Upload preview" className="max-h-[300px] max-w-full object-contain z-10" />


                                    {scanStatus === 'scanning' && (
                                        <motion.div
                                            className="absolute top-0 left-0 w-full h-1 bg-secondary shadow-[0_0_15px_#D4AF37] z-20"
                                            animate={{ top: ['0%', '100%', '0%'] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        />
                                    )}
                                    {scanStatus === 'scanning' && (
                                        <div className="absolute inset-0 bg-primary/20 z-10 backdrop-blur-[1px]"></div>
                                    )}

                                    <button
                                        onClick={resetScanner}
                                        className="absolute top-4 right-4 z-30 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-md transition-all"
                                        disabled={scanStatus === 'scanning'}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>


                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <ScanLine className="w-5 h-5 text-primary" />
                                2. {t('scanner.results.title')}
                            </h2>

                            <div className="flex-grow bg-gray-50 rounded-2xl border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[300px] text-center relative overflow-hidden">

                                <AnimatePresence mode="wait">

                                    {scanStatus === 'idle' && (
                                        <motion.div
                                            key="idle"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="flex flex-col items-center"
                                        >
                                            <div className="w-20 h-20 rounded-full bg-gray-200 mb-4 flex items-center justify-center">
                                                <span className="text-gray-400 font-bold text-2xl">?</span>
                                            </div>
                                            <p className="text-gray-500">{t('scanner.preview.title')}</p>

                                            {preview && (
                                                <Button onClick={startScan} className="mt-6 px-8 py-3 text-lg animate-bounce">
                                                    {t('scanner.preview.btn_analyze')}
                                                </Button>
                                            )}
                                        </motion.div>
                                    )}


                                    {scanStatus === 'scanning' && (
                                        <motion.div
                                            key="scanning"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="flex flex-col items-center w-full"
                                        >
                                            <div className="relative w-24 h-24 mb-6">
                                                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                                                <motion.div
                                                    className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                />
                                                <ScanLine className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-800">{t('scanner.preview.btn_analyzing')}</h3>
                                            <p className="text-gray-500 text-sm mt-2">Gemini AI</p>
                                        </motion.div>
                                    )}


                                    {scanStatus === 'error' && (
                                        <motion.div
                                            key="error"
                                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center w-full"
                                        >
                                            <div className="text-red-500 mb-4">
                                                <AlertTriangle className="w-16 h-16 mx-auto" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-2">Impossible d'identifier l'image</h3>
                                            <p className="text-red-500 text-sm mb-6">{errorMessage}</p>

                                            <Button onClick={resetScanner} variant="outline" className="w-full justify-center">
                                                Réessayer avec une autre photo
                                            </Button>
                                        </motion.div>
                                    )}


                                    {scanStatus === 'success' && matchedAnimal && (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center w-full"
                                        >
                                            <div className="bg-green-100 text-green-700 p-2 rounded-full mb-4 inline-flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5" />
                                                <span className="font-bold text-sm">Identification réussie</span>
                                            </div>

                                            <div className="bg-white w-full rounded-xl shadow-md border hover:border-primary transition-colors p-6 mb-6 text-left flex flex-col gap-4">
                                                <div className="border-b pb-4">
                                                    <h4 className="font-bold text-primary text-2xl">{matchedAnimal.name}</h4>
                                                    <p className="text-sm text-gray-500 italic mt-1 font-serif">{matchedAnimal.species}</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                                    <div>
                                                        <strong className="text-gray-700 block mb-1">🌍 Habitat</strong>
                                                        <span className="text-gray-600">{matchedAnimal.habitat}</span>
                                                    </div>
                                                    <div>
                                                        <strong className="text-gray-700 block mb-1">🍖 Régime</strong>
                                                        <span className="text-gray-600">{matchedAnimal.diet}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-700 leading-relaxed italic">
                                                        "{matchedAnimal.description}"
                                                    </p>
                                                </div>
                                            </div>

                                            <button onClick={resetScanner} className="mt-4 text-sm text-gray-500 hover:text-primary transition-colors underline font-medium">
                                                Scanner un autre animal
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Scanner;
