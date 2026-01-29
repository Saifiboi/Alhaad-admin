import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Container, Grid, Card, CardContent, Typography, Box, Avatar, IconButton, InputBase, Tooltip, useTheme,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from '../common/components/LocalizationProvider';
import { sessionActions } from '../store';
import { nativePostMessage } from '../common/components/NativeInterface';

import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import BarChartIcon from '@mui/icons-material/BarChart';
import StorageIcon from '@mui/icons-material/Storage';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import InsertChartIcon from '@mui/icons-material/InsertChart';

import WindowModeContext from '../common/components/WindowModeContext';

const useStyles = makeStyles()((theme) => ({
    container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        backgroundColor: 'transparent',
    },
    searchSection: {
        padding: theme.spacing(1, 2),
    },
    searchBar: {
        display: 'flex',
        alignItems: 'center',
        padding: '6px 12px',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(20px)',
        borderRadius: '10px',
        border: `1px solid ${theme.palette.divider}`,
        '&:focus-within': {
            borderColor: theme.palette.primary.main,
        },
    },
    contentScroll: {
        flex: 1,
        overflow: 'hidden',
        padding: theme.spacing(0, 2, 1, 2),
    },
    statsGrid: {
        marginBottom: theme.spacing(1.5),
    },
    statCard: {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(55, 65, 81, 0.3)' : 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        padding: theme.spacing(1, 1.5),
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        border: '1px solid rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
    },
    statIconBox: {
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        padding: theme.spacing(0.75),
        borderRadius: '8px',
        display: 'flex',
        color: theme.palette.primary.main,
    },
    statValue: {
        fontSize: '1rem',
        fontWeight: 700,
        lineHeight: 1,
        color: theme.palette.text.primary,
    },
    statLabel: {
        fontSize: '9px',
        fontWeight: 700,
        color: theme.palette.text.secondary,
        textTransform: 'uppercase',
    },
    sectionTitle: {
        fontSize: '0.75rem',
        fontWeight: 600,
        color: theme.palette.text.primary,
        marginBottom: theme.spacing(1),
    },
    appIconCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        '&:hover .iconBox': {
            transform: 'scale(1.05)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(248, 115, 24, 0.15)' : 'rgba(248, 115, 24, 0.05)',
        },
    },
    appIconBox: {
        width: 44,
        height: 44,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(55, 65, 81, 0.8)' : '#fff',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing(0.5),
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'transform 0.15s ease, background-color 0.15s ease',
    },
    appIconLabel: {
        fontSize: '10.5px',
        color: theme.palette.text.secondary,
        textAlign: 'center',
        fontWeight: 500,
        lineHeight: 1.1,
        maxWidth: '100%',
    },
    footer: {
        padding: theme.spacing(1, 2),
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(17, 24, 39, 0.5)' : 'rgba(243, 244, 246, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: `1px solid ${theme.palette.divider}`,
    },
    userProfile: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        padding: theme.spacing(0.25, 1),
        borderRadius: '15px',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
    },
}));

const ReportsDashboard = () => {
    const { classes } = useStyles();
    const navigate = useNavigate();
    const theme = useTheme();
    const t = useTranslation();
    const dispatch = useDispatch();
    const windowContext = useContext(WindowModeContext);

    const user = useSelector((state) => state.session.user);
    const devices = useSelector((state) => state.devices.items);
    const drivers = useSelector((state) => state.drivers.items);

    const [search, setSearch] = useState('');
    const [usersCount, setUsersCount] = useState(0);

    const { onNavigate, onClose, onLaunch } = windowContext || {};

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users');
                if (response.ok) {
                    const users = await response.json();
                    setUsersCount(users.length);
                }
            } catch (e) { }
        };
        fetchUsers();
    }, []);

    const allReports = useMemo(() => [
        { id: 'combined', title: 'Combined', icon: <BarChartIcon sx={{ color: '#f97316', fontSize: 22 }} />, path: '/reports/combined' },
        { id: 'route', title: 'Positions', icon: <TimelineIcon sx={{ color: '#f97316', fontSize: 22 }} />, path: '/reports/route' },
        { id: 'event', title: 'Events', icon: <EventIcon sx={{ color: '#f97316', fontSize: 22 }} />, path: '/reports/events' },
        { id: 'trips', title: 'Trips', icon: <DescriptionIcon sx={{ color: '#f97316', fontSize: 22 }} />, path: '/reports/trips' },
        { id: 'stops', title: 'Stops', icon: <ListAltIcon sx={{ color: '#f97316', fontSize: 22 }} />, path: '/reports/stops' },
        { id: 'summary', title: 'Summary', icon: <AssignmentIcon sx={{ color: '#f97316', fontSize: 22 }} />, path: '/reports/summary' },
        { id: 'chart', title: 'Chart', icon: <InsertChartIcon sx={{ color: '#f97316', fontSize: 22 }} />, path: '/reports/chart' },
        { id: 'statistics', title: 'Statistics', icon: <FormatListBulletedIcon sx={{ color: '#f97316', fontSize: 22 }} />, path: '/reports/statistics' },
        { id: 'audit', title: 'Audit', icon: <SecurityIcon sx={{ color: '#f97316', fontSize: 22 }} />, path: '/reports/audit' },
        { id: 'logs', title: 'Logs', icon: <HistoryIcon sx={{ color: '#f97316', fontSize: 22 }} />, path: '/reports/logs' },
        { id: 'scheduled', title: 'Scheduled', icon: <ScheduleIcon sx={{ color: '#f97316', fontSize: 22 }} />, path: '/reports/scheduled' },
    ], []);

    const filteredReports = useMemo(() => {
        return allReports.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
    }, [search, allReports]);

    const handleAction = (report) => {
        if (onNavigate) {
            onNavigate(report.path);
        } else {
            navigate(report.path);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/session', { method: 'DELETE' });
        nativePostMessage('logout');
        navigate('/login');
        dispatch(sessionActions.updateUser(null));
        if (onClose) onClose();
    };

    return (
        <Box className={classes.container}>
            <Box className={classes.searchSection}>
                <div className={classes.searchBar}>
                    <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} />
                    <InputBase
                        placeholder="Search reports..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        fullWidth
                        sx={{ fontSize: '13px' }}
                    />
                </div>
            </Box>

            <Box className={classes.contentScroll}>
                <Grid container spacing={1.5} className={classes.statsGrid}>
                    <Grid size={4}>
                        <div className={classes.statCard}>
                            <div className={classes.statIconBox}><PeopleIcon sx={{ fontSize: 18 }} /></div>
                            <div>
                                <div className={classes.statValue}>{usersCount || 0}</div>
                                <div className={classes.statLabel}>Users</div>
                            </div>
                        </div>
                    </Grid>
                    <Grid size={4}>
                        <div className={classes.statCard}>
                            <div className={classes.statIconBox}><DirectionsCarIcon sx={{ fontSize: 18 }} /></div>
                            <div>
                                <div className={classes.statValue}>{Object.keys(devices).length}</div>
                                <div className={classes.statLabel}>Devices</div>
                            </div>
                        </div>
                    </Grid>
                    <Grid item xs={4}>
                        <div className={classes.statCard}>
                            <div className={classes.statIconBox}><PersonPinIcon sx={{ fontSize: 18 }} /></div>
                            <div>
                                <div className={classes.statValue}>{Object.keys(drivers).length}</div>
                                <div className={classes.statLabel}>Drivers</div>
                            </div>
                        </div>
                    </Grid>
                </Grid>

                <section>
                    <Typography className={classes.sectionTitle}>Available Reports</Typography>
                    <Grid container spacing={1.5} columns={5}>
                        {filteredReports.map((report) => (
                            <Grid size={1} key={report.id}>
                                <div className={classes.appIconCard} onClick={() => handleAction(report)}>
                                    <div className={`${classes.appIconBox} iconBox`}>
                                        {report.icon}
                                    </div>
                                    <Typography className={classes.appIconLabel}>{report.title}</Typography>
                                </div>
                            </Grid>
                        ))}
                    </Grid>
                </section>
            </Box>

            <footer className={classes.footer}>
                <div className={classes.userProfile} onClick={() => onLaunch ? onLaunch({ id: 'account' }) : handleAction(`/settings/user/${user?.id}`)}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '12px', bgcolor: theme.palette.primary.main }}>
                        {user?.name?.[0] || 'U'}
                    </Avatar>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>{user?.name || 'User'}</Typography>
                </div>
                <div className={classes.footerActions}>
                    <Tooltip title="Logout">
                        <IconButton size="small" onClick={handleLogout}>
                            <PowerSettingsNewIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                </div>
            </footer>
        </Box>
    );
};

export default ReportsDashboard;
