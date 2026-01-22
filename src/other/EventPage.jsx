import { useCallback, useState } from 'react';
import {
  Typography, IconButton, Toolbar, Paper, Divider, List, ListItem, ListItemText, useMediaQuery, useTheme,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import MapView from '../map/core/MapView';
import MapCamera from '../map/MapCamera';
import MapPositions from '../map/MapPositions';
import MapGeofence from '../map/MapGeofence';
import { formatNotificationTitle, formatTime } from '../common/util/formatter';
import MapScale from '../map/MapScale';
import BackIcon from '../common/components/BackIcon';
import fetchOrThrow from '../common/util/fetchOrThrow';
import GlobalNavbar from '../common/components/GlobalNavbar';
import AddressValue from '../common/components/AddressValue';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      paddingTop: '64px',
    },
  },
  content: {
    flexGrow: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
    },
  },
  drawer: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      width: theme.dimensions.drawerWidthDesktop,
    },
    [theme.breakpoints.down('sm')]: {
      height: theme.dimensions.drawerHeightPhone,
    },
  },
  mapContainer: {
    flexGrow: 1,
    position: 'relative',
  },
  title: {
    flexGrow: 1,
    fontWeight: 600,
  },
  detailsList: {
    padding: theme.spacing(2),
  },
  label: {
    fontWeight: 600,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    marginBottom: theme.spacing(0.5),
  },
}));

const EventPage = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslation();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const { id } = useParams();

  const [event, setEvent] = useState();
  const [position, setPosition] = useState();

  const devices = useSelector((state) => state.devices.items);

  const formatType = (event) => formatNotificationTitle(t, {
    type: event.type,
    attributes: {
      alarms: event.attributes.alarm,
    },
  });

  const handleBack = useCallback(() => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [navigate, location.key]);

  useEffectAsync(async () => {
    if (id) {
      const response = await fetchOrThrow(`/api/events/${id}`);
      setEvent(await response.json());
    }
  }, [id]);

  useEffectAsync(async () => {
    if (event && event.positionId) {
      const response = await fetchOrThrow(`/api/positions?id=${event.positionId}`);
      const positions = await response.json();
      if (positions.length > 0) {
        setPosition(positions[0]);
      }
    }
  }, [event]);

  return (
    <div className={classes.root}>
      {desktop && <GlobalNavbar onAccount={() => navigate('/settings/user')} />}
      <div className={classes.content}>
        <Paper square className={classes.drawer}>
          <Toolbar>
            <IconButton edge="start" sx={{ mr: 2 }} onClick={handleBack}>
              <BackIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title} noWrap>
              {t('reportEvent')}
            </Typography>
          </Toolbar>
          <Divider />
          <List className={classes.detailsList}>
            <ListItem disableGutters sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography className={classes.label}>{t('sharedType')}</Typography>
              <Typography variant="body1" fontWeight={500}>
                {event && formatType(event)}
              </Typography>
            </ListItem>
            <ListItem disableGutters sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography className={classes.label}>{t('sharedDevice')}</Typography>
              <Typography variant="body2">
                {event && devices[event.deviceId]?.name}
              </Typography>
            </ListItem>
            <ListItem disableGutters sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography className={classes.label}>{t('sharedTime')}</Typography>
              <Typography variant="body2">
                {event && formatTime(event.eventTime, 'seconds')}
              </Typography>
            </ListItem>
            {position && (
              <ListItem disableGutters sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography className={classes.label}>{t('positionAddress')}</Typography>
                <Typography variant="body2">
                  <AddressValue
                    latitude={position.latitude}
                    longitude={position.longitude}
                    originalAddress={position.address}
                  />
                </Typography>
              </ListItem>
            )}
          </List>
        </Paper>
        <div className={classes.mapContainer}>
          <MapView>
            <MapGeofence />
            {position && <MapPositions positions={[position]} titleField="fixTime" />}
          </MapView>
          <MapScale />
          {position && <MapCamera latitude={position.latitude} longitude={position.longitude} />}
        </div>
      </div>
    </div>
  );
};

export default EventPage;
