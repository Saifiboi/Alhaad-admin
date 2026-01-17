import {
  useState, useEffect, useRef, useCallback,
} from 'react';
import {
  IconButton, Paper, Slider, Toolbar, Typography,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import TuneIcon from '@mui/icons-material/Tune';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MapView from '../map/core/MapView';
import MapRoutePath from '../map/MapRoutePath';
import MapRoutePoints from '../map/MapRoutePoints';
import MapPositions from '../map/MapPositions';
import { formatTime } from '../common/util/formatter';
import ReportFilter, { updateReportParams } from '../reports/components/ReportFilter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useCatch } from '../reactHelper';
import MapCamera from '../map/MapCamera';
import MapGeofence from '../map/MapGeofence';
import StatusCard from '../common/components/StatusCard';
import MapScale from '../map/MapScale';
import BackIcon from '../common/components/BackIcon';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery, useTheme } from '@mui/material';
import { replayActions } from '../store';
import GlobalNavbar from '../common/components/GlobalNavbar';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    [theme.breakpoints.up('md')]: {
      paddingTop: '64px',
    },
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    zIndex: 3,
    left: 0,
    top: '64px',
    margin: theme.spacing(1.5),
    width: theme.dimensions.drawerWidthDesktop,
    [theme.breakpoints.down('md')]: {
      width: '100%',
      margin: 0,
    },
  },
  title: {
    flexGrow: 1,
  },
  slider: {
    width: '100%',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formControlLabel: {
    height: '100%',
    width: '100%',
    paddingRight: theme.spacing(1),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(1),
    },
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing(1),
    },
  },
}));

const ReplayPage = () => {
  const t = useTranslation();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const { classes } = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const timerRef = useRef();

  const [searchParams, setSearchParams] = useSearchParams();

  const defaultDeviceId = useSelector((state) => state.devices.selectedId);

  const positions = useSelector((state) => state.replay.positions);
  const index = useSelector((state) => state.replay.index);
  const playing = useSelector((state) => state.replay.playing);

  const [selectedDeviceId, setSelectedDeviceId] = useState(defaultDeviceId);
  const [showCard, setShowCard] = useState(false);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const [loading, setLoading] = useState(false);

  const loaded = Boolean(from && to && !loading && positions.length);

  const deviceName = useSelector((state) => {
    if (selectedDeviceId) {
      const device = state.devices.items[selectedDeviceId];
      if (device) {
        return device.name;
      }
    }
    return null;
  });

  useEffect(() => {
    if (!from && !to) {
      dispatch(replayActions.clear());
    }
  }, [from, to, dispatch]);

  useEffect(() => {
    if (playing && positions.length > 0) {
      timerRef.current = setInterval(() => {
        dispatch(replayActions.setIndex(index + 1));
      }, 500);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [playing, positions, index, dispatch]);

  useEffect(() => {
    if (index >= positions.length - 1) {
      clearInterval(timerRef.current);
      dispatch(replayActions.setPlaying(false));
    }
  }, [index, positions, dispatch]);

  useEffect(() => () => {
    dispatch(replayActions.clear());
  }, [dispatch]);

  const onPointClick = useCallback((_, index) => {
    dispatch(replayActions.setIndex(index));
  }, [dispatch]);

  const onMarkerClick = useCallback((positionId) => {
    setShowCard(!!positionId);
  }, [setShowCard]);

  const onShow = useCatch(async ({ deviceIds, from, to }) => {
    const deviceId = deviceIds.find(() => true);
    setLoading(true);
    setSelectedDeviceId(deviceId);
    const query = new URLSearchParams({ deviceId, from, to });
    try {
      const response = await fetchOrThrow(`/api/positions?${query.toString()}`);
      const positions = await response.json();
      dispatch(replayActions.setPositions(positions));
      if (!positions.length) {
        throw Error(t('sharedNoData'));
      }
    } finally {
      setLoading(false);
    }
  });

  const handleDownload = () => {
    const query = new URLSearchParams({ deviceId: selectedDeviceId, from, to });
    window.location.assign(`/api/positions/kml?${query.toString()}`);
  };

  return (
    <div className={classes.root}>
      {desktop && <GlobalNavbar onAccount={() => navigate('/settings/user')} />}
      <MapView>
        <MapGeofence />
        <MapRoutePath positions={positions} />
        <MapRoutePoints positions={positions} onClick={onPointClick} showSpeedControl />
        {index < positions.length && (
          <MapPositions positions={[positions[index]]} onMarkerClick={onMarkerClick} titleField="fixTime" />
        )}
      </MapView>
      <MapScale />
      <MapCamera positions={positions} />
      <div className={classes.sidebar}>
        <Paper elevation={3} square>
          <Toolbar>
            <IconButton edge="start" sx={{ mr: 2 }} onClick={() => navigate(-1)}>
              <BackIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>{t('reportReplay')}</Typography>
            {loaded && (
              <>
                <IconButton onClick={handleDownload}>
                  <DownloadIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => updateReportParams(searchParams, setSearchParams, 'ignore', [])}>
                  <TuneIcon />
                </IconButton>
              </>
            )}
          </Toolbar>
        </Paper>
        <Paper className={classes.content} square>
          {loaded ? (
            <>
              <Typography variant="subtitle1" align="center">{deviceName}</Typography>
              <Slider
                className={classes.slider}
                max={positions.length - 1}
                step={null}
                marks={positions.map((_, index) => ({ value: index }))}
                value={index}
                onChange={(_, index) => dispatch(replayActions.setIndex(index))}
              />
              <div className={classes.controls}>
                {`${index + 1}/${positions.length}`}
                <IconButton onClick={() => dispatch(replayActions.setIndex(index - 1))} disabled={playing || index <= 0}>
                  <FastRewindIcon />
                </IconButton>
                <IconButton onClick={() => dispatch(replayActions.setPlaying(!playing))} disabled={index >= positions.length - 1}>
                  {playing ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton onClick={() => dispatch(replayActions.setIndex(index + 1))} disabled={playing || index >= positions.length - 1}>
                  <FastForwardIcon />
                </IconButton>
                {formatTime(positions[index].fixTime, 'seconds')}
              </div>
            </>
          ) : (
            <ReportFilter onShow={onShow} deviceType="single" loading={loading} />
          )}
        </Paper>
      </div>
      {showCard && index < positions.length && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={positions[index]}
          onClose={() => setShowCard(false)}
          disableActions
        />
      )}
    </div>
  );
};

export default ReplayPage;
