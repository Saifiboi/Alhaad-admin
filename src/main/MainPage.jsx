import {
  useState, useCallback, useEffect, createContext, useMemo,
} from 'react';
import { Paper } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import DeviceList from './DeviceList';
import StatusCard from '../common/components/StatusCard';
import { devicesActions, replayActions, errorsActions } from '../store';
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
import { useAdministrator, useManager } from '../common/util/permissions';
import { useTranslation } from '../common/components/LocalizationProvider';

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
      height: `calc(100vh - 64px - ${theme.spacing(1.5)})`,
      width: theme.dimensions.drawerWidthDesktop,
      margin: theme.spacing(0, 1.5, 1.5, 1.5),
      zIndex: 3,
      transition: 'height 0.3s ease',
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
  const t = useTranslation();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const admin = useAdministrator();
  const manager = useManager();

  const authorizedApps = useMemo(() => desktopApps.filter((app) => {
    if (app.id === 'server' || app.id === 'announcement') {
      return admin;
    }
    if (app.id === 'users') {
      return manager;
    }
    return true;
  }), [admin, manager]);

  const user = useSelector((state) => state.session.user);
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
  const [sidebarHeight, setSidebarHeight] = useState(null);

  // Detect Dock position and adjust sidebar height
  useEffect(() => {
    if (!desktop) return;

    const adjustSidebarHeight = () => {
      const dockElement = document.querySelector('[class*="dockContainer"]');
      if (!dockElement) {
        setSidebarHeight(null);
        return;
      }

      const dockRect = dockElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const sidebarWidth = theme.dimensions.drawerWidthDesktop || 280;
      const sidebarLeft = theme.spacing(1.5) || 12; // margin-left
      const sidebarRight = sidebarLeft + sidebarWidth;

      // Check if dock is at the bottom (horizontal layout)
      const isDockAtBottom = dockRect.bottom > viewportHeight - 100 &&
        dockRect.left > sidebarRight - 50; // -50px tolerance for overlap

      if (isDockAtBottom) {
        // Dock is at bottom and might collide - adjust sidebar height
        const dockHeight = dockRect.height;
        const dockBottomMargin = viewportHeight - dockRect.bottom;
        const topOffset = 64; // navbar height
        const sidebarBottomMargin = 12; // theme.spacing(1.5)
        const gapAboveDock = 8; // gap between sidebar and dock
        const availableHeight = viewportHeight - topOffset - dockHeight - sidebarBottomMargin - gapAboveDock - dockBottomMargin;
        setSidebarHeight(`${availableHeight}px`);
      } else {
        // Dock is on the side or not colliding - use full available height
        const topOffset = 64; // navbar height
        const sidebarBottomMargin = 12; // theme.spacing(1.5)
        const availableHeight = viewportHeight - topOffset - sidebarBottomMargin;
        setSidebarHeight(`${availableHeight}px`);
      }
    };

    // Initial adjustment
    adjustSidebarHeight();

    // Re-adjust on window resize
    window.addEventListener('resize', adjustSidebarHeight);

    // Re-adjust when dock might change (use MutationObserver)
    const observer = new MutationObserver(adjustSidebarHeight);
    const targetNode = document.body;
    observer.observe(targetNode, { childList: true, subtree: true });

    // Periodic check in case dock position changes
    const interval = setInterval(adjustSidebarHeight, 1000);

    return () => {
      window.removeEventListener('resize', adjustSidebarHeight);
      observer.disconnect();
      clearInterval(interval);
    };
  }, [desktop, theme]);

  useEffect(() => {
    if (!desktop && mapOnSelect && selectedDeviceId) {
      setDevicesOpen(false);
    }
  }, [desktop, mapOnSelect, selectedDeviceId]);

  useFilter(keyword, filter, filterSort, filterMap, positions, setFilteredDevices, setFilteredPositions);

  const handleLaunch = (app) => {
    let targetId = app.id;

    if (app.id === 'send_command') {
      if (selectedDeviceId) {
        handleLaunch({
          id: 'command',
          title: t('sharedCommand'),
          path: `/settings/device/${selectedDeviceId}/command`,
        });
      } else {
        setDevicesOpen(true);
        dispatch(errorsActions.push(t('errorDeviceSelected')));
      }
      return;
    }

    if (app.id === 'account') {
      if (user) {
        handleLaunch({
          id: 'user',
          title: t('settingsUser'),
          path: `/settings/user/${user.id}`,
        });
      }
      return;
    }

    if (app.id === 'geofences' || app.id === 'replay') {
      navigate(app.path);
      return;
    }

    // Check if main window is not open but a related one is
    if (!windows[targetId] && app.relatedIds) {
      const relatedId = app.relatedIds.find((rid) => windows[rid]);
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
        const defaultWidth = 680;
        const defaultHeight = 440;
        const x = Math.max(0, (window.innerWidth - defaultWidth) / 2);
        const y = Math.max(80, (window.innerHeight - defaultHeight) / 2);

        return {
          ...prev,
          [app.id]: {
            ...app,
            x,
            y,
            width: defaultWidth,
            height: defaultHeight,
            zIndex: maxZ + 1,
            component: (
              <RouterIsolator>
                <MemoryRouter initialEntries={[app.path]}>
                  <DesktopRoutes />
                </MemoryRouter>
              </RouterIsolator>
            ),
          },
        };
      });
      setActiveWindowId(app.id);
    }
  };

  const handleCloseWindow = (id) => {
    // Clear replay state when closing replay window
    if (id === 'replay') {
      dispatch(replayActions.clear());
    }

    setWindows((prev) => {
      const newWindows = { ...prev };
      delete newWindows[id];
      return newWindows;
    });
  };

  const handleMinimizeWindow = (id) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], minimized: !prev[id].minimized },
    }));
  };

  const handleFocusWindow = (id) => {
    setActiveWindowId(id);
    setWindows((prev) => {
      const maxZ = Math.max(0, ...Object.values(prev).map((w) => w.zIndex || 0));
      return { ...prev, [id]: { ...prev[id], zIndex: maxZ + 1 } };
    });
  };

  const handleMaximizeWindow = (id) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], maximized: !prev[id].maximized },
    }));
  };

  const handleDragStop = (id, x, y) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], x, y },
    }));
  };

  const handleResizeStop = (id, width, height, x, y) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], width, height, x, y },
    }));
  };

  // Window Mode Context Provider
  return (
    <WindowModeContext.Provider value={true}>
      <GlobalNavbar onAccount={() => handleLaunch({ id: 'account' })} />
      <div className={classes.root}>
        {desktop && (
          <MainMap
            filteredPositions={filteredPositions}
            selectedPosition={selectedPosition}
            onEventsClick={onEventsClick}
          />
        )}
        <div
          className={classes.sidebar}
          style={sidebarHeight ? { height: sidebarHeight } : {}}
        >
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
              items={authorizedApps}
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
                onMaximize={handleMaximizeWindow}
                onFocus={handleFocusWindow}
                onDragStop={handleDragStop}
                onResizeStop={handleResizeStop}
                zIndex={win.zIndex}
                x={win.x}
                y={win.y}
                defaultWidth={win.width || 680}
                defaultHeight={win.height || 440}
                minimized={win.minimized}
                maximized={win.maximized}
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
            onEdit={() => handleLaunch({
              id: 'device', title: t('sharedDevice'), path: `/settings/device/${selectedDeviceId}`,
            })}
            onCommand={() => handleLaunch({
              id: 'command', title: t('sharedCommand'), path: `/settings/device/${selectedDeviceId}/command`,
            })}
            onShare={() => handleLaunch({
              id: 'share', title: t('deviceShare'), path: `/settings/device/${selectedDeviceId}/share`,
            })}
            onReplay={() => handleLaunch({
              id: 'replay', title: t('reportReplay'), path: `/replay?deviceId=${selectedDeviceId}`,
            })}
            onGeofenceCreated={(geofenceId) => handleLaunch({
              id: 'geofence', title: t('sharedGeofence'), path: `/settings/geofence/${geofenceId}`,
            })}
          />
        )}
      </div>
    </WindowModeContext.Provider>
  );
};

export default MainPage;
