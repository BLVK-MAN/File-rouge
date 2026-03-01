import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Fetch all animals
export const fetchAnimals = createAsyncThunk(
    'animals/fetchAnimals',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/animals');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Add a new animal
export const addAnimal = createAsyncThunk(
    'animals/addAnimal',
    async (newAnimal, { rejectWithValue }) => {
        try {
            const response = await api.post('/animals', newAnimal);
            return response.data; // Retourne l'animal créé par l'API avec son ID
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update an animal (e.g., adding comments or editing details)
export const updateAnimal = createAsyncThunk(
    'animals/updateAnimal',
    async (updatedAnimal, { rejectWithValue }) => {
        try {
            const response = await api.put(`/animals/${updatedAnimal.id}`, updatedAnimal);
            return response.data; // Return the updated animal
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Delete an animal
export const deleteAnimal = createAsyncThunk(
    'animals/deleteAnimal',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/animals/${id}`);
            return id; // Return the deleted ID
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    animals: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const animalsSlice = createSlice({
    name: 'animals',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Animals
            .addCase(fetchAnimals.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAnimals.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.animals = action.payload;
            })
            .addCase(fetchAnimals.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Add Animal
            .addCase(addAnimal.fulfilled, (state, action) => {
                state.animals.push(action.payload); // Ajoute le nouvel animal au store
            })
            // Update Animal
            .addCase(updateAnimal.fulfilled, (state, action) => {
                const index = state.animals.findIndex(a => a.id === action.payload.id);
                if (index !== -1) {
                    state.animals[index] = action.payload; // Update the animal in the store
                }
            })
            // Delete Animal
            .addCase(deleteAnimal.fulfilled, (state, action) => {
                state.animals = state.animals.filter(a => a.id !== action.payload); // Remove the animal from the store
            });
    },
});

export default animalsSlice.reducer;
