import { useState } from 'react';
import { useSelector } from 'react-redux';

import {
  Typography, Container, Paper, AppBar, Toolbar, IconButton, Table, TableHead, TableRow, TableCell, TableBody,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PositionValue from '../common/components/PositionValue';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import BackIcon from '../common/components/BackIcon';
import fetchOrThrow from '../common/util/fetchOrThrow';

import GlobalNavbar from '../common/components/GlobalNavbar';
import EventsDrawer from '../main/EventsDrawer';
import { useCallback } from 'react';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    overflow: 'auto',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

const PositionPage = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);

  const { id } = useParams();

  const [item, setItem] = useState();
  const [eventsOpen, setEventsOpen] = useState(false);

  const onEventsClick = useCallback(() => setEventsOpen((prev) => !prev), []);

  useEffectAsync(async () => {
    if (id) {
      const response = await fetchOrThrow(`/api/positions?id=${id}`);
      const positions = await response.json();
      if (positions.length > 0) {
        setItem(positions[0]);
      }
    }
  }, [id]);

  const deviceName = useSelector((state) => {
    if (item) {
      const device = state.devices.items[item.deviceId];
      if (device) {
        return device.name;
      }
    }
    return null;
  });

  return (
    <div className={classes.root}>
      <GlobalNavbar
        onBack={() => navigate(-1)}
        onDashboard={() => navigate('/')}
        onEvents={onEventsClick}
        showNavigation
      />
      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />
      <div className={classes.content}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {deviceName}
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="sm" sx={{ mt: 2 }}>
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('stateName')}</TableCell>
                  <TableCell>{t('sharedName')}</TableCell>
                  <TableCell>{t('stateValue')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {item && Object.getOwnPropertyNames(item).filter((it) => it !== 'attributes').map((property) => (property !== 'id' && property !== 'deviceId') && (
                  <TableRow key={property}>
                    <TableCell>{property}</TableCell>
                    <TableCell><strong>{positionAttributes[property]?.name || property}</strong></TableCell>
                    <TableCell><PositionValue position={item} property={property} /></TableCell>
                  </TableRow>
                ))}
                {item && Object.getOwnPropertyNames(item.attributes).map((attribute) => (
                  <TableRow key={attribute}>
                    <TableCell>{attribute}</TableCell>
                    <TableCell><strong>{positionAttributes[attribute]?.name || attribute}</strong></TableCell>
                    <TableCell><PositionValue position={item} attribute={attribute} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Container>
      </div>
    </div>
  );
};

export default PositionPage;
