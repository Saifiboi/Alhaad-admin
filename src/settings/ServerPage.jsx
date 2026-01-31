import { useState, useContext, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import {
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
  Stepper,
  Step,
  StepLabel,
  Box,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { sessionActions } from '../store';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import { useTranslation } from '../common/components/LocalizationProvider';
import SelectField from '../common/components/SelectField';
import WindowModeContext from '../common/components/WindowModeContext';
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

  const { isWindow, onClose } = useContext(WindowModeContext);

  const location = useLocation();
  const handleBack = useCallback(() => {
    if (location.key !== 'default') {
      navigate(-1);
    } else if (isWindow && onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  }, [isWindow, onClose, navigate, location.key]);

  const handleSave = useCatch(async () => {
    const response = await fetchOrThrow('/api/server', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    dispatch(sessionActions.updateServer(await response.json()));
    handleBack();
  });

  const [activeStep, setActiveStep] = useState(0);
  const steps = ['sharedPreferences', 'sharedLocation', 'sharedPermissions', 'sharedFile', 'sharedAttributes'];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBackStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsServer']}>
      <Container maxWidth="lg" className={classes.container}>
        <div className={classes.content}>
          {item && (
            <>
              <Box sx={{ mb: 4 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{t(label)}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <Box sx={{ mt: 2, mb: 4 }}>
                {activeStep === 0 && (
                  <div className={classes.grid}>
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
                  </div>
                )}

                {activeStep === 1 && (
                  <div className={classes.grid}>
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
                      variant="contained"
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
                      sx={{ color: 'common.white' }}
                    >
                      {t('mapCurrentLocation')}
                    </Button>
                  </div>
                )}

                {activeStep === 2 && (
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
                )}

                {activeStep === 3 && (
                  <div className={classes.grid}>
                    <Button
                      variant="contained"
                      color="primary"
                      component="label"
                      sx={{ color: 'common.white' }}
                    >
                      {t('sharedSelectFile')}
                      <input
                        type="file"
                        hidden
                        onChange={(e) => handleFileChange(e.target.files[0])}
                      />
                    </Button>
                  </div>
                )}

                {activeStep === 4 && (
                  <EditAttributesAccordion
                    attributes={item.attributes}
                    setAttributes={(attributes) => setItem({ ...item, attributes })}
                    definitions={{ ...commonUserAttributes, ...commonDeviceAttributes, ...serverAttributes }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, gap: 2 }}>
                {activeStep === 0 ? (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleBack}
                    startIcon={<CloseIcon />}
                    sx={{
                      borderRadius: '12px',
                      padding: '10px 24px',
                      textTransform: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    {t('sharedCancel')}
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleBackStep}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      borderRadius: '12px',
                      padding: '10px 24px',
                      textTransform: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    {t('sharedBack')}
                  </Button>
                )}
                <Box sx={{ flex: '1 1 auto' }} />
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      borderRadius: '12px',
                      padding: '10px 24px',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 14px 0 rgba(249, 115, 22, 0.39)',
                      color: 'common.white',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(249, 115, 22, 0.23)',
                      },
                    }}
                  >
                    {t('sharedNext')}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    startIcon={<SaveIcon />}
                    sx={{
                      borderRadius: '12px',
                      padding: '10px 24px',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 14px 0 rgba(249, 115, 22, 0.39)',
                      color: 'common.white',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(249, 115, 22, 0.23)',
                      },
                    }}
                  >
                    {t('sharedSave')}
                  </Button>
                )}
              </Box>
            </>
          )}
        </div>
      </Container>
    </PageLayout>
  );
};

export default ServerPage;
