import { createContext } from 'react';

const WindowModeContext = createContext({
    isWindow: false,
    onClose: () => { },
});

export default WindowModeContext;
