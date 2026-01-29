import { createSlice } from '@reduxjs/toolkit';

const loadState = () => {
    try {
        const serialized = localStorage.getItem('desktopWindows');
        return serialized ? JSON.parse(serialized) : { items: {}, activeId: null };
    } catch (e) {
        return { items: {}, activeId: null };
    }
};

const saveState = (state) => {
    try {
        localStorage.setItem('desktopWindows', JSON.stringify(state));
    } catch (e) { }
};

const initialState = loadState();

const { actions, reducer } = createSlice({
    name: 'windows',
    initialState,
    reducers: {
        update(state, action) {
            state.items = action.payload;
            saveState(state);
        },
        minimizeAll(state) {
            Object.keys(state.items).forEach((id) => {
                state.items[id].minimized = true;
            });
            saveState(state);
        },
        setActive(state, action) {
            state.activeId = action.payload;
            saveState(state);
        },
        launch(state, action) {
            const app = action.payload;
            const maxZ = Math.max(10, ...Object.values(state.items).map((w) => w.zIndex || 0));
            if (!state.items[app.id]) {
                state.items[app.id] = { ...app, minimized: false, maximized: false, zIndex: maxZ + 1 };
            } else {
                state.items[app.id].minimized = false;
                state.items[app.id].zIndex = maxZ + 1;
            }
            state.activeId = app.id;
            saveState(state);
        },
        close(state, action) {
            delete state.items[action.payload];
            if (state.activeId === action.payload) {
                state.activeId = null;
            }
            saveState(state);
        },
        minimize(state, action) {
            if (state.items[action.payload]) {
                state.items[action.payload].minimized = !state.items[action.payload].minimized;
            }
            saveState(state);
        },
        maximize(state, action) {
            if (state.items[action.payload]) {
                state.items[action.payload].maximized = !state.items[action.payload].maximized;
            }
            saveState(state);
        },
        setPosition(state, action) {
            const { id, x, y } = action.payload;
            if (state.items[id]) {
                state.items[id].x = x;
                state.items[id].y = y;
            }
            saveState(state);
        },
        setSize(state, action) {
            const { id, width, height, x, y } = action.payload;
            if (state.items[id]) {
                state.items[id].width = width;
                state.items[id].height = height;
                state.items[id].x = x;
                state.items[id].y = y;
            }
            saveState(state);
        },
        focus(state, action) {
            state.activeId = action.payload;
            const maxZ = Math.max(10, ...Object.values(state.items).map((w) => w.zIndex || 0));
            if (state.items[action.payload]) {
                state.items[action.payload].zIndex = maxZ + 1;
            }
            saveState(state);
        }
    },
});

export { actions as windowsActions };
export { reducer as windowsReducer };
