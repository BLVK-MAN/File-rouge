import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import Button from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="min-h-[85vh] bg-background flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-8">
                <h1 className="text-9xl font-black text-gray-200">404</h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Compass className="w-24 h-24 text-primary animate-pulse" />
                </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('notFound.title')}</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
                {t('notFound.desc')}
            </p>

            <div className="flex gap-4">
                <Button onClick={() => navigate('/')} className="gap-2">
                    <Home className="w-5 h-5" /> {t('notFound.btn_home')}
                </Button>
                <Button onClick={() => navigate('/catalog')} variant="outline" className="gap-2">
                    <Compass className="w-5 h-5" /> {t('notFound.btn_catalog')}
                </Button>
            </div>
        </div>
    );
};

export default NotFound;
