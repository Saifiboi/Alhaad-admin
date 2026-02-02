import {
    IconButton, Typography, Box,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useNavigate } from 'react-router-dom';
import GlobalNavbar from '../../common/components/GlobalNavbar';
import BackIcon from '../../common/components/BackIcon';

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
    main: {
        flexGrow: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 3),
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        minHeight: '48px',
    },
}));

const ReportLayout = ({ children }) => {
    const { classes } = useStyles();
    const t = useTranslation();
    const navigate = useNavigate();

    return (
        <div className={classes.root}>
            <GlobalNavbar />
            <div className={classes.content}>
                <div className={classes.main}>
                    <Box className={classes.header}>
                        <IconButton color="inherit" edge="start" sx={{ mr: 2 }} onClick={() => navigate('/')}>
                            <BackIcon />
                        </IconButton>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{t('reportTitle')}</Typography>
                    </Box>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ReportLayout;
