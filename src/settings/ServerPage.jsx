import { useState } from 'react';
import TextField from '@mui/material/TextField';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  FormControl,
  Container,
  Switch,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MuiFileInput } from 'mui-file-input';
import { sessionActions } from '../store';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import { useTranslation } from '../common/components/LocalizationProvider';
import SelectField from '../common/components/SelectField';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import useCommonDeviceAttributes from '../common/attributes/useCommonDeviceAttributes';
import useCommonUserAttributes from '../common/attributes/useCommonUserAttributes';
import { useCatch } from '../reactHelper';
import useServerAttributes from '../common/attributes/useServerAttributes';
import useMapStyles from '../map/core/useMapStyles';
import { map } from '../map/core/MapView';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const ServerPage = () => {
  const { classes } = useSettingsStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const mapStyles = useMapStyles();
  const commonUserAttributes = useCommonUserAttributes(t);
  const commonDeviceAttributes = useCommonDeviceAttributes(t);
  const serverAttributes = useServerAttributes(t);

  const original = useSelector((state) => state.session.server);
  const [item, setItem] = useState({ ...original });

  const handleFileChange = useCatch(async (newFile) => {
    if (newFile) {
      await fetchOrThrow(`/api/server/file/${newFile.name}`, {
        method: 'POST',
        body: newFile,
      });
    }
  });

  const handleSave = useCatch(async () => {
    const response = await fetchOrThrow('/api/server', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    dispatch(sessionActions.updateServer(await response.json()));
    navigate(-1);
  });

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsServer']}>
      <Container maxWidth="lg" className={classes.container}>
        <div className={classes.content}>
          {item && (
            <>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    {t('sharedPreferences')}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.grid}>
                  <TextField
                    className={classes.fullWidth}
                    value={item.mapUrl || ''}
                    onChange={(event) => setItem({ ...item, mapUrl: event.target.value })}
                    label={t('mapCustomLabel')}
                  />
                  <TextField
                    className={classes.fullWidth}
                    value={item.overlayUrl || ''}
                    onChange={(event) => setItem({ ...item, overlayUrl: event.target.value })}
                    label={t('mapOverlayCustom')}
                  />
                  <FormControl>
                    <InputLabel>{t('mapDefault')}</InputLabel>
                    <Select
                      label={t('mapDefault')}
                      value={item.map || 'locationIqStreets'}
                      onChange={(e) => setItem({ ...item, map: e.target.value })}
                    >
                      {mapStyles.filter((style) => style.available).map((style) => (
                        <MenuItem key={style.id} value={style.id}>
                          <Typography component="span">{style.title}</Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel>{t('settingsCoordinateFormat')}</InputLabel>
                    <Select
                      label={t('settingsCoordinateFormat')}
                      value={item.coordinateFormat || 'dd'}
                      onChange={(event) => setItem({ ...item, coordinateFormat: event.target.value })}
                    >
                      <MenuItem value="dd">{t('sharedDecimalDegrees')}</MenuItem>
                      <MenuItem value="ddm">{t('sharedDegreesDecimalMinutes')}</MenuItem>
                      <MenuItem value="dms">{t('sharedDegreesMinutesSeconds')}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel>{t('settingsSpeedUnit')}</InputLabel>
                    <Select
                      label={t('settingsSpeedUnit')}
                      value={item.attributes.speedUnit || 'kn'}
                      onChange={(e) => setItem({ ...item, attributes: { ...item.attributes, speedUnit: e.target.value } })}
                    >
                      <MenuItem value="kn">{t('sharedKn')}</MenuItem>
                      <MenuItem value="kmh">{t('sharedKmh')}</MenuItem>
                      <MenuItem value="mph">{t('sharedMph')}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel>{t('settingsDistanceUnit')}</InputLabel>
                    <Select
                      label={t('settingsDistanceUnit')}
                      value={item.attributes.distanceUnit || 'km'}
                      onChange={(e) => setItem({ ...item, attributes: { ...item.attributes, distanceUnit: e.target.value } })}
                    >
                      <MenuItem value="km">{t('sharedKm')}</MenuItem>
                      <MenuItem value="mi">{t('sharedMi')}</MenuItem>
                      <MenuItem value="nmi">{t('sharedNmi')}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel>{t('settingsAltitudeUnit')}</InputLabel>
                    <Select
                      label={t('settingsAltitudeUnit')}
                      value={item.attributes.altitudeUnit || 'm'}
                      onChange={(e) => setItem({ ...item, attributes: { ...item.attributes, altitudeUnit: e.target.value } })}
                    >
                      <MenuItem value="m">{t('sharedMeters')}</MenuItem>
                      <MenuItem value="ft">{t('sharedFeet')}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel>{t('settingsVolumeUnit')}</InputLabel>
                    <Select
                      label={t('settingsVolumeUnit')}
                      value={item.attributes.volumeUnit || 'ltr'}
                      onChange={(e) => setItem({ ...item, attributes: { ...item.attributes, volumeUnit: e.target.value } })}
                    >
                      <MenuItem value="ltr">{t('sharedLiter')}</MenuItem>
                      <MenuItem value="usGal">{t('sharedUsGallon')}</MenuItem>
                      <MenuItem value="impGal">{t('sharedImpGallon')}</MenuItem>
                    </Select>
                  </FormControl>
                  <SelectField
                    className={classes.fullWidth}
                    value={item.attributes.timezone}
                    onChange={(e) => setItem({ ...item, attributes: { ...item.attributes, timezone: e.target.value } })}
                    endpoint="/api/server/timezones"
                    keyGetter={(it) => it}
                    titleGetter={(it) => it}
                    label={t('sharedTimezone')}
                  />
                  <TextField
                    className={classes.fullWidth}
                    value={item.poiLayer || ''}
                    onChange={(event) => setItem({ ...item, poiLayer: event.target.value })}
                    label={t('mapPoiLayer')}
                  />
                  <TextField
                    className={classes.fullWidth}
                    value={item.announcement || ''}
                    onChange={(event) => setItem({ ...item, announcement: event.target.value })}
                    label={t('serverAnnouncement')}
                  />
                  <FormControlLabel
                    control={<Switch checked={item.forceSettings} onChange={(event) => setItem({ ...item, forceSettings: event.target.checked })} />}
                    label={t('serverForceSettings')}
                  />
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    {t('sharedLocation')}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.grid}>
                  <TextField
                    type="number"
                    value={item.latitude || 0}
                    onChange={(event) => setItem({ ...item, latitude: Number(event.target.value) })}
                    label={t('positionLatitude')}
                  />
                  <TextField
                    type="number"
                    value={item.longitude || 0}
                    onChange={(event) => setItem({ ...item, longitude: Number(event.target.value) })}
                    label={t('positionLongitude')}
                  />
                  <TextField
                    type="number"
                    value={item.zoom || 0}
                    onChange={(event) => setItem({ ...item, zoom: Number(event.target.value) })}
                    label={t('serverZoom')}
                  />
                  <Button
                    className={classes.fullWidth}
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      const { lng, lat } = map.getCenter();
                      setItem({
                        ...item,
                        latitude: Number(lat.toFixed(6)),
                        longitude: Number(lng.toFixed(6)),
                        zoom: Number(map.getZoom().toFixed(1)),
                      });
                    }}
                  >
                    {t('mapCurrentLocation')}
                  </Button>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    {t('sharedPermissions')}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.grid}>
                  <FormGroup className={classes.fullWidth}>
                    <div className={classes.grid}>
                      <FormControlLabel
                        control={<Switch checked={item.registration} onChange={(event) => setItem({ ...item, registration: event.target.checked })} />}
                        label={t('serverRegistration')}
                      />
                      <FormControlLabel
                        control={<Switch checked={item.readonly} onChange={(event) => setItem({ ...item, readonly: event.target.checked })} />}
                        label={t('serverReadonly')}
                      />
                      <FormControlLabel
                        control={<Switch checked={item.deviceReadonly} onChange={(event) => setItem({ ...item, deviceReadonly: event.target.checked })} />}
                        label={t('userDeviceReadonly')}
                      />
                      <FormControlLabel
                        control={<Switch checked={item.limitCommands} onChange={(event) => setItem({ ...item, limitCommands: event.target.checked })} />}
                        label={t('userLimitCommands')}
                      />
                      <FormControlLabel
                        control={<Switch checked={item.disableReports} onChange={(event) => setItem({ ...item, disableReports: event.target.checked })} />}
                        label={t('userDisableReports')}
                      />
                    </div>
                  </FormGroup>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    {t('sharedExtra')}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.grid}>
                  <MuiFileInput
                    placeholder={t('settingsLogo')}
                    onChange={handleFileChange}
                    inputProps={{ accept: 'image/*' }}
                  />
                  <MuiFileInput
                    placeholder={t('settingsLogoInverted')}
                    onChange={handleFileChange}
                    inputProps={{ accept: 'image/*' }}
                  />
                </AccordionDetails>
              </Accordion>
              <EditAttributesAccordion
                attributes={item.attributes}
                setAttributes={(attributes) => setItem({ ...item, attributes })}
                definitions={{ ...commonUserAttributes, ...commonDeviceAttributes, ...serverAttributes }}
              />
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
    </PageLayout>
  );
};

export default ServerPage;
