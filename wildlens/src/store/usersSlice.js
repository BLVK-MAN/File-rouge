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

// Fetch users (pour un vrai projet, on ne chargerait pas tous les users)
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
        // Simulation simple de Login (création auto ou login s'il existe)
        loginUser: (state, action) => {
            // Pour éviter de complexifier avec MockAPI POST, on simule un user complet
            const { email, username } = action.payload;
            state.currentUser = {
                id: Math.random().toString(36).substr(2, 9),
                email,
                username: username || email.split('@')[0],
                favorites: [], // Tableau d'IDs d'animaux
                role: email.toLowerCase() === 'admin@wildlens.com' ? 'admin' : 'user',
            };
            // Persist session
            localStorage.setItem('wildlens_user', JSON.stringify(state.currentUser));
        },
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
            .addCase(fetchUsers.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { loginUser, logoutUser, toggleFavorite } = usersSlice.actions;
export default usersSlice.reducer;

