import { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Avatar, Menu, MenuItem, ListItemIcon, ListItemText, IconButton, Badge } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import GridViewIcon from '@mui/icons-material/GridView';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import ThemeToggle from './ThemeToggle';
import { sessionActions } from '../../store';
import { nativePostMessage } from './NativeInterface';

const useStyles = makeStyles()((theme) => ({
    appBar: {
        backgroundColor: theme.palette.glass.background,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.palette.glass.border}`,
        boxShadow: theme.palette.mode === 'dark'
            ? '0 2px 12px rgba(0, 0, 0, 0.3)'
            : '0 2px 12px rgba(0, 0, 0, 0.08)',
        zIndex: theme.zIndex.drawer + 1,
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '64px',
        padding: theme.spacing(0, 3),
    },
    logoSection: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(2),
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'scale(1.02)',
        },
    },
    logoImage: {
        width: 40,
        height: 40,
        borderRadius: '10px',
        objectFit: 'cover',
        boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 12px rgba(248, 115, 24, 0.3)'
            : '0 4px 12px rgba(248, 115, 24, 0.2)',
        cursor: 'pointer',
    },
    appName: {
        fontWeight: 600,
        fontSize: '20px',
        background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgb(248, 115, 24) 0%, rgb(255, 160, 80) 100%)'
            : 'linear-gradient(135deg, rgb(248, 115, 24) 0%, rgb(255, 100, 0) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        cursor: 'pointer',
        userSelect: 'none',
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(2),
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1.5),
        padding: theme.spacing(0.5, 1.5),
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(248, 115, 24, 0.1)'
                : 'rgba(248, 115, 24, 0.05)',
        },
    },
    userEmail: {
        fontSize: '14px',
        fontWeight: 500,
        color: theme.palette.text.primary,
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    avatar: {
        width: 36,
        height: 36,
        backgroundColor: theme.palette.primary.main,
        color: '#ffffff !important',
        fontSize: '14px',
        fontWeight: 600,
        boxShadow: theme.palette.mode === 'dark'
            ? '0 2px 8px rgba(248, 115, 24, 0.3)'
            : '0 2px 8px rgba(248, 115, 24, 0.2)',
    },
}));

const GlobalNavbar = ({
    onAccount, onDashboard, onEvents, showSidebarToggle, onSidebarToggle,
}) => {
    const { classes } = useStyles();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.session.user);
    const eventsCount = useSelector((state) => state.events.items.length);

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const getInitials = (name, email) => {
        if (name) {
            const names = name.split(' ');
            if (names.length >= 2) {
                return `${names[0][0]}${names[1][0]}`.toUpperCase();
            }
            return name.substring(0, 2).toUpperCase();
        }
        if (email) {
            return email.substring(0, 2).toUpperCase();
        }
        return 'U';
    };

    const handleUserClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAccount = () => {
        handleClose();
        if (onAccount) {
            onAccount();
        } else {
            navigate(`/settings/user/${user.id}`);
        }
    };

    const handleLogout = async () => {
        handleClose();

        const notificationToken = window.localStorage.getItem('notificationToken');
        if (notificationToken && !user.readonly) {
            window.localStorage.removeItem('notificationToken');
            const tokens = user.attributes.notificationTokens?.split(',') || [];
            if (tokens.includes(notificationToken)) {
                const updatedUser = {
                    ...user,
                    attributes: {
                        ...user.attributes,
                        notificationTokens: tokens.length > 1 ? tokens.filter((it) => it !== notificationToken).join(',') : undefined,
                    },
                };
                await fetch(`/api/users/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedUser),
                });
            }
        }

        await fetch('/api/session', { method: 'DELETE' });
        nativePostMessage('logout');
        navigate('/login');
        dispatch(sessionActions.updateUser(null));
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <AppBar position="fixed" className={classes.appBar} elevation={0}>
            <Toolbar className={classes.toolbar}>
                <Box className={classes.logoSection} onClick={handleLogoClick}>
                    <img src="/traccar-logo.jpeg" alt="Traccar Logo" className={classes.logoImage} />
                    <Typography variant="h6" className={classes.appName}>
                        AL-HAAD
                    </Typography>
                </Box>

                <Box className={classes.userSection}>
                    {onDashboard && (
                        <Box
                            className={classes.userInfo}
                            onClick={onDashboard}
                            sx={{ mr: 1 }}
                        >
                            <GridViewIcon sx={{ color: theme => theme.palette.primary.main, mr: 1, fontSize: '20px' }} />
                            <Typography className={classes.userEmail} sx={{ color: theme => theme.palette.primary.main }}>
                                Dashboard
                            </Typography>
                        </Box>
                    )}
                    {showSidebarToggle && (
                        <IconButton
                            color="inherit"
                            onClick={onSidebarToggle}
                            sx={{
                                mr: 1,
                                backgroundColor: theme => theme.palette.mode === 'dark'
                                    ? 'rgba(248, 115, 24, 0.1)'
                                    : 'rgba(248, 115, 24, 0.05)',
                                '&:hover': {
                                    backgroundColor: theme => theme.palette.mode === 'dark'
                                        ? 'rgba(248, 115, 24, 0.2)'
                                        : 'rgba(248, 115, 24, 0.1)',
                                },
                            }}
                        >
                            <ViewSidebarIcon sx={{ color: theme => theme.palette.primary.main }} />
                        </IconButton>
                    )}
                    <ThemeToggle />
                    <IconButton
                        color="inherit"
                        onClick={onEvents}
                        sx={{
                            backgroundColor: theme => theme.palette.mode === 'dark'
                                ? 'rgba(248, 115, 24, 0.1)'
                                : 'rgba(248, 115, 24, 0.05)',
                            '&:hover': {
                                backgroundColor: theme => theme.palette.mode === 'dark'
                                    ? 'rgba(248, 115, 24, 0.2)'
                                    : 'rgba(248, 115, 24, 0.1)',
                            },
                            padding: '10px'
                        }}
                    >
                        <Badge badgeContent={eventsCount} color="error">
                            <NotificationsIcon sx={{ color: theme => theme.palette.primary.main, fontSize: '24px' }} />
                        </Badge>
                    </IconButton>
                    <Box className={classes.userInfo} onClick={handleUserClick}>
                        <Typography className={classes.userEmail}>
                            {user?.email || 'User'}
                        </Typography>
                        <Avatar className={classes.avatar}>
                            {getInitials(user?.name, user?.email)}
                        </Avatar>
                    </Box>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        PaperProps={{
                            sx: {
                                mt: 1,
                                minWidth: 180,
                            },
                        }}
                    >
                        <MenuItem onClick={handleAccount}>
                            <ListItemIcon>
                                <PersonIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Account</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText>
                                <Typography color="error">Logout</Typography>
                            </ListItemText>
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default GlobalNavbar;
