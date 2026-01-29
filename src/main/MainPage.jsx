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
import { devicesActions, replayActions, errorsActions, windowsActions } from '../store';
import usePersistedState from '../common/util/usePersistedState';
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
  const [sidebarOverlaid, setSidebarOverlaid] = useState(false);

  // Window Manager State from Redux
  const windows = useSelector((state) => state.windows.items);
  const activeWindowId = useSelector((state) => state.windows.activeId);
  const [sidebarHeight, setSidebarHeight] = useState(null);

  const anyMaximized = useMemo(() => Object.values(windows).some((w) => w.maximized && !w.minimized), [windows]);

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
        const dockHeight = dockRect.height;
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

    const { icon, ...win } = app;
    dispatch(windowsActions.launch({
      ...win,
      x: Math.max(0, (window.innerWidth - 680) / 2),
      y: Math.max(80, (window.innerHeight - 413) / 2),
      width: 680,
      height: 413,
    }));
  };

  const handleCloseWindow = (id) => {
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

  const handleDashboardClick = useCallback(() => {
    const nextWindows = { ...windows };
    Object.keys(nextWindows).forEach((id) => {
      nextWindows[id] = { ...nextWindows[id], minimized: true };
    });
    dispatch(windowsActions.update(nextWindows));
  }, [windows, dispatch]);

  const handleSelectDevice = useCallback((deviceId) => {
    dispatch(devicesActions.selectId(deviceId));
    if (desktop) {
      const nextWindows = { ...windows };
      Object.keys(nextWindows).forEach((id) => {
        nextWindows[id] = { ...nextWindows[id], minimized: true };
      });
      dispatch(windowsActions.update(nextWindows));
      setSidebarOverlaid(false);
    }
  }, [desktop, dispatch]);

  // Window Mode Context Provider
  return (
    <WindowModeContext.Provider value={{ isWindow: false, onNavigate: navigate, onLaunch: handleLaunch }}>
      <GlobalNavbar
        onAccount={() => handleLaunch({ id: 'account' })}
        onDashboard={handleDashboardClick}
        showSidebarToggle={anyMaximized}
        onSidebarToggle={() => setSidebarOverlaid(!sidebarOverlaid)}
      />
      <div className={classes.root}>
        {desktop && (
          <MainMap
            filteredPositions={filteredPositions}
            selectedPosition={selectedPosition}
            onEventsClick={() => dispatch(sessionActions.updateNotificationsOpen(true))}
          />
        )}
        <div
          className={classes.sidebar}
          style={{
            height: sidebarHeight || `calc(100vh - 64px - ${theme.spacing(anyMaximized ? 0 : 1.5)})`,
            marginBottom: anyMaximized ? 0 : theme.spacing(1.5),
            zIndex: sidebarOverlaid ? 10000 : 3,
            transition: 'height 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease',
            ...(sidebarOverlaid && {
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[10],
              pointerEvents: 'auto',
            })
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
                  onEventsClick={() => dispatch(sessionActions.updateNotificationsOpen(true))}
                />
              </div>
            )}
            <Paper className={classes.contentList} style={devicesOpen ? {} : { visibility: 'hidden' }}>
              <DeviceList devices={filteredDevices} onSelect={handleSelectDevice} />
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
            {Object.values(windows).map(win => {
              const app = desktopApps.find(a => a.id === win.id || (a.relatedIds && a.relatedIds.includes(win.id)));
              return (
                <DesktopWindow
                  key={win.id}
                  id={win.id}
                  title={win.title}
                  icon={app ? app.icon : null}
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
                  <WindowModeContext.Consumer>
                    {(value) => (
                      <WindowModeContext.Provider value={{ isWindow: true, onClose: () => handleCloseWindow(win.id), onNavigate: navigate, onLaunch: value.onLaunch }}>
                        <RouterIsolator>
                          <MemoryRouter initialEntries={[win.path]}>
                            <DesktopRoutes />
                          </MemoryRouter>
                        </RouterIsolator>
                      </WindowModeContext.Provider>
                    )}
                  </WindowModeContext.Consumer>
                </DesktopWindow>
              );
            })}
          </>
        )}

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
