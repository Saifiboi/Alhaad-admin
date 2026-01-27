import { createContext } from 'react';

const WindowModeContext = createContext({
    isWindow: false,
    onClose: () => { },
    onNavigate: () => { },
});

export default WindowModeContext;
