import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch } from 'react-redux';
import MapView from '../map/core/MapView';
import MapSelectedDevice from '../map/main/MapSelectedDevice';
import MapAccuracy from '../map/main/MapAccuracy';
import MapGeofence from '../map/MapGeofence';
import MapCurrentLocation from '../map/MapCurrentLocation';
import PoiMap from '../map/main/PoiMap';
import MapPadding from '../map/MapPadding';
import { devicesActions } from '../store';
import MapDefaultCamera from '../map/main/MapDefaultCamera';
import MapLiveRoutes from '../map/main/MapLiveRoutes';
import MapPositions from '../map/MapPositions';
import MapOverlay from '../map/overlay/MapOverlay';
import MapGeocoder from '../map/geocoder/MapGeocoder';
import MapScale from '../map/MapScale';

const MainMap = ({ filteredPositions, selectedPosition }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));


  const onMarkerClick = useCallback((_, deviceId) => {
    dispatch(devicesActions.selectId(deviceId));
  }, [dispatch]);

  const [paddingStart, setPaddingStart] = useState(280);

  useEffect(() => {
    const updatePadding = () => {
      const width = Math.max(240, Math.min(340, window.innerWidth * 0.2));
      const spacing = parseInt(theme.spacing(1.5), 10);
      setPaddingStart(width + spacing);
    };
    window.addEventListener('resize', updatePadding);
    updatePadding();
    return () => window.removeEventListener('resize', updatePadding);
  }, [theme]);

  // ... (rest of return)

  return (
    <>
      <MapView>
        <MapOverlay />
        <MapGeofence />
        <MapAccuracy positions={filteredPositions} />
        <MapLiveRoutes deviceIds={filteredPositions.map((p) => p.deviceId)} />
        <MapPositions
          positions={filteredPositions}
          onMarkerClick={onMarkerClick}
          selectedPosition={selectedPosition}
          showStatus
        />
        <MapDefaultCamera />
        <MapSelectedDevice />
        <PoiMap />
      </MapView>
      <MapScale />
      <MapCurrentLocation />
      <MapGeocoder />
      {desktop && (
        <MapPadding start={paddingStart} />
      )}
    </>
  );
};

export default MainMap;
