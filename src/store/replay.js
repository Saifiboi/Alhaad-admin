import { createSlice } from '@reduxjs/toolkit';

const { reducer, actions } = createSlice({
    name: 'replay',
    initialState: {
        positions: [],
        index: 0,
        playing: false,
    },
    reducers: {
        setPositions(state, action) {
            state.positions = action.payload;
            state.index = 0;
            state.playing = false;
        },
        setIndex(state, action) {
            state.index = action.payload;
        },
        setPlaying(state, action) {
            state.playing = action.payload;
        },
        clear(state) {
            state.positions = [];
            state.index = 0;
            state.playing = false;
        },
    },
});

export { actions as replayActions };
export default reducer;
