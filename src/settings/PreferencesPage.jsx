import { useState } from 'react';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Container, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, FormGroup, InputAdornment, IconButton, OutlinedInput, Autocomplete, TextField, createFilterOptions, Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CachedIcon from '@mui/icons-material/Cached';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation, useTranslationKeys } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { prefixString, unprefixString } from '../common/util/stringUtils';
import SelectField from '../common/components/SelectField';
import useMapStyles from '../map/core/useMapStyles';
import useMapOverlays from '../map/overlay/useMapOverlays';
import { useCatch } from '../reactHelper';
import { sessionActions } from '../store';
import { useAdministrator, useRestriction } from '../common/util/permissions';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const deviceFields = [
  { id: 'name', name: 'sharedName' },
  { id: 'uniqueId', name: 'deviceIdentifier' },
  { id: 'phone', name: 'sharedPhone' },
  { id: 'model', name: 'deviceModel' },
  { id: 'contact', name: 'deviceContact' },
];

const PreferencesPage = () => {
  const { classes } = useSettingsStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const admin = useAdministrator();
  const readonly = useRestriction('readonly');

  const user = useSelector((state) => state.session.user);
  const [attributes, setAttributes] = useState(user.attributes);

  const versionApp = import.meta.env.VITE_APP_VERSION;
  const versionServer = useSelector((state) => state.session.server.version);
  const socket = useSelector((state) => state.session.socket);

  const [token, setToken] = useState(null);
  const [tokenExpiration, setTokenExpiration] = useState(dayjs().add(1, 'week').locale('en').format('YYYY-MM-DD'));

  const mapStyles = useMapStyles();
  const mapOverlays = useMapOverlays();

  const positionAttributes = usePositionAttributes(t);

  const filter = createFilterOptions();

  const generateToken = useCatch(async () => {
    const expiration = dayjs(tokenExpiration, 'YYYY-MM-DD').toISOString();
    const response = await fetchOrThrow('/api/session/token', {
      method: 'POST',
      body: new URLSearchParams(`expiration=${expiration}`),
    });
    setToken(await response.text());
  });

  const alarms = useTranslationKeys((it) => it.startsWith('alarm')).map((it) => ({
    key: unprefixString('alarm', it),
    name: t(it),
  }));

  const handleSave = useCatch(async () => {
    const response = await fetchOrThrow(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, attributes }),
    });
    dispatch(sessionActions.updateUser(await response.json()));
    navigate(-1);
  });

  const handleReboot = useCatch(async () => {
    const response = await fetch('/api/server/reboot', { method: 'POST' });
    throw Error(response.statusText);
  });

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedPreferences']}>
      <Container maxWidth="lg" className={classes.container}>
        <div className={classes.content}>
          {!readonly && (
            <>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    {t('mapTitle')}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.grid}>
                  <FormControl>
                    <InputLabel>{t('mapActive')}</InputLabel>
                    <Select
                      label={t('mapActive')}
                      value={attributes.activeMapStyles?.split(',') || ['locationIqStreets', 'locationIqDark', 'openFreeMap']}
                      onChange={(e, child) => {
                        const clicked = mapStyles.find((s) => s.id === child.props.value);
                        if (clicked.available) {
                          setAttributes({ ...attributes, activeMapStyles: e.target.value.join(',') });
                        } else if (clicked.id !== 'custom') {
                          const query = new URLSearchParams({ attribute: clicked.attribute });
                          navigate(`/settings/user/${user.id}?${query.toString()}`);
                        }
                      }}
                      multiple
                    >
                      {mapStyles.map((style) => (
                        <MenuItem key={style.id} value={style.id}>
                          <Typography component="span" color={style.available ? 'textPrimary' : 'error'}>{style.title}</Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel>{t('mapOverlay')}</InputLabel>
                    <Select
                      label={t('mapOverlay')}
                      value={attributes.selectedMapOverlay || ''}
                      onChange={(e) => {
                        const clicked = mapOverlays.find((o) => o.id === e.target.value);
                        if (!clicked || clicked.available) {
                          setAttributes({ ...attributes, selectedMapOverlay: e.target.value });
                        } else if (clicked.id !== 'custom') {
                          const query = new URLSearchParams({ attribute: clicked.attribute });
                          navigate(`/settings/user/${user.id}?${query.toString()}`);
                        }
                      }}
                    >
                      <MenuItem value="">{'\u00a0'}</MenuItem>
                      {mapOverlays.map((overlay) => (
                        <MenuItem key={overlay.id} value={overlay.id}>
                          <Typography component="span" color={overlay.available ? 'textPrimary' : 'error'}>{overlay.title}</Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Autocomplete
                    className={classes.fullWidth}
                    multiple
                    freeSolo
                    options={Object.keys(positionAttributes)}
                    getOptionLabel={(option) => {
                      if (typeof option === 'object' && option.inputValue) {
                        return option.inputValue;
                      }
                      return positionAttributes[option]?.name || option;
                    }}
                    value={attributes.positionItems?.split(',') || ['fixTime', 'address', 'speed', 'totalDistance']}
                    onChange={(_, newValue) => {
                      setAttributes({ ...attributes, positionItems: newValue.map((x) => (typeof x === 'string' ? x : x.inputValue)).join(','), });
                    }}
                    filterOptions={(options, params) => {
                      const filtered = filter(options, params);
                      if (params.inputValue && !options.includes(params.inputValue)) {
                        filtered.push({ inputValue: params.inputValue, name: `${t('sharedAdd')} "${params.inputValue}"` });
                      }
                      return filtered;
                    }}
                    renderOption={(props, option) => (
                      <li {...props}>{option.name ? option.name : (positionAttributes[option]?.name || option)}</li>
                    )}
                    renderInput={(params) => <TextField {...params} label={t('attributePopupInfo')} />}
                  />
                  <FormControl>
                    <InputLabel>{t('mapLiveRoutes')}</InputLabel>
                    <Select
                      label={t('mapLiveRoutes')}
                      value={attributes.mapLiveRoutes || 'none'}
                      onChange={(e) => setAttributes({ ...attributes, mapLiveRoutes: e.target.value })}
                    >
                      <MenuItem value="none">{t('sharedDisabled')}</MenuItem>
                      <MenuItem value="selected">{t('deviceSelected')}</MenuItem>
                      <MenuItem value="all">{t('notificationAlways')}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel>{t('mapDirection')}</InputLabel>
                    <Select
                      label={t('mapDirection')}
                      value={attributes.mapDirection || 'selected'}
                      onChange={(e) => setAttributes({ ...attributes, mapDirection: e.target.value })}
                    >
                      <MenuItem value="none">{t('sharedDisabled')}</MenuItem>
                      <MenuItem value="selected">{t('deviceSelected')}</MenuItem>
                      <MenuItem value="all">{t('notificationAlways')}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormGroup className={classes.fullWidth}>
                    <div className={classes.grid}>
                      <FormControlLabel
                        control={<Switch checked={attributes.mapGeofences} onChange={(e) => setAttributes({ ...attributes, mapGeofences: e.target.checked })} />}
                        label={t('sharedGeofences')}
                      />
                      <FormControlLabel
                        control={<Switch checked={attributes.mapFollow} onChange={(e) => setAttributes({ ...attributes, mapFollow: e.target.checked })} />}
                        label={t('deviceFollow')}
                      />
                      <FormControlLabel
                        control={<Switch checked={attributes.mapCluster} onChange={(e) => setAttributes({ ...attributes, mapCluster: e.target.checked })} />}
                        label={t('mapCluster')}
                      />
                      <FormControlLabel
                        control={<Switch checked={attributes.mapOnDrag} onChange={(e) => setAttributes({ ...attributes, mapOnDrag: e.target.checked })} />}
                        label={t('mapOnDrag')}
                      />
                    </div>
                  </FormGroup>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    {t('sharedDevice')}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.grid}>
                  <Autocomplete
                    className={classes.fullWidth}
                    multiple
                    options={deviceFields}
                    getOptionLabel={(option) => t(option.name)}
                    value={deviceFields.filter((f) => (attributes.devicePrimary || 'name,uniqueId').split(',').includes(f.id))}
                    onChange={(_, newValue) => setAttributes({ ...attributes, devicePrimary: newValue.map((f) => f.id).join(',') })}
                    renderInput={(params) => <TextField {...params} label={t('devicePrimaryInfo')} />}
                  />
                  <Autocomplete
                    className={classes.fullWidth}
                    multiple
                    options={deviceFields}
                    getOptionLabel={(option) => t(option.name)}
                    value={deviceFields.filter((f) => (attributes.deviceSecondary || '').split(',').includes(f.id))}
                    onChange={(_, newValue) => setAttributes({ ...attributes, deviceSecondary: newValue.map((f) => f.id).join(',') })}
                    renderInput={(params) => <TextField {...params} label={t('deviceSecondaryInfo')} />}
                  />
                  <div className={classes.grid}>
                    <FormControlLabel
                      control={<Switch checked={!attributes.hideGroupValue} onChange={(e) => setAttributes({ ...attributes, hideGroupValue: !e.target.checked })} />}
                      label={t('settingsGroupVariable')}
                    />
                  </div>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    {t('sharedSound')}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.grid}>
                  <FormGroup className={classes.fullWidth}>
                    <div className={classes.grid}>
                      <FormControlLabel
                        control={<Switch checked={attributes.soundEvents} onChange={(e) => setAttributes({ ...attributes, soundEvents: e.target.checked })} />}
                        label={t('deviceOnline')}
                      />
                      <FormControlLabel
                        control={<Switch checked={attributes.soundAlarms} onChange={(e) => setAttributes({ ...attributes, soundAlarms: e.target.checked })} />}
                        label={t('sharedAlarms')}
                      />
                    </div>
                  </FormGroup>
                  <Autocomplete
                    className={classes.fullWidth}
                    multiple
                    options={alarms}
                    getOptionLabel={(option) => option.name}
                    value={alarms.filter((f) => (attributes.soundAlarmsList || '').split(',').includes(f.key))}
                    onChange={(_, newValue) => setAttributes({ ...attributes, soundAlarmsList: newValue.map((f) => f.key).join(',') })}
                    renderInput={(params) => <TextField {...params} label={t('sharedAlarms')} />}
                  />
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    {t('userToken')}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.grid}>
                  <TextField
                    label={t('userExpirationTime')}
                    type="date"
                    value={tokenExpiration}
                    onChange={(e) => setTokenExpiration(e.target.value)}
                  />
                  <FormControl>
                    <OutlinedInput
                      multiline
                      rows={2}
                      readOnly
                      value={token || ''}
                      endAdornment={(
                        <InputAdornment position="end">
                          <IconButton size="small" edge="end" onClick={() => navigator.clipboard.writeText(token)} disabled={!token}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" edge="end" onClick={generateToken}>
                            <CachedIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      )}
                    />
                  </FormControl>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    {t('settingsAppInfo')}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.grid}>
                  <TextField
                    label={t('settingsAppVersion')}
                    value={versionApp}
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label={t('settingsServerVersion')}
                    value={versionServer}
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label={t('settingsSocketStatus')}
                    value={socket ? t('sharedConnected') : t('sharedDisconnected')}
                    InputProps={{ readOnly: true }}
                  />
                  {admin && (
                    <Button variant="outlined" color="error" onClick={handleReboot}>
                      {t('serverReboot')}
                    </Button>
                  )}
                </AccordionDetails>
              </Accordion>
              <div className={classes.buttons}>
                <Button variant="outlined" color="primary" onClick={() => navigate(-1)}>
                  {t('sharedCancel')}
                </Button>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  {t('sharedSave')}
                </Button>
              </div>
            </>
          )}
        </div>
      </Container>
    </PageLayout >
  );
};

export default PreferencesPage;
