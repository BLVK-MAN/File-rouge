import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAnimals } from '../store/animalsSlice';
import AnimalCard from '../components/AnimalCard';
import { User, LogOut, Heart } from 'lucide-react';
import { logoutUser } from '../store/usersSlice';
import Button from '../components/ui/Button';

const Profile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const currentUser = useSelector((state) => state.users.currentUser);
    const { animals, status } = useSelector((state) => state.animals);

    // Redirection si non connecté
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    // S'assurer qu'on a les animaux pour afficher les favoris
    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchAnimals());
        }
    }, [status, dispatch]);

    if (!currentUser) return null; // Ne rien rendre pendant la redirection

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/');
    };

    // Filtrer les animaux favoris
    const favoriteAnimals = animals.filter(animal =>
        currentUser.favorites.includes(animal.id)
    );

    return (
        <div className="min-h-screen bg-background py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Profil */}
                <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 flex items-center justify-between mb-12 flex-wrap gap-4">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                            <User className="w-12 h-12 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{currentUser.username}</h1>
                            <p className="text-gray-500">{currentUser.email}</p>
                        </div>
                    </div>

                    <Button variant="outline" className="border-red-400 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={handleLogout}>
                        <LogOut className="w-4 h-4" /> Déconnexion
                    </Button>
                </div>

                {/* Section Favoris */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Heart className="w-6 h-6 text-accent fill-accent" /> Mes Animaux Favoris
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full ml-2">
                            {favoriteAnimals.length}
                        </span>
                    </h2>

                    {favoriteAnimals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favoriteAnimals.map((animal, index) => (
                                <AnimalCard key={animal.id} animal={animal} index={index} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-700 mb-2">Aucun favori pour le moment</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                Explorez notre catalogue 3D ou utilisez le scanner pour découvrir des animaux incroyables et les ajouter à votre collection.
                            </p>
                            <Button onClick={() => navigate('/catalog')} className="mx-auto">
                                Explorer le Catalogue
                            </Button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Profile;
