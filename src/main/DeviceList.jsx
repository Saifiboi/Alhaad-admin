import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import { List } from 'react-window';
import { devicesActions } from '../store';
import { useEffectAsync } from '../reactHelper';
import DeviceRow from './DeviceRow';
import fetchOrThrow from '../common/util/fetchOrThrow';
import TruckLoader from '../common/components/TruckLoader';
import { getCachedDevices, setCachedDevices } from '../common/util/deviceCache';

const useStyles = makeStyles()((theme) => ({
  list: {
    height: '100%',
    direction: theme.direction,
  },
  listInner: {
    position: 'relative',
    margin: theme.spacing(1.5, 0),
  },
}));

const DeviceList = ({ devices, onSelect }) => {
  const { classes } = useStyles();
  const dispatch = useDispatch();

  const [, setTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 60000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffectAsync(async () => {
    try {
      // Try to load from cache first
      const cachedDevices = getCachedDevices();
      if (cachedDevices) {
        dispatch(devicesActions.refresh(cachedDevices));
        setLoading(false);
        return; // Don't fetch from API if we have cached data
      }

      // Only fetch from API if no cache exists
      const response = await fetchOrThrow('/api/devices');
      const devicesData = await response.json();
      dispatch(devicesActions.refresh(devicesData));
      setCachedDevices(devicesData);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <TruckLoader fullHeight={false} />;
  }

  return (
    <List
      className={classes.list}
      rowComponent={DeviceRow}
      rowCount={devices.length}
      rowHeight={72}
      rowProps={{ devices, onSelect }}
      overscanCount={10}
      useIsScrolling
    />
  );
};

export default DeviceList;
