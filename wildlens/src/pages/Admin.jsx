import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Image as ImageIcon, Upload, CheckCircle, ShieldAlert, Edit, Trash2, MessageSquare, X, BarChart } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { addAnimal, fetchAnimals, updateAnimal, deleteAnimal } from '../store/animalsSlice';
import { fetchUsers } from '../store/usersSlice';
import { getLocalized } from '../utils/langHelper';
import { translateAnimalData } from '../utils/translator';
import { useTranslation } from 'react-i18next';

const Admin = () => {
    const { i18n } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Selectors
    const currentUser = useSelector(state => state.users.currentUser);
    const users = useSelector(state => state.users.users);
    const { animals, status: animalStatus } = useSelector(state => state.animals);

    const [, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial fetch
    useEffect(() => {
        if (currentUser && currentUser.role === 'admin') {
            dispatch(fetchAnimals());
            dispatch(fetchUsers());
        }
    }, [dispatch, currentUser]);

    // Stat widgets calculations
    const totalAnimals = animals.length;

    let mostFavoritedInfo = null;
    if (animals.length > 0 && users.length > 0) {
        const favoriteCounts = {};
        users.forEach(u => {
            if (u.favorites) {
                u.favorites.forEach(animalId => {
                    favoriteCounts[animalId] = (favoriteCounts[animalId] || 0) + 1;
                });
            }
        });

        let topAnimalId = null;
        let maxCount = 0;
        Object.entries(favoriteCounts).forEach(([id, count]) => {
            if (count > maxCount) {
                maxCount = count;
                topAnimalId = id;
            }
        });

        if (topAnimalId) {
            const topAnimal = animals.find(a => a.id === topAnimalId);
            if (topAnimal) {
                mostFavoritedInfo = {
                    name: topAnimal.name,
                    count: maxCount
                };
            }
        }
    }

    // Modal States
    const [editingAnimal, setEditingAnimal] = useState(null); // Used for both modal visibility and data
    const [commentsModalAnimal, setCommentsModalAnimal] = useState(null);

    // Formulaire d'ajout ou d'édition
    const [formData, setFormData] = useState({
        name: '',
        species: '',
        habitat: '',
        diet: 'herbivore',
        description: '',
        image_url: '',
        latitude: '',
        longitude: '',
        location: '',
        estimatedPopulation: '',
        topSpeed: ''
    });

    const [existingImageUrls, setExistingImageUrls] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center bg-background">
                <ShieldAlert className="w-20 h-20 text-red-500 mb-6" />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Accès Restreint</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                    Vous devez être connecté avec un compte Administrateur pour accéder à cette zone.
                </p>
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
        e.target.value = null; // reset input
    };

    const handleRemoveNewFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            const newUrls = [...prev];
            URL.revokeObjectURL(newUrls[index]);
            newUrls.splice(index, 1);
            return newUrls;
        });
    };

    const handleRemoveExistingImage = (index) => {
        setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
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

    const handleEditClick = (animal) => {
        setEditingAnimal(animal);
        setFormData({
            name: getLocalized(animal.name, 'fr') || '',
            species: getLocalized(animal.species, 'fr') || '',
            habitat: getLocalized(animal.habitat, 'fr') || '',
            diet: getLocalized(animal.diet, 'fr') || 'herbivore',
            description: getLocalized(animal.description, 'fr') || '',
            image_url: animal.image_url || '',
            latitude: animal.latitude || '',
            longitude: animal.longitude || '',
            location: getLocalized(animal.location, 'fr') || '',
            estimatedPopulation: getLocalized(animal.estimatedPopulation, 'fr') || '',
            topSpeed: getLocalized(animal.topSpeed, 'fr') || ''
        });
        const urls = Array.isArray(animal.image_urls) && animal.image_urls.length > 0
            ? animal.image_urls
            : (animal.image_url ? [animal.image_url] : []);
        setExistingImageUrls(urls);
        setPreviewUrls([]);
        setSelectedFiles([]);
    };

    const handleCancelEdit = () => {
        setEditingAnimal(null);
        setFormData({
            name: '', species: '', habitat: '', diet: 'herbivore', description: '', image_url: '', latitude: '', longitude: '', location: '', estimatedPopulation: '', topSpeed: ''
        });
        setExistingImageUrls([]);
        setPreviewUrls([]);
        setSelectedFiles([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.species || !formData.habitat) {
            toast.error("Veuillez remplir les champs obligatoires (Nom, Espèce, Habitat).");
            return;
        }

        setIsSubmitting(true);
        let uploadedUrls = [];

        if (selectedFiles.length > 0) {
            setIsUploading(true);
            try {
                const uploadPromises = selectedFiles.map(file => uploadToCloudinary(file));
                uploadedUrls = await Promise.all(uploadPromises);
            } catch {
                toast.error("Échec de l'upload des images sur Cloudinary.");
                setIsUploading(false);
                setIsSubmitting(false);
                return;
            }
            setIsUploading(false);
        }

        const finalImageUrls = [...existingImageUrls, ...uploadedUrls];

        if (finalImageUrls.length === 0 && !formData.image_url) {
            toast.error("Veuillez conserver au moins une image.");
            setIsSubmitting(false);
            return;
        }

        let translatedFields;
        try {
            toast('Traduction des modifications en cours (IA)...', { icon: '🤖' });
            translatedFields = await translateAnimalData(formData);
        } catch (err) {
            console.error(err);
        }

        const payload = {
            ...formData,
            name: translatedFields?.name || { fr: formData.name, en: formData.name },
            species: translatedFields?.species || { fr: formData.species, en: formData.species },
            habitat: translatedFields?.habitat || { fr: formData.habitat, en: formData.habitat },
            location: translatedFields?.location || { fr: formData.location || "", en: formData.location || "" },
            diet: translatedFields?.diet || { fr: formData.diet, en: formData.diet },
            estimatedPopulation: translatedFields?.estimatedPopulation || { fr: formData.estimatedPopulation || "", en: formData.estimatedPopulation || "" },
            topSpeed: translatedFields?.topSpeed || { fr: formData.topSpeed || "", en: formData.topSpeed || "" },
            characteristics: translatedFields?.characteristics || { fr: [], en: [] },
            description: translatedFields?.description || { fr: formData.description, en: formData.description },
            image_urls: finalImageUrls,
            image_url: finalImageUrls[0] || formData.image_url, // fallback
            latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
            longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        };

        try {
            if (editingAnimal) {
                // Update
                payload.id = editingAnimal.id;
                payload.comments = editingAnimal.comments; // Preserve comments
                payload.createdAt = editingAnimal.createdAt;
                await dispatch(updateAnimal(payload)).unwrap();
                toast.success(`${payload.name} modifié avec succès !`);
                handleCancelEdit();
            } else {
                // Add
                payload.createdAt = new Date().toISOString();
                payload.comments = [];
                await dispatch(addAnimal(payload)).unwrap();
                toast.success(`${payload.name} ajouté avec succès !`);
                // Reset form
                setFormData({
                    name: '', species: '', habitat: '', diet: 'herbivore', description: '', image_url: '', latitude: '', longitude: '', location: '', estimatedPopulation: '', topSpeed: ''
                });
                setSelectedFiles([]);
                setPreviewUrls([]);
            }
        } catch (error) {
            toast.error(`Erreur: ${error.message || error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAnimal = async (id, name) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement ${name} ?`)) {
            try {
                await dispatch(deleteAnimal(id)).unwrap();
                toast.success(`${name} a été supprimé.`);
            } catch {
                toast.error("Erreur lors de la suppression.");
            }
        }
    };

    // Comment deletion
    const handleDeleteComment = async (animal, commentId) => {
        if (!window.confirm("Supprimer ce commentaire ?")) return;

        const updatedComments = animal.comments.filter(c => c.id !== commentId);
        const updatedAnimal = { ...animal, comments: updatedComments };

        try {
            await dispatch(updateAnimal(updatedAnimal)).unwrap();
            setCommentsModalAnimal(updatedAnimal); // Refresh modal view
            toast.success("Commentaire supprimé");
        } catch {
            toast.error("Erreur lors de la suppression du commentaire");
        }
    };

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                            <ShieldAlert className="w-8 h-8 text-secondary" />
                            Dashboard Administrateur
                        </h1>
                        <p className="text-gray-500 mt-2">Gérez la base de données et la communauté WildLens.</p>
                    </div>
                    <Button onClick={() => navigate('/admin/add')} className="flex items-center gap-2">
                        <PlusCircle className="w-5 h-5" />
                        Ajouter un Animal
                    </Button>
                </div>

                {/* Dashboard Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                            <BarChart className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total des Animaux</p>
                            <h3 className="text-4xl font-black text-slate-800">{totalAnimals}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Animal le plus favori</p>
                            {mostFavoritedInfo ? (
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 line-clamp-1">{getLocalized(mostFavoritedInfo.name, i18n.language)}</h3>
                                    <p className="text-sm text-gray-400 font-medium">{mostFavoritedInfo.count} favoris</p>
                                </div>
                            ) : (
                                <h3 className="text-xl font-bold text-gray-400">Aucune donnée</h3>
                            )}
                        </div>
                    </div>
                </div>

                {/* Liste des Animaux (CRUD) */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            Base de Données ({animals.length})
                        </h2>
                    </div>
                    {animalStatus === 'loading' ? (
                        <div className="p-12 text-center text-gray-500">Chargement des données...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 text-gray-500 font-medium text-sm uppercase tracking-wider border-b border-gray-100">
                                        <th className="px-6 py-4">Animal</th>
                                        <th className="px-6 py-4">Espèce</th>
                                        <th className="px-6 py-4">Communauté</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {animals.map((animal) => {
                                        const commentCount = animal.comments?.length || 0;
                                        return (
                                            <tr key={animal.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-slate-800 flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100 shadow-sm">
                                                        <img src={(animal.image_urls && animal.image_urls.length > 0) ? animal.image_urls[0] : animal.image_url} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    {getLocalized(animal.name, i18n.language)}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 font-medium">{getLocalized(animal.species, i18n.language)}</td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => setCommentsModalAnimal(animal)}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${commentCount > 0 ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-100 text-gray-400'}`}
                                                    >
                                                        <MessageSquare className="w-4 h-4" /> {commentCount}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button onClick={() => handleEditClick(animal)} className="p-2 text-gray-400 hover:text-accent bg-white rounded-lg shadow-sm border border-gray-100 hover:border-accent transition-all" title="Modifier">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteAnimal(animal.id, getLocalized(animal.name, i18n.language))} className="p-2 text-gray-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-red-500 transition-all" title="Supprimer">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {animals.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-8 text-gray-500 italic">Aucun animal dans la base.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>

            {/* MODAL MODÉRATION COMMENTAIRES */}
            {commentsModalAnimal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setCommentsModalAnimal(null)} />
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col relative z-10 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-secondary" />
                                Modération: {getLocalized(commentsModalAnimal.name, i18n.language)}
                            </h3>
                            <button onClick={() => setCommentsModalAnimal(null)} className="p-2 text-gray-400 hover:text-gray-800 bg-white rounded-full shadow-sm hover:shadow transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-white">
                            {(!commentsModalAnimal.comments || commentsModalAnimal.comments.length === 0) ? (
                                <p className="text-center text-gray-500 py-8 italic">Aucun commentaire sur cet animal.</p>
                            ) : (
                                <div className="space-y-4">
                                    {commentsModalAnimal.comments.map(comment => (
                                        <div key={comment.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex gap-4 items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-slate-800 text-sm">{comment.user}</span>
                                                    <span className="text-xs text-gray-400 font-medium">{comment.date}</span>
                                                </div>
                                                <p className="text-gray-600 text-sm line-clamp-3">{comment.text}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteComment(commentsModalAnimal, comment.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 flex items-center gap-2 text-sm font-semibold shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="hidden sm:inline">Supprimer</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ÉDITION ANIMAL */}
            {editingAnimal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCancelEdit} />
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 bg-amber-50 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Edit className="w-6 h-6 text-accent" />
                                Modifier: {getLocalized(editingAnimal.name, i18n.language)}
                            </h3>
                            <button onClick={handleCancelEdit} className="p-2 text-gray-400 hover:text-gray-800 bg-white rounded-full shadow-sm hover:shadow transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto flex-1 bg-white">
                            <form id="editForm" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-5">
                                        <Input label="Nom Commun *" name="name" value={formData.name} onChange={handleChange} required />
                                        <Input label="Espèce *" name="species" value={formData.species} onChange={handleChange} required />
                                        <Input label="Habitat Principale *" name="habitat" value={formData.habitat} onChange={handleChange} required />

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-gray-700">Régime Alimentaire *</label>
                                            <select name="diet" value={formData.diet} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" required>
                                                <option value="herbivore">Herbivore</option>
                                                <option value="carnivore">Carnivore</option>
                                                <option value="omnivore">Omnivore</option>
                                                <option value="frugivore">Frugivore</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Latitude" name="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} />
                                            <Input label="Longitude" name="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Région / Localisation" name="location" type="text" value={formData.location || ""} onChange={handleChange} />
                                            <Input label="Population Estimée" name="estimatedPopulation" type="text" value={formData.estimatedPopulation || ""} onChange={handleChange} />
                                        </div>
                                        <Input label="Vitesse Maximale" name="topSpeed" type="text" value={formData.topSpeed || ""} onChange={handleChange} />
                                    </div>

                                    <div className="space-y-5">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-gray-700">Description</label>
                                            <textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none" />
                                        </div>

                                        <div className="mt-4">
                                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                                                <ImageIcon className="w-4 h-4" /> Gérer les images
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-4 transition-all">

                                                {(existingImageUrls.length > 0 || previewUrls.length > 0) && (
                                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                                        {existingImageUrls.map((url, idx) => (
                                                            <div key={`exist-${idx}`} className="relative group rounded-md overflow-hidden border border-gray-200 aspect-square shadow-sm bg-white">
                                                                <img src={url} alt={`Actuelle ${idx + 1}`} className="w-full h-full object-cover" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveExistingImage(idx)}
                                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity drop-shadow hover:bg-red-600"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {previewUrls.map((url, idx) => (
                                                            <div key={`new-${idx}`} className="relative group rounded-md overflow-hidden border border-green-400 aspect-square shadow-sm bg-white">
                                                                <img src={url} alt={`Nouvelle ${idx + 1}`} className="w-full h-full object-cover p-0.5" />
                                                                <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] uppercase font-bold px-1 rounded shadow-sm">Nouv.</div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveNewFile(idx)}
                                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity drop-shadow hover:bg-red-600"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex flex-col items-center">
                                                    {(existingImageUrls.length === 0 && previewUrls.length === 0) && (
                                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                    )}
                                                    <label className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 mt-1 rounded text-sm cursor-pointer hover:bg-gray-50 transition-colors shadow-sm inline-block">
                                                        Ajouter des images
                                                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="px-8 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <Button type="button" variant="outline" onClick={handleCancelEdit}>Annuler</Button>
                            <Button type="submit" form="editForm" disabled={isSubmitting}>
                                {isSubmitting ? "Sauvegarde..." : "Enregistrer les modifications"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
