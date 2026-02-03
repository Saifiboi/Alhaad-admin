import { IconButton, Tooltip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { sessionActions } from '../../store';

const ThemeToggle = () => {
    const dispatch = useDispatch();
    const server = useSelector((state) => state.session.server);
    const darkMode = server?.attributes?.darkMode;

    const handleToggle = async () => {
        const newDarkMode = !darkMode;

        // Update server attributes with new theme preference
        const updatedServer = {
            ...server,
            attributes: {
                ...server.attributes,
                darkMode: newDarkMode,
            },
        };

        localStorage.setItem('traccar-theme', newDarkMode ? 'dark' : 'light');

        try {
            // Persist to backend
            const response = await fetch('/api/server', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedServer),
            });

            if (response.ok) {
                const data = await response.json();
                dispatch(sessionActions.updateServer(data));
            }
        } catch (error) {
            console.error('Failed to update theme preference:', error);
        }
    };

    return (
        <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton
                onClick={handleToggle}
                sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'rotate(180deg)',
                    },
                }}
            >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
        </Tooltip>
    );
};

export default ThemeToggle;
