
import React, { useState } from 'react';
import {
    Paper, Tooltip, IconButton, Zoom, Box, Typography, Menu, MenuItem,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';

const useStyles = makeStyles()((theme) => ({
    dockContainer: {
        position: 'fixed',
        bottom: theme.spacing(2),
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1300, // Above almost everything
        display: 'flex',
        justifyContent: 'center',
        padding: theme.spacing(1, 2),
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Very transparent
        backdropFilter: 'blur(15px)',
        borderRadius: '24px',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            transform: 'translateX(-50%) scale(1.02)',
        },
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    },
    dockItem: {
        margin: theme.spacing(0, 1),
        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '&:hover': {
            transform: 'translateY(-10px) scale(1.2)',
        },
    },
    iconButton: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(1.5),
        boxShadow: theme.shadows[4],
        '&:hover': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
        },
    },
    activeIndicator: {
        width: 4,
        height: 4,
        borderRadius: '50%',
        backgroundColor: theme.palette.text.primary,
        marginTop: 4,
    },
    label: {
        position: 'absolute',
        top: -30,
        backgroundColor: theme.palette.background.paper,
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: '0.75rem',
        boxShadow: theme.shadows[2],
        opacity: 0,
        transition: 'opacity 0.2s',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        '.dockItem:hover &': {
            opacity: 1,
        },
    }
}));

const DockItem = ({ item, onClick, isActive, activeIds }) => {
    const { classes } = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        if (item.options) {
            const openRelatedIds = item.relatedIds?.filter(id => activeIds.includes(id)) || [];
            if (openRelatedIds.length === 1) {
                onClick({ id: openRelatedIds[0] });
            } else {
                setAnchorEl(event.currentTarget);
            }
        } else {
            onClick(item);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOptionClick = (option) => {
        onClick({ ...item, ...option, id: option.id || item.id });
        handleClose();
    };

    return (
        <div className={`dockItem ${classes.dockItem}`}>
            <Box position="relative" display="flex" justifyContent="center">
                <Typography className={classes.label}>{item.title}</Typography>
            </Box>
            <Tooltip title="" placement="top">
                <IconButton
                    onClick={handleClick}
                    className={classes.iconButton}
                    color={isActive ? "primary" : "default"}
                >
                    {item.icon}
                </IconButton>
            </Tooltip>
            {isActive && <div className={classes.activeIndicator} />}
            {item.options && (
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    slotProps={{
                        paper: {
                            sx: {
                                mt: -1, // Adjust as needed to position above dock
                                borderRadius: '12px',
                                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                            }
                        }
                    }}
                >
                    {item.options.map((option) => (
                        <MenuItem key={option.title} onClick={() => handleOptionClick(option)}>
                            <Typography variant="body2">{option.title}</Typography>
                        </MenuItem>
                    ))}
                </Menu>
            )}
        </div>
    );
};

const Dock = ({ items, onLaunch, activeIds }) => {
    const { classes } = useStyles();

    return (
        <Box className={classes.dockContainer}>
            {items.filter(item => !item.hideInDock).map((item) => (
                <DockItem
                    key={item.id}
                    item={item}
                    onClick={onLaunch}
                    activeIds={activeIds}
                    isActive={activeIds.includes(item.id) || (item.relatedIds && item.relatedIds.some(id => activeIds.includes(id)))}
                />
            ))}
        </Box>
    );
};

export default Dock;
