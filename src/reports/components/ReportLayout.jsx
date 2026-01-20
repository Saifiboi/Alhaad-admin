import React, { useState } from 'react';
import {
    Drawer, Toolbar, IconButton, useMediaQuery, useTheme,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from '../../common/components/LocalizationProvider';
import GlobalNavbar from '../../common/components/GlobalNavbar';
import MenuIcon from '@mui/icons-material/Menu';
import ReportsMenu from '../components/ReportsMenu';

const useStyles = makeStyles()((theme) => ({
    root: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default,
    },
    content: {
        flexGrow: 1,
        display: 'flex',
        overflow: 'hidden',
        paddingTop: '64px',
        [theme.breakpoints.down('md')]: {
            paddingTop: 0,
            flexDirection: 'column',
        },
    },
    drawer: {
        width: theme.dimensions.drawerWidthDesktop,
        flexShrink: 0,
        [theme.breakpoints.down('md')]: {
            width: '100%',
        },
    },
    drawerPaper: {
        width: theme.dimensions.drawerWidthDesktop,
        top: '64px',
        height: 'calc(100% - 64px)',
        [theme.breakpoints.down('md')]: {
            width: theme.dimensions.drawerWidthTablet,
            top: 0,
            height: '100%',
        },
    },
    main: {
        flexGrow: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
}));

const ReportLayout = ({ children }) => {
    const { classes } = useStyles();
    const theme = useTheme();
    const desktop = useMediaQuery(theme.breakpoints.up('md'));
    const t = useTranslation();

    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className={classes.root}>
            <GlobalNavbar />
            <div className={classes.content}>
                {desktop ? (
                    <Drawer
                        className={classes.drawer}
                        variant="permanent"
                        classes={{ paper: classes.drawerPaper }}
                    >
                        <ReportsMenu />
                    </Drawer>
                ) : (
                    <Drawer
                        variant="temporary"
                        open={menuOpen}
                        onClose={() => setMenuOpen(false)}
                        classes={{ paper: classes.drawerPaper }}
                    >
                        <ReportsMenu />
                    </Drawer>
                )}

                <div className={classes.main}>
                    {!desktop && (
                        <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={() => setMenuOpen(true)}>
                                <MenuIcon />
                            </IconButton>
                            {t('reportTitle')}
                        </Toolbar>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ReportLayout;
