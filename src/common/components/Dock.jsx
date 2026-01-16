
import React, { useState } from 'react';
import {
    Paper, Tooltip, IconButton, Zoom, Box, Typography,
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

const DockItem = ({ item, onClick, isActive }) => {
    const { classes } = useStyles();

    return (
        <div className={`dockItem ${classes.dockItem}`}>
            <Box position="relative" display="flex" justifyContent="center">
                <Typography className={classes.label}>{item.title}</Typography>
            </Box>
            <Tooltip title="" placement="top">
                <IconButton
                    onClick={() => onClick(item)}
                    className={classes.iconButton}
                    color={isActive ? "primary" : "default"}
                >
                    {item.icon}
                </IconButton>
            </Tooltip>
            {isActive && <div className={classes.activeIndicator} />}
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
                    isActive={activeIds.includes(item.id) || (item.relatedIds && item.relatedIds.some(id => activeIds.includes(id)))}
                />
            ))}
        </Box>
    );
};

export default Dock;
