import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Image as ImageIcon, Upload, ArrowLeft, ShieldAlert, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { addAnimal } from '../store/animalsSlice';

const AddAnimal = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector(state => state.users.currentUser);

    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        species: '',
        habitat: '',
        diet: 'herbivore',
        description: '',
        image_url: '',
        latitude: '',
        longitude: ''
    });

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    // Security check
    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center bg-background">
                <ShieldAlert className="w-20 h-20 text-red-500 mb-6" />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Accès Restreint</h2>
                <Button onClick={() => navigate('/login')}>Se connecter</Button>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setSelectedFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
        // clear input value so the same files can be selected again if removed
        e.target.value = null;
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            const newUrls = [...prev];
            URL.revokeObjectURL(newUrls[index]); // Free memory
            newUrls.splice(index, 1);
            return newUrls;
        });
    };

    const uploadToCloudinary = async (file) => {
        const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dynqliq6x/image/upload";
        const UPLOAD_PRESET = "Animaux";
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('upload_preset', UPLOAD_PRESET);

        try {
            const res = await fetch(CLOUDINARY_URL, {
                method: 'POST',
                body: uploadData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || "Erreur d'upload vers Cloudinary");
            return data.secure_url;
        } catch (error) {
            console.error("Erreur Cloudinary:", error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.species || !formData.habitat) {
            toast.error("Veuillez remplir les champs obligatoires.");
            return;
        }

        setIsSubmitting(true);
        let finalImageUrls = [];

        if (selectedFiles.length > 0) {
            setIsUploading(true);
            try {
                const uploadPromises = selectedFiles.map(file => uploadToCloudinary(file));
                const uploadedUrls = await Promise.all(uploadPromises);
                finalImageUrls = [...uploadedUrls];
                toast.success("Images uploadées avec succès !");
            } catch {
                toast.error("Échec de l'upload des images. Vérifiez votre configuration Cloudinary.");
                setIsUploading(false);
                setIsSubmitting(false);
                return;
            }
            setIsUploading(false);
        } else if (!formData.image_url) {
            toast.error("Veuillez sélectionner au moins une image pour cet animal.");
            setIsSubmitting(false);
            return;
        } else if (formData.image_url) {
            // Fallback for direct URL input if implemented later
            finalImageUrls = [formData.image_url];
        }

        const newAnimal = {
            ...formData,
            image_urls: finalImageUrls,
            image_url: finalImageUrls[0] || formData.image_url, // Backward compatibility for systems expecting string
            latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
            longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
            createdAt: new Date().toISOString(),
            comments: [] // Initialize empty comments array
        };

        try {
            await dispatch(addAnimal(newAnimal)).unwrap();
            toast.success(`${newAnimal.name} ajouté avec succès !`);
            navigate('/admin'); // Return to dashboard after adding
        } catch (error) {
            toast.error(`Erreur: ${error.message || error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/admin')}
                    className="mb-8 flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-semibold"
                >
                    <ArrowLeft className="w-5 h-5" /> Retour au Dashboard
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="border-b border-gray-100 bg-gray-50 px-8 py-6 flex items-center gap-3">
                        <PlusCircle className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-semibold text-gray-800">Ajouter un nouvel animal</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Colonne de Gauche : Infos Textuelles */}
                            <div className="space-y-5">
                                <Input label="Nom Commun *" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Lion d'Afrique" required />
                                <Input label="Nom Scientifique / Espèce *" name="species" value={formData.species} onChange={handleChange} placeholder="Ex: Panthera leo" required />
                                <Input label="Habitat Principal *" name="habitat" value={formData.habitat} onChange={handleChange} placeholder="Ex: Savane africaine" required />

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">Régime Alimentaire *</label>
                                    <select
                                        name="diet"
                                        value={formData.diet}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        required
                                    >
                                        <option value="herbivore">Herbivore</option>
                                        <option value="carnivore">Carnivore</option>
                                        <option value="omnivore">Omnivore</option>
                                        <option value="frugivore">Frugivore</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Latitude (Optionnel)" name="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} placeholder="Ex: -1.29" />
                                    <Input label="Longitude (Optionnel)" name="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} placeholder="Ex: 36.82" />
                                </div>
                            </div>

                            {/* Colonne de Droite : Média et Description */}
                            <div className="space-y-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">Description Détaillée</label>
                                    <textarea
                                        name="description"
                                        rows="4"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                                        placeholder="Décrivez l'animal, son comportement, ses particularités..."
                                    />
                                </div>

                                {/* Section d'Upload d'Image Cloudinary */}
                                <div className="mt-4">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                                        <ImageIcon className="w-4 h-4" /> Images de l'animal *
                                    </label>

                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-all bg-gray-50">

                                        {/* Previews Grid */}
                                        {previewUrls.length > 0 && (
                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                                {previewUrls.map((url, idx) => (
                                                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square shadow-sm">
                                                        <img src={url} alt={`Aperçu ${idx + 1}`} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFile(idx)}
                                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md hover:bg-red-600"
                                                            title="Supprimer cette image"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex flex-col items-center">
                                            {previewUrls.length === 0 && <Upload className="w-10 h-10 text-gray-400 mb-3" />}
                                            <p className="text-sm text-gray-600 mb-1">
                                                {previewUrls.length > 0 ? "Ajouter d'autres images" : "Glissez des images ici ou cliquez pour parcourir."}
                                            </p>

                                            <label className="bg-white border border-gray-300 text-gray-700 px-4 py-2 mt-4 rounded-lg cursor-pointer hover:bg-gray-50 font-medium text-sm transition-colors shadow-sm inline-block">
                                                Sélectionner des fichiers
                                                <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
                                            </label>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                            <Button
                                type="submit"
                                className="px-8 py-3 text-lg justify-center w-full md:w-auto"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        {isUploading ? "Upload des images..." : "Enregistrement..."}
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <PlusCircle className="w-5 h-5" /> Créer l'animal
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddAnimal;

