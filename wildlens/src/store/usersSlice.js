import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Helper to safely load user from localStorage
const loadUserFromStorage = () => {
    try {
        const storedUser = localStorage.getItem('wildlens_user');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
        console.error("Error parsing user from local storage", e);
        return null;
    }
};

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/users');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Inscription d'un utilisateur
export const registerUserThunk = createAsyncThunk(
    'users/registerUser',
    async (userData, { rejectWithValue }) => {
        try {
            // 1. Vérifier si le username ou l'email existe déjà
            let allUsers = [];
            try {
                const checkResponse = await api.get(`/users`);
                allUsers = checkResponse.data;
            } catch (err) {
                if (err.response?.status !== 404) throw err;
            }

            const usernameTaken = allUsers.some(u => u.username.toLowerCase() === userData.username.toLowerCase());
            const emailTaken = allUsers.some(u => u.email.toLowerCase() === userData.email.toLowerCase());

            if (usernameTaken) {
                return rejectWithValue("Ce nom d'utilisateur est déjà pris.");
            }
            if (emailTaken) {
                return rejectWithValue("Cet email est déjà utilisé par un autre compte.");
            }

            // 2. Créer l'utilisateur (on lui donne par défaut un array favoris vide et le rôle user)
            const newUser = {
                ...userData,
                favorites: [],
                role: userData.email.toLowerCase() === 'admin@wildlens.com' ? 'admin' : 'user'
            };

            const response = await api.post('/users', newUser);
            return response.data; // Retourne l'utilisateur créé
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message || "Erreur réseau");
        }
    }
);

// Connexion d'un utilisateur
export const loginUserThunk = createAsyncThunk(
    'users/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            // 1. Chercher l'utilisateur par username
            let users = [];
            try {
                const response = await api.get(`/users?username=${credentials.username}`);
                users = Array.isArray(response.data) ? response.data : [response.data];
            } catch (err) {
                if (err.response?.status === 404) {
                    return rejectWithValue("Ce nom d'utilisateur n'existe pas.");
                }
                throw err;
            }

            const user = users.find(u => u.username === credentials.username);

            if (!user) {
                return rejectWithValue("Ce nom d'utilisateur n'existe pas.");
            }

            // 2. Vérifier le mot de passe
            if (user.password !== credentials.password) {
                return rejectWithValue("Mot de passe incorrect.");
            }

            return user; // Retourne l'utilisateur connecté
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message || "Erreur réseau");
        }
    }
);

const initialState = {
    users: [],
    currentUser: loadUserFromStorage(), // Load session on reload
    status: 'idle',
    error: null,
};

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        logoutUser: (state) => {
            state.currentUser = null;
            // Clear session 
            localStorage.removeItem('wildlens_user');
        },
        toggleFavorite: (state, action) => {
            if (!state.currentUser) return;
            const animalId = action.payload;
            const index = state.currentUser.favorites.indexOf(animalId);

            if (index === -1) {
                state.currentUser.favorites.push(animalId); // Ajoute
            } else {
                state.currentUser.favorites.splice(index, 1); // Retire
            }
            // Update persisted session to save favorites
            localStorage.setItem('wildlens_user', JSON.stringify(state.currentUser));
        }
    },
    extraReducers(builder) {
        builder
            // ================= FETCH USERS =================
            .addCase(fetchUsers.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // ================= REGISTER =================
            .addCase(registerUserThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(registerUserThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentUser = action.payload;
                localStorage.setItem('wildlens_user', JSON.stringify(action.payload));
            })
            .addCase(registerUserThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // ================= LOGIN =================
            .addCase(loginUserThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginUserThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentUser = action.payload;
                localStorage.setItem('wildlens_user', JSON.stringify(action.payload));
            })
            .addCase(loginUserThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { logoutUser, toggleFavorite } = usersSlice.actions;
export default usersSlice.reducer;

