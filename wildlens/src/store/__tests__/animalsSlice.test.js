import animalsReducer, { fetchAnimals } from '../animalsSlice';

describe('animalsSlice', () => {
    const initialState = {
        animals: [],
        status: 'idle',
        error: null,
    };

    it('should return initial state on first run', () => {
        // action type is intentionaly arbitrary to trigger default case
        const nextState = animalsReducer(undefined, { type: 'unknown' });
        expect(nextState).toEqual(initialState);
    });

    it('should change status to loading when fetchAnimals is pending', () => {
        const action = { type: fetchAnimals.pending.type };
        const state = animalsReducer(initialState, action);

        expect(state.status).toEqual('loading');
    });

    it('should set status to succeeded and populate animals when fetchAnimals is fulfilled', () => {
        const mockData = [
            { id: "1", name: "Lion" },
            { id: "2", name: "Tiger" }
        ];

        const action = {
            type: fetchAnimals.fulfilled.type,
            payload: mockData
        };

        const state = animalsReducer(initialState, action);

        expect(state.status).toEqual('succeeded');
        expect(state.animals).toEqual(mockData);
    });

    it('should set status to failed and store error when fetchAnimals is rejected', () => {
        const action = {
            type: fetchAnimals.rejected.type,
            payload: "Failed to fetch data"
        };

        const state = animalsReducer(initialState, action);

        expect(state.status).toEqual('failed');
        expect(state.error).toEqual("Failed to fetch data");
        expect(state.animals).toEqual([]);
    });
});
