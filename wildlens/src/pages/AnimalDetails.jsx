import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { MapPin, Info, ArrowLeft, Utensils, Heart, MessageSquare, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { toggleFavorite } from '../store/usersSlice';
import { updateAnimal, fetchAnimals } from '../store/animalsSlice';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getLocalized } from '../utils/langHelper';

const AnimalDetails = () => {
    const { t, i18n } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const contentRef = useRef(null);

    const [commentText, setCommentText] = useState('');
    const [currentImageIdx, setCurrentImageIdx] = useState(0);

    const animal = useSelector((state) => state.animals.animals.find((a) => String(a.id) === String(id)));
    const { status } = useSelector((state) => state.animals);
    const currentUser = useSelector((state) => state.users.currentUser);


    const isFavorite = currentUser?.favorites?.includes(id);

    const commentsList = animal?.comments || [];

    useEffect(() => {
        window.scrollTo(0, 0);

        if (status === 'idle' || status === 'failed') {
            dispatch(fetchAnimals());
        }

        const ctx = gsap.context(() => {
            gsap.fromTo(containerRef.current,
                { opacity: 0, backgroundColor: "#000" },
                { opacity: 1, backgroundColor: "#FAF9F6", duration: 1.5, ease: "power2.out" }
            );

            gsap.from(imageRef.current, { scale: 1.2, opacity: 0, duration: 1.5, delay: 0.2, ease: "power3.out" });

            gsap.from(".stagger-reveal", {
                y: 50, opacity: 0, duration: 0.8, stagger: 0.15, delay: 0.5, ease: "back.out(1.7)"
            });
        }, containerRef);

        return () => ctx.revert();
    }, [id, dispatch, status]);

    const handleFavoriteClick = () => {
        if (!currentUser) {
            toast.error(t('animal.btn_login_fav'));
            navigate('/login');
            return;
        }
        dispatch(toggleFavorite(id));
        if (isFavorite) {
            toast.success(t('animal.btn_remove_fav'));
        } else {
            toast.success(t('animal.btn_add_fav'));
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        if (!commentText.trim()) return;

        const newComment = {
            id: Date.now(),
            user: currentUser.username,
            text: commentText,
            date: new Date().toLocaleDateString('fr-FR')
        };

        const updatedAnimal = {
            ...animal,
            comments: [newComment, ...commentsList]
        };

        try {
            await dispatch(updateAnimal(updatedAnimal)).unwrap();
            setCommentText('');
            toast.success('Commentaire publié !');
        } catch {
            toast.error('Erreur lors de la publication du commentaire.');
        }
    };

    if (!animal) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
                <h2 className="text-2xl font-bold text-accent mb-4">{t('animal.not_found')}</h2>
                <Button onClick={() => navigate('/catalog')}>{t('animal.btn_return_catalog')}</Button>
            </div>
        );
    }

    const images = Array.isArray(animal.image_urls) && animal.image_urls.length > 0
        ? animal.image_urls
        : (animal.image_url ? [animal.image_url] : []);

    return (
        <div ref={containerRef} className="min-h-screen bg-background pb-20 pt-16 lg:pt-20">
            <div className="absolute top-24 left-6 z-50">
                <button
                    onClick={() => navigate('/catalog')}
                    className="bg-white/80 backdrop-blur-md shadow-lg p-3 rounded-full text-primary hover:bg-primary hover:text-white transition-all transform hover:scale-110"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            <div className="w-full max-w-7xl aspect-[4/3] md:aspect-video relative overflow-hidden shadow-2xl rounded-3xl mx-auto bg-slate-950 mt-4 md:mt-8 px-4 sm:px-0">
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 z-20 pointer-events-none" />

                {images.map((img, idx) => (
                    <img
                        key={idx}
                        src={img}
                        alt={`${getLocalized(animal.name, i18n.language)} - Vue ${idx + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentImageIdx ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}
                    />
                ))}


                {images.length > 1 && (
                    <>
                        <div className="absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-10 opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <button onClick={() => setCurrentImageIdx(prev => prev === 0 ? images.length - 1 : prev - 1)} className="bg-black/40 backdrop-blur text-white p-3 rounded-full hover:bg-black/70 transition-colors">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button onClick={() => setCurrentImageIdx(prev => prev === images.length - 1 ? 0 : prev + 1)} className="bg-black/40 backdrop-blur text-white p-3 rounded-full hover:bg-black/70 transition-colors">
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>


                        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIdx(idx)}
                                    className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentImageIdx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
                                    aria-label={`Aller à l'image ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
                <div className="absolute bottom-16 left-0 w-full px-6 lg:px-20 z-20 flex justify-between items-end pointer-events-none">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] stagger-reveal">
                            {getLocalized(animal.name, i18n.language)}
                        </h1>
                        <p className="text-secondary text-xl md:text-2xl font-light italic drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] stagger-reveal">
                            {getLocalized(animal.species, i18n.language) || getLocalized(animal.scientificName, i18n.language) || t('animal.unknown_species')}
                        </p>
                    </div>
                </div>
            </div>

            <div ref={contentRef} className="max-w-7xl mx-auto px-6 lg:px-20 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">

                <div className="lg:col-span-1 space-y-8 stagger-reveal">
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2">
                            <Info className="w-5 h-5 text-primary" /> {t('animal.tech_sheet')}
                        </h3>
                        <ul className="space-y-6">
                            <li>
                                <div className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-secondary" /> {t('animal.habitat_loc')}
                                </div>
                                <div className="text-lg text-gray-800 font-medium">{getLocalized(animal.habitat, i18n.language) || t('animal.not_specified')}</div>
                                {getLocalized(animal.location, i18n.language) && <div className="text-sm text-gray-500 mt-1">{getLocalized(animal.location, i18n.language)}</div>}
                            </li>
                            <li>
                                <div className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-2">
                                    <Utensils className="w-4 h-4 text-accent" /> {t('animal.diet')}
                                </div>
                                <div className="text-lg text-gray-800 font-medium capitalize">{getLocalized(animal.diet, i18n.language) || t('animal.not_specified')}</div>
                            </li>
                            {animal.estimatedPopulation && (
                                <li>
                                    <div className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-2">
                                        {t('animal.est_population')}
                                    </div>
                                    <div className="text-base text-gray-800 font-medium">{getLocalized(animal.estimatedPopulation, i18n.language)}</div>
                                </li>
                            )}
                            {animal.topSpeed && (
                                <li>
                                    <div className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-2">
                                        {t('animal.top_speed')}
                                    </div>
                                    <div className="text-base text-gray-800 font-medium">{getLocalized(animal.topSpeed, i18n.language)}</div>
                                </li>
                            )}
                            {getLocalized(animal.characteristics, i18n.language) && getLocalized(animal.characteristics, i18n.language).length > 0 && (
                                <li>
                                    <div className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                                        {t('animal.key_chars')}
                                    </div>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        {getLocalized(animal.characteristics, i18n.language).map((char, index) => (
                                            <li key={index}>{char}</li>
                                        ))}
                                    </ul>
                                </li>
                            )}
                        </ul>
                    </div>

                    <Button
                        onClick={handleFavoriteClick}
                        variant={isFavorite ? "primary" : "outline"}
                        className={`w-full justify-center shadow-lg py-4 text-lg stagger-reveal gap-3 transition-all ${isFavorite ? "bg-accent hover:bg-red-700 border-none text-white focus:ring-accent" : ""}`}
                    >
                        <Heart className={`w-6 h-6 ${isFavorite ? "fill-white text-white" : ""}`} />
                        {isFavorite ? t('animal.btn_remove_fav_ui') : t('animal.btn_add_fav_ui')}
                    </Button>
                </div>

                <div className="lg:col-span-2 space-y-12">
                    <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden stagger-reveal">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0" />
                        <h2 className="text-3xl font-bold text-primary mb-6 relative z-10">{t('animal.about_animal')}</h2>
                        <div className="prose prose-lg text-gray-600 leading-relaxed font-light relative z-10">
                            <p>{getLocalized(animal.description, i18n.language) || t('animal.no_desc')}</p>
                            {!getLocalized(animal.description, i18n.language) || getLocalized(animal.description, i18n.language).length < 150 ? (
                                <p className="mt-4 text-sm text-gray-400 italic">
                                    {t('animal.note_updating')}
                                </p>
                            ) : null}
                        </div>
                    </div>


                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 stagger-reveal">
                        <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2 border-b pb-4">
                            <MessageSquare className="w-6 h-6 text-secondary" />
                            {t('animal.comments_title')} ({commentsList.length})
                        </h3>


                        <form onSubmit={handlePostComment} className="mb-10 flex gap-4 items-end bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="flex-grow">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {currentUser ? `${t('animal.comment_as')} ${currentUser.username}` : t('animal.login_to_comment')}
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    rows="3"
                                    placeholder={currentUser ? t('animal.comment_placeholder') : t('animal.comment_placeholder_anon')}
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    disabled={!currentUser}
                                />
                            </div>
                            <Button type="submit" disabled={!currentUser || !commentText.trim()} className="mb-1 px-6 py-3">
                                <Send className="w-5 h-5" />
                            </Button>
                        </form>


                        <div className="space-y-6">
                            {commentsList.length === 0 ? (
                                <p className="text-center text-gray-500 py-8 italic">{t('animal.first_to_share')}</p>
                            ) : (
                                commentsList.map((comment) => (
                                    <div key={comment.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                                                    {comment.user.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-gray-800">{comment.user}</span>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">{comment.date}</span>
                                        </div>
                                        <p className="text-gray-600 pl-14">{comment.text}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AnimalDetails;
