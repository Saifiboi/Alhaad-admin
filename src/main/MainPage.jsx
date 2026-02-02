import {
  useState, useCallback, useEffect, useMemo,
} from 'react';
import { Paper } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DeviceList from './DeviceList';
import StatusCard from '../common/components/StatusCard';
import { devicesActions, replayActions, errorsActions, windowsActions } from '../store';
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
  const windows = useSelector((state) => state.windows.items);
  const activeWindowId = useSelector((state) => state.windows.activeId);
  const [sidebarHeight, setSidebarHeight] = useState(null);

  const anyMaximized = useMemo(() => Object.values(windows).some((w) => w.maximized), [windows]);

  // Detect Dock position and adjust sidebar height
  useEffect(() => {
    if (!desktop) return;

    const adjustSidebarHeight = () => {
      const dockElement = document.querySelector('[class*="dockContainer"]');
      const sidebarElement = document.querySelector(`.${classes.sidebar}`);

      if (!dockElement || !sidebarElement) {
        setSidebarHeight(null);
        return;
      }

      const dockRect = dockElement.getBoundingClientRect();
      const sidebarRect = sidebarElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const topOffset = 64; // navbar height
      const sidebarMargin = 12; // 1.5 spacing
      const gapAboveDock = 8;

      // Check if dock is at the bottom
      const isDockAtBottom = dockRect.bottom > viewportHeight - 150;

      // Check for horizontal overlap with a safety margin
      const isOverlappingHorizontally = dockRect.left < (sidebarRect.right + 20);

      if (isDockAtBottom && isOverlappingHorizontally) {
        // Calculate height to end above dock
        const availableHeight = dockRect.top - topOffset - gapAboveDock - sidebarMargin;
        setSidebarHeight(`${availableHeight}px`);
      } else {
        // Use full available height
        const availableHeight = viewportHeight - topOffset - sidebarMargin;
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
        dispatch(windowsActions.minimize(targetId));
        dispatch(windowsActions.focus(targetId));
      } else if (activeWindowId === targetId) {
        // Minimize
        dispatch(windowsActions.minimize(targetId));
      } else {
        // Focus
        dispatch(windowsActions.focus(targetId));
      }
    } else {
      // Open New
      const systemApp = desktopApps.find(a => a.id === app.id);

      // Sanitize app object to remove non-serializable data (like icons/components)
      const { icon, component, ...serializableApp } = app;

      // Use defaults if not provided in launch args
      const defaultApp = systemApp || {}; // Fallback if launching non-system app

      const width = app.width || defaultApp.width || 680;
      const height = app.height || defaultApp.height || 413;
      const x = Math.max(0, (window.innerWidth - width) / 2);
      const y = Math.max(80, (window.innerHeight - height) / 2);

      dispatch(windowsActions.launch({
        ...serializableApp,
        width,
        height,
        x,
        y,
      }));
    }
  };

  const handleCloseWindow = (id) => {
    // Clear replay state when closing replay window
    if (id === 'replay') {
      dispatch(replayActions.clear());
    }
    dispatch(windowsActions.close(id));
  };

  const handleMinimizeWindow = (id) => {
    dispatch(windowsActions.minimize(id));
  };

  const handleFocusWindow = (id) => {
    dispatch(windowsActions.focus(id));
  };

  const handleMaximizeWindow = (id) => {
    dispatch(windowsActions.maximize(id));
  };

  const handleDragStop = (id, x, y) => {
    dispatch(windowsActions.setPosition({ id, x, y }));
  };

  const handleResizeStop = (id, width, height, x, y) => {
    dispatch(windowsActions.setSize({ id, width, height, x, y }));
  };

  // Helper to get icon for a window
  const getWindowIcon = (win) => {
    if (win.icon && typeof win.icon !== 'object') return win.icon; // If it's a string path?
    // Try to find in desktopApps
    const app = desktopApps.find(a => a.id === win.id);
    if (app && app.icon) return app.icon;
    // Default fallback?
    return null;
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
          style={{
            height: sidebarHeight || `calc(100vh - 64px - ${theme.spacing(anyMaximized ? 0 : 1.5)})`,
            marginBottom: anyMaximized ? 0 : theme.spacing(1.5),
          }}
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
            {!anyMaximized && (
              <Dock
                items={authorizedApps}
                onLaunch={handleLaunch}
                activeIds={Object.keys(windows)}
              />
            )}
            {Object.values(windows).map(win => (
              <DesktopWindow
                key={win.id}
                id={win.id}
                title={win.title}
                icon={getWindowIcon(win)}
                onClose={handleCloseWindow}
                onMinimize={handleMinimizeWindow}
                onMaximize={handleMaximizeWindow}
                onFocus={handleFocusWindow}
                onDragStop={handleDragStop}
                onResizeStop={handleResizeStop}
                zIndex={win.maximized ? 1500 : win.zIndex}
                x={win.x}
                y={win.y}
                defaultWidth={win.width || 680}
                defaultHeight={win.height || 440}
                minimized={win.minimized}
                maximized={win.maximized}
              >
                <WindowModeContext.Provider value={{
                  isWindow: true,
                  onClose: () => handleCloseWindow(win.id),
                  onNavigate: (path) => {
                    handleCloseWindow(win.id);
                    navigate(path);
                  },
                }}>
                  <RouterIsolator>
                    <MemoryRouter initialEntries={[win.path]}>
                      <DesktopRoutes />
                    </MemoryRouter>
                  </RouterIsolator>
                </WindowModeContext.Provider>
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
