import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import { googleProtocol } from 'maplibre-google-maps';
import React, {
  useRef, useLayoutEffect, useEffect, useState,
  useMemo,
} from 'react';
import { useTheme } from '@mui/material';
import { SwitcherControl } from '../switcher/switcher';
import { useAttributePreference, usePreference } from '../../common/util/preferences';
import usePersistedState, { savePersistedState } from '../../common/util/usePersistedState';
import { mapImages } from './preloadImages';
import useMapStyles from './useMapStyles';
import { useEffectAsync } from '../../reactHelper';

const element = document.createElement('div');
element.style.width = '100%';
element.style.height = '100%';
element.style.boxSizing = 'initial';

maplibregl.addProtocol('google', googleProtocol);

export const map = new maplibregl.Map({
  container: element,
  attributionControl: false,
});

let ready = false;
const readyListeners = new Set();

const addReadyListener = (listener) => {
  readyListeners.add(listener);
  listener(ready);
};

const removeReadyListener = (listener) => {
  readyListeners.delete(listener);
};

const updateReadyValue = (value) => {
  ready = value;
  readyListeners.forEach((listener) => listener(value));
};

const initMap = async () => {
  if (ready) return;
  if (!map.hasImage('background')) {
    Object.entries(mapImages).forEach(([key, value]) => {
      map.addImage(key, value, {
        pixelRatio: window.devicePixelRatio,
      });
    });
  }
};

const MapView = ({ children }) => {
  const theme = useTheme();

  const containerEl = useRef(null);

  const [mapReady, setMapReady] = useState(false);

  const mapStyles = useMapStyles();
  const activeMapStyles = useAttributePreference('activeMapStyles', 'locationIqStreets,locationIqDark,openFreeMap');
  const [defaultMapStyle] = usePersistedState('selectedMapStyle', usePreference('map', 'locationIqStreets'));
  const mapboxAccessToken = useAttributePreference('mapboxAccessToken');
  const maxZoom = useAttributePreference('web.maxZoom');

  const switcher = useMemo(() => new SwitcherControl(
    () => updateReadyValue(false),
    (styleId) => savePersistedState('selectedMapStyle', styleId),
    () => {
      map.once('styledata', () => {
        const waiting = () => {
          if (!map.loaded()) {
            setTimeout(waiting, 33);
          } else {
            initMap();
            updateReadyValue(true);
          }
        };
        waiting();
      });
    },
  ), []);

  useEffectAsync(async () => {
    if (theme.direction === 'rtl') {
      maplibregl.setRTLTextPlugin('/mapbox-gl-rtl-text.js');
    }
  }, [theme.direction]);

  useEffect(() => {
    const attribution = new maplibregl.AttributionControl({ compact: true });
    const navigation = new maplibregl.NavigationControl();
    map.addControl(attribution, theme.direction === 'rtl' ? 'bottom-left' : 'bottom-right');
    map.addControl(navigation, theme.direction === 'rtl' ? 'top-left' : 'top-right');
    map.addControl(switcher, theme.direction === 'rtl' ? 'top-left' : 'top-right');
    return () => {
      map.removeControl(switcher);
      map.removeControl(navigation);
      map.removeControl(attribution);
    };
  }, [theme.direction, switcher]);

  useEffect(() => {
    if (maxZoom) {
      map.setMaxZoom(maxZoom);
    }
  }, [maxZoom]);

  useEffect(() => {
    maplibregl.accessToken = mapboxAccessToken;
  }, [mapboxAccessToken]);

  useEffect(() => {
    const filteredStyles = mapStyles.filter((s) => s.available && activeMapStyles.includes(s.id));
    const styles = filteredStyles.length ? filteredStyles : mapStyles.filter((s) => s.id === 'osm');
    switcher.updateStyles(styles, defaultMapStyle);
  }, [mapStyles, defaultMapStyle, activeMapStyles, switcher]);

  // Auto-switch map style based on theme mode
  useEffect(() => {
    const currentStyle = map.getStyle();
    if (!currentStyle) return;

    const isDarkMode = theme.palette.mode === 'dark';
    const currentStyleUrl = currentStyle.sprite || '';

    // Check if current style is a LocationIQ style
    const isLocationIqLight = currentStyleUrl.includes('locationiq.com/v3/streets');
    const isLocationIqDark = currentStyleUrl.includes('locationiq.com/v3/dark');

    // Only auto-switch if using LocationIQ styles
    if (isLocationIqLight || isLocationIqDark) {
      const targetStyleId = isDarkMode ? 'locationIqDark' : 'locationIqStreets';
      const currentStyleId = isLocationIqDark ? 'locationIqDark' : 'locationIqStreets';

      // Only switch if the target style is different from current
      if (targetStyleId !== currentStyleId) {
        const targetStyle = mapStyles.find((s) => s.id === targetStyleId);
        if (targetStyle && targetStyle.available) {
          switcher.onStyleSelect(targetStyleId);
        }
      }
    }
  }, [theme.palette.mode, mapStyles, switcher]);

  useEffect(() => {
    const listener = (ready) => setMapReady(ready);
    addReadyListener(listener);
    return () => {
      removeReadyListener(listener);
    };
  }, []);

  useLayoutEffect(() => {
    const currentEl = containerEl.current;
    currentEl.appendChild(element);
    map.resize();
    return () => {
      currentEl.removeChild(element);
    };
  }, [containerEl]);

  return (
    <div style={{ width: '100%', height: '100%' }} ref={containerEl}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type.handlesMapReady) {
          return React.cloneElement(child, { mapReady });
        }
        return mapReady ? child : null;
      })}
    </div>
  );
};

export default MapView;
