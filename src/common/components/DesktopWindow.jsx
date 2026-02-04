

import { Rnd } from 'react-rnd';
import {
    Paper, IconButton, Typography, Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import FilterNoneIcon from '@mui/icons-material/FilterNone';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
    window: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper, // Use paper for opacity
        backdropFilter: 'blur(20px)', // Glassmorphism
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[10],
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing(0.25, 0.75),
        backgroundColor: theme.palette.action.selected, // Slightly darker header
        cursor: 'move',
        userSelect: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    title: {
        flexGrow: 1,
        marginLeft: theme.spacing(1),
        fontWeight: 400,
        fontSize: '0.85rem',
    },
    content: {
        flexGrow: 1,
        overflow: 'hidden', // Let children handle scrolling if needed
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
    },
    controls: {
        display: 'flex',
        gap: theme.spacing(0.5),
    },
    controlButton: {
        padding: 2,
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    }
}));

const DesktopWindow = ({
    id,
    title,
    icon,
    children,
    onClose,
    onMinimize,
    onFocus,
    zIndex,
    defaultWidth = 600,
    defaultHeight = 450,
    x,
    y,
    minimized,
    maximized,
    onMaximize,
    onDragStop,
    onResizeStop,
}) => {
    const { classes } = useStyles();

    return (
        <Rnd
            key={`${id}-${x}-${y}-${minimized}`}
            size={maximized ? { width: '100%', height: '91%' } : { width: defaultWidth, height: defaultHeight }}
            position={maximized ? { x: 0, y: 0 } : { x: x || 50, y: y || 50 }}
            minWidth={300}
            minHeight={200}
            bounds={maximized ? undefined : "parent"}
            maxWidth="100%"
            maxHeight="91%"
            disableDragging={maximized}
            enableResizing={!maximized}
            dragHandleClassName="window-header"
            style={{
                zIndex,
                display: minimized ? 'none' : undefined,
                ...(maximized && {
                    position: 'fixed',
                    top: '64px',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    height: 'calc(100vh - 64px)',
                })
            }}
            onMouseDown={() => onFocus(id)}
            onTouchStart={() => onFocus(id)}
            onDragStop={(e, d) => {
                const navbarHeight = 64;
                const constrainedY = Math.max(navbarHeight, d.y);
                onDragStop(id, d.x, constrainedY);
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                const navbarHeight = 64;
                const constrainedY = Math.max(navbarHeight, position.y);
                onResizeStop(id, ref.offsetWidth, ref.offsetHeight, position.x, constrainedY);
            }}
        >
            <Paper className={classes.window} elevation={0} sx={{ height: '100%' }}>
                <div className={`window-header ${classes.header}`} onDoubleClick={() => onMinimize(id)}>
                    <Box display="flex" alignItems="center">
                        {icon && <Box mr={1} display="flex">{icon}</Box>}
                        <Typography className={classes.title} variant="subtitle2" noWrap>
                            {title}
                        </Typography>
                    </Box>
                    <div className={classes.controls}>
                        <IconButton
                            size="small"
                            className={classes.controlButton}
                            onClick={(e) => { e.stopPropagation(); onMinimize(id); }}
                        >
                            <RemoveIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            className={classes.controlButton}
                            onClick={(e) => { e.stopPropagation(); onMaximize(id); }}
                        >
                            {maximized ? <FilterNoneIcon fontSize="small" sx={{ transform: 'scale(0.8)' }} /> : <CropSquareIcon fontSize="small" />}
                        </IconButton>
                        <IconButton
                            size="small"
                            className={classes.controlButton}
                            onClick={(e) => { e.stopPropagation(); onClose(id); }}
                        >
                            <CloseIcon fontSize="small" color="error" />
                        </IconButton>
                    </div>
                </div>
                <div className={classes.content}>
                    {children}
                </div>
            </Paper>
        </Rnd>
    );
};

export default DesktopWindow;
