import {
  useState, useCallback, useEffect, createContext,
} from 'react';
import { Paper } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import DeviceList from './DeviceList';
import StatusCard from '../common/components/StatusCard';
import { devicesActions } from '../store';
import usePersistedState from '../common/util/usePersistedState';
import EventsDrawer from './EventsDrawer';
import useFilter from './useFilter';
import MainToolbar from './MainToolbar';
import MainMap from './MainMap';
import { useAttributePreference } from '../common/util/preferences';
import GlobalNavbar from '../common/components/GlobalNavbar';
import Dock from '../common/components/Dock';
import DesktopWindow from '../common/components/DesktopWindow';
import { desktopApps } from './DesktopApps.jsx';
import WindowModeContext from '../common/components/WindowModeContext';
import { MemoryRouter, UNSAFE_LocationContext, UNSAFE_NavigationContext } from 'react-router-dom';
import DesktopRoutes from './DesktopRoutes';

const RouterIsolator = ({ children }) => (
  <UNSAFE_LocationContext.Provider value={null}>
    <UNSAFE_NavigationContext.Provider value={null}>
      {children}
    </UNSAFE_NavigationContext.Provider>
  </UNSAFE_LocationContext.Provider>
);

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    backgroundColor: 'transparent',
    transition: 'background-color 0.3s ease',
    paddingTop: '64px', // Space for fixed navbar
    position: 'relative',
  },
  sidebar: {
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      position: 'fixed',
      left: 0,
      top: '64px',
      height: `calc(100% - 64px - ${theme.spacing(3)})`,
      width: theme.dimensions.drawerWidthDesktop,
      margin: theme.spacing(0, 1.5, 1.5, 1.5),
      zIndex: 3,
    },
    [theme.breakpoints.down('md')]: {
      height: '100%',
      width: '100%',
    },
  },
  header: {
    pointerEvents: 'auto',
    zIndex: 6,
    backgroundColor: theme.palette.glass.background,
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: `1px solid ${theme.palette.glass.border}`,
    overflow: 'hidden',
  },
  footer: {
    pointerEvents: 'auto',
    zIndex: 5,
    backgroundColor: theme.palette.glass.background,
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: `1px solid ${theme.palette.glass.border}`,
    overflow: 'hidden',
  },
  middle: {
    flex: 1,
    display: 'grid',
    minHeight: 0,
  },
  contentMap: {
    pointerEvents: 'auto',
    gridArea: '1 / 1',
  },
  contentList: {
    pointerEvents: 'auto',
    gridArea: '1 / 1',
    zIndex: 4,
    display: 'flex',
    minHeight: 0,
    backgroundColor: theme.palette.glass.background,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${theme.palette.glass.border}`,
    borderRadius: '16px',
    transition: 'all 0.3s ease',
  },
}));

const MainPage = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const mapOnSelect = useAttributePreference('mapOnSelect', true);

  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const positions = useSelector((state) => state.session.positions);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const selectedPosition = filteredPositions.find((position) => selectedDeviceId && position.deviceId === selectedDeviceId);

  const [filteredDevices, setFilteredDevices] = useState([]);

  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = usePersistedState('filter', {
    statuses: [],
    groups: [],
  });
  const [filterSort, setFilterSort] = usePersistedState('filterSort', '');
  const [filterMap, setFilterMap] = usePersistedState('filterMap', false);

  const [devicesOpen, setDevicesOpen] = useState(desktop);
  const [eventsOpen, setEventsOpen] = useState(false);

  const onEventsClick = useCallback(() => setEventsOpen(true), [setEventsOpen]);

  // Window Manager State
  const [windows, setWindows] = useState({});
  const [activeWindowId, setActiveWindowId] = useState(null);

  useEffect(() => {
    if (!desktop && mapOnSelect && selectedDeviceId) {
      setDevicesOpen(false);
    }
  }, [desktop, mapOnSelect, selectedDeviceId]);

  useFilter(keyword, filter, filterSort, filterMap, positions, setFilteredDevices, setFilteredPositions);

  const handleLaunch = (app) => {
    let targetId = app.id;
    // Check if main window is not open but a related one is
    if (!windows[targetId] && app.relatedIds) {
      const relatedId = app.relatedIds.find(rid => windows[rid]);
      if (relatedId) {
        targetId = relatedId;
      }
    }

    if (windows[targetId]) {
      if (windows[targetId].minimized) {
        // Restore
        setWindows((prev) => {
          const maxZ = Math.max(0, ...Object.values(prev).map((w) => w.zIndex || 0));
          return { ...prev, [targetId]: { ...prev[targetId], minimized: false, zIndex: maxZ + 1 } };
        });
        setActiveWindowId(targetId);
      } else if (activeWindowId === targetId) {
        // Minimize
        setWindows((prev) => ({ ...prev, [targetId]: { ...prev[targetId], minimized: true } }));
        setActiveWindowId(null);
      } else {
        // Focus
        setWindows((prev) => {
          const maxZ = Math.max(0, ...Object.values(prev).map((w) => w.zIndex || 0));
          return { ...prev, [targetId]: { ...prev[targetId], zIndex: maxZ + 1 } };
        });
        setActiveWindowId(targetId);
      }
    } else {
      // Open New
      setWindows((prev) => {
        const maxZ = Math.max(0, ...Object.values(prev).map((w) => w.zIndex || 0));
        const defaultWidth = 600;
        const defaultHeight = 500;
        const x = Math.max(0, (window.innerWidth - defaultWidth) / 2);
        const y = Math.max(80, (window.innerHeight - defaultHeight) / 2);

        return {
          ...prev,
          [app.id]: {
            ...app,
            x,
            y,
            zIndex: maxZ + 1,
            component: (
              <RouterIsolator>
                <MemoryRouter initialEntries={[app.path]}>
                  <DesktopRoutes />
                </MemoryRouter>
              </RouterIsolator>
            )
          }
        };
      });
      setActiveWindowId(app.id);
    }
  };

  const handleCloseWindow = (id) => {
    setWindows((prev) => {
      const newWindows = { ...prev };
      delete newWindows[id];
      return newWindows;
    });
  };

  const handleMinimizeWindow = (id) => {
    // Optional: Implement minimize behavior (e.g. hide but keep in state)
    // For now, just close or do nothing? User requirement: "minimize etc"
    // We can add a 'minimized' state.
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], minimized: !prev[id].minimized }
    }));
  };

  const handleFocusWindow = (id) => {
    setActiveWindowId(id);
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], zIndex: Math.max(...Object.values(prev).map(w => w.zIndex || 0)) + 1 }
    }));
  }

  // Effect to sync URL with Windows (Deep linking support basics)
  useEffect(() => {
    const app = desktopApps.find(a => location.pathname.startsWith(a.path));
    if (app && !windows[app.id]) {
      handleLaunch(app);
    }
  }, [location.pathname]);

  return (
    <WindowModeContext.Provider value={true}>
      <GlobalNavbar />
      <div className={classes.root}>
        {desktop && (
          <MainMap
            filteredPositions={filteredPositions}
            selectedPosition={selectedPosition}
            onEventsClick={onEventsClick}
          />
        )}
        <div className={classes.sidebar}>
          <Paper className={classes.header}>
            <MainToolbar
              filteredDevices={filteredDevices}
              devicesOpen={devicesOpen}
              setDevicesOpen={setDevicesOpen}
              keyword={keyword}
              setKeyword={setKeyword}
              filter={filter}
              setFilter={setFilter}
              filterSort={filterSort}
              setFilterSort={setFilterSort}
              filterMap={filterMap}
              setFilterMap={setFilterMap}
              onAddDevice={() => handleLaunch({ id: 'device', title: 'Device', path: '/settings/device' })}
            />
          </Paper>
          <div className={classes.middle}>
            {!desktop && (
              <div className={classes.contentMap}>
                <MainMap
                  filteredPositions={filteredPositions}
                  selectedPosition={selectedPosition}
                  onEventsClick={onEventsClick}
                />
              </div>
            )}
            <Paper className={classes.contentList} style={devicesOpen ? {} : { visibility: 'hidden' }}>
              <DeviceList devices={filteredDevices} />
            </Paper>
          </div>
        </div>

        {/* Dock and Windows */}
        {desktop && (
          <>
            <Dock
              items={desktopApps}
              onLaunch={handleLaunch}
              activeIds={Object.keys(windows)}
            />
            {Object.values(windows).map(win => (
              <DesktopWindow
                key={win.id}
                id={win.id}
                title={win.title}
                icon={win.icon}
                onClose={handleCloseWindow}
                onMinimize={handleMinimizeWindow}
                onFocus={handleFocusWindow}
                zIndex={win.zIndex}
                x={win.x}
                y={win.y}
                minimized={win.minimized}
              >
                {win.component}
              </DesktopWindow>
            ))}
          </>
        )}

        <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />
        {selectedDeviceId && (
          <StatusCard
            deviceId={selectedDeviceId}
            position={selectedPosition}
            onClose={() => dispatch(devicesActions.selectId(null))}
            desktopPadding={theme.dimensions.drawerWidthDesktop}
          />
        )}
      </div>
    </WindowModeContext.Provider>
  );
};

export default MainPage;
