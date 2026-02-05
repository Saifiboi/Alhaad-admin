import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Drawer, IconButton, List, ListItemButton, ListItemText, Toolbar, Typography, Tooltip, useMediaQuery, ClickAwayListener,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { formatNotificationTitle, formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { eventsActions } from '../store';

const useStyles = makeStyles()((theme) => ({
  drawer: {
    width: theme.dimensions.eventsDrawerWidth,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  toolbar: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  title: {
    flexGrow: 1,
    fontWeight: 600,
  },
}));

const EventsDrawer = ({ open, onClose }) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items);

  const events = useSelector((state) => state.events.items);

  const formatType = (event) => formatNotificationTitle(t, {
    type: event.type,
    attributes: {
      alarms: event.attributes.alarm,
    },
  });

  return (
    <ClickAwayListener onClickAway={() => open && isDesktop && onClose()}>
      <Drawer
        variant={isDesktop ? 'persistent' : 'temporary'}
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: (theme) => theme.dimensions.eventsDrawerWidth,
            marginTop: { md: '64px', xs: 0 },
            height: { md: 'calc(100% - 64px)', xs: '100%' },
            zIndex: 2000,
          },
        }}
      >
        <Toolbar className={classes.toolbar} disableGutters>
          <Typography variant="h6" className={classes.title}>
            {t('reportEvents')}
          </Typography>
          <Tooltip title={t('sharedRemoveAll')}>
            <IconButton
              size="small"
              color="error"
              onClick={() => dispatch(eventsActions.deleteAll())}
            >
              <DeleteSweepIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Toolbar>
        <List className={classes.drawer} dense>
          {events.map((event) => (
            <ListItemButton
              key={event.id}
              onClick={() => {
                onClose();
                navigate(`/event/${event.id}`);
              }}
              disabled={!event.id}
              sx={{
                maxHeight: '60px',
                minHeight: '48px',
                py: 1,
              }}
            >
              <ListItemText
                primary={`${devices[event.deviceId]?.name} • ${formatType(event)}`}
                secondary={formatTime(event.eventTime, 'seconds')}
                primaryTypographyProps={{
                  sx: {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  },
                }}
                secondaryTypographyProps={{
                  sx: {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  },
                }}
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(eventsActions.delete(event));
                }}
              >
                <DeleteIcon fontSize="small" className={classes.delete} />
              </IconButton>
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </ClickAwayListener>
  );
};

export default EventsDrawer;
