import React from 'react';
import { motion } from 'framer-motion';
import Button from './ui/Button';

const AnimalCard = ({ animal }) => {
    const displayImg = (animal.image_urls && animal.image_urls.length > 0)
        ? animal.image_urls[0]
        : animal.image_url;

    return (
        <motion.div
            className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <div className="h-48 overflow-hidden relative">
                <img
                    src={displayImg}
                    alt={animal.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-primary">
                    {animal.habitat}
                </div>
            </div>
            <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{animal.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {animal.description || "Découvrez plus de détails sur cet animal fascinant dans notre encyclopédie."}
                </p>
                <Button variant="outline" className="w-full justify-center">
                    Voir plus
                </Button>
            </div>
        </motion.div>
    );
};

export default AnimalCard;
