import React from 'react';
import { Leaf, Github, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-background py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary mb-4">
                            <Leaf className="w-6 h-6" />
                            <span>WildLens</span>
                        </Link>
                        <p className="text-gray-400 text-sm max-w-sm">
                            L'encyclopédie animale nouvelle génération. Explorez, apprenez et protégez la faune sauvage avec nous.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-secondary">Liens Rapides</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/catalog" className="hover:text-primary transition-colors">Catalogue</Link></li>
                            <li><Link to="/scanner" className="hover:text-primary transition-colors">Scanner IA</Link></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-secondary">Suivez-nous</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} WildLens. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
