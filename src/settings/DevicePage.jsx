import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { MuiFileInput } from 'mui-file-input';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import SelectField from '../common/components/SelectField';
import deviceCategories from '../common/util/deviceCategories';
import { useTranslation } from '../common/components/LocalizationProvider';
import useDeviceAttributes from '../common/attributes/useDeviceAttributes';
import { useAdministrator } from '../common/util/permissions';
import SettingsMenu from './components/SettingsMenu';
import useCommonDeviceAttributes from '../common/attributes/useCommonDeviceAttributes';
import { useCatch } from '../reactHelper';
import useSettingsStyles from './common/useSettingsStyles';
import QrCodeDialog from '../common/components/QrCodeDialog';
import fetchOrThrow from '../common/util/fetchOrThrow';
import countries from '../common/util/countries';

const DevicePage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const admin = useAdministrator();

  const commonDeviceAttributes = useCommonDeviceAttributes(t);
  const deviceAttributes = useDeviceAttributes(t);

  const [searchParams] = useSearchParams();
  const uniqueId = searchParams.get('uniqueId');

  const [item, setItem] = useState(uniqueId ? { uniqueId } : null);
  const [showQr, setShowQr] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (item && !item.expirationTime) {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      setItem({ ...item, expirationTime: date.toISOString() });
    }
  }, [item]);

  const handleFileInput = useCatch(async (newFile) => {
    setImageFile(newFile);
    if (newFile && item?.id) {
      const response = await fetchOrThrow(`/api/devices/${item.id}/image`, {
        method: 'POST',
        body: newFile,
      });
      setItem({ ...item, attributes: { ...item.attributes, deviceImage: await response.text() } });
    } else if (!newFile) {
      // eslint-disable-next-line no-unused-vars
      const { deviceImage, ...remainingAttributes } = item.attributes || {};
      setItem({ ...item, attributes: remainingAttributes });
    }
  });

  const [activeStep, setActiveStep] = useState(0);

  const deviceType = item?.attributes?.deviceType || 'obd';
  const isMobile = deviceType === 'mobile_app';

  const steps = [
    'sharedRequired',
    isMobile ? 'sharedPlatformInfo' : 'sharedDeviceSpecs',
    ...(!isMobile ? ['sharedVehicleSpecs'] : []),
    'sharedExtra',
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validate = () => activeStep === steps.length - 1 && item && item.name && item.uniqueId && item.expirationTime;

  return (
    <EditItemView
      endpoint="devices"
      item={item}
      setItem={setItem}
      defaultItem={{
        expirationTime: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      }}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedDevice']}
    >
      {item && (
        <div className={classes.content}>
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
                  value={item.name || ''}
                  onChange={(event) => setItem({ ...item, name: event.target.value })}
                  label={t('sharedName')}
                />
                <TextField
                  value={item.uniqueId || ''}
                  onChange={(event) => setItem({ ...item, uniqueId: event.target.value })}
                  label={t('deviceIdentifier')}
                  helperText={t('deviceIdentifierHelp')}
                  disabled={Boolean(uniqueId)}
                />
                <SelectField
                  value={deviceType}
                  onChange={(event) => {
                    setItem({ ...item, attributes: { ...item.attributes, deviceType: event.target.value } });
                    setActiveStep(0);
                  }}
                  label={t('settingsType')}
                  data={[
                    { id: 'obd', name: 'OBD' },
                    { id: 'hardwired', name: 'Hardwired' },
                    { id: 'mobile_app', name: 'Mobile App' },
                    { id: 'dashcam', name: 'Dashcam' },
                    { id: 'canbus', name: 'Canbus' },
                  ]}
                />

                <TextField
                  label={t('userExpirationTime')}
                  type="date"
                  required
                  value={item.expirationTime ? item.expirationTime.split('T')[0] : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setItem({ ...item, expirationTime: new Date(e.target.value).toISOString() });
                    }
                  }}
                  disabled={!admin}
                />
              </div>
            )}

            {activeStep === 1 && !isMobile && (
              <div className={classes.grid}>
                <TextField
                  value={item.attributes?.serialNumber || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, serialNumber: event.target.value } })}
                  label={t('attributeSerialNumber')}
                />
                <TextField
                  value={item.attributes?.manufacturer || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, manufacturer: event.target.value } })}
                  label="Manufacturer"
                />
                <TextField
                  value={item.model || ''}
                  onChange={(event) => setItem({ ...item, model: event.target.value })}
                  label={t('deviceModel')}
                />
                <TextField
                  value={item.attributes?.firmwareVersion || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, firmwareVersion: event.target.value } })}
                  label={t('attributeFirmware')}
                />
                <SelectField
                  value={item.attributes?.powerSource || 'obd_port'}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, powerSource: event.target.value } })}
                  label={t('attributePowerSource')}
                  data={[
                    { id: 'obd_port', name: 'OBD Port' },
                    { id: 'vehicle_battery', name: 'Vehicle Battery' },
                    { id: 'internal_battery', name: 'Internal Battery' },
                    { id: 'phone', name: 'Phone' },
                  ]}
                />
                <SelectField
                  value={item.attributes?.connectivityType || 'cellular'}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, connectivityType: event.target.value } })}
                  label={t('attributeConnectivity')}
                  data={[
                    { id: 'cellular', name: 'Cellular' },
                    { id: 'wifi', name: 'WiFi' },
                    { id: 'bluetooth', name: 'Bluetooth' },
                    { id: 'gps_only', name: 'GPS Only' },
                  ]}
                />
                <TextField
                  value={item.attributes?.imei || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, imei: event.target.value } })}
                  label="IMEI"
                />
                <TextField
                  value={item.attributes?.macAddress || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, macAddress: event.target.value } })}
                  label={t('attributeMacAddress')}
                />
                <SelectField
                  value={item.status || 'inactive'}
                  onChange={(event) => setItem({ ...item, status: event.target.value })}
                  label={t('sharedStatus')}
                  data={[
                    { id: 'prebound', name: 'Prebound' },
                    { id: 'inactive', name: t('deviceStatusOffline') },
                    { id: 'active', name: t('deviceStatusOnline') },
                  ]}
                />
              </div>
            )}

            {activeStep === 1 && isMobile && (
              <div className={classes.grid}>
                <SelectField
                  value={item.attributes?.platform || 'android'}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, platform: event.target.value } })}
                  label="Platform"
                  data={[
                    { id: 'android', name: 'Android' },
                    { id: 'ios', name: 'iOS' },
                  ]}
                />
                <TextField
                  value={item.attributes?.manufacturer || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, manufacturer: event.target.value } })}
                  label="Manufacturer"
                />
                <TextField
                  value={item.attributes?.model || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, model: event.target.value } })}
                  label="Model"
                />
                <TextField
                  value={item.attributes?.osVersion || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, osVersion: event.target.value } })}
                  label={t('attributePlatformVersion')}
                />
                <TextField
                  value={item.attributes?.deviceUuid || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, deviceUuid: event.target.value } })}
                  label={t('attributeDeviceUuid')}
                />
                <TextField
                  value={item.attributes?.imei || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, imei: event.target.value } })}
                  label="IMEI"
                />
              </div>
            )}

            {activeStep === 2 && !isMobile && (
              <div className={classes.grid}>
                <TextField
                  value={item.attributes?.vehicleRegistration || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, vehicleRegistration: event.target.value } })}
                  label={t('attributeVehicleRegistration')}
                />
                <SelectField
                  value={item.attributes?.vehicleType || 'car'}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, vehicleType: event.target.value } })}
                  data={deviceCategories.map((category) => ({
                    id: category,
                    name: t(`category${category.replace(/^\w/, (c) => c.toUpperCase())}`),
                  })).sort((a, b) => a.name.localeCompare(b.name))}
                  label={t('attributeVehicleType')}
                />
                <TextField
                  value={item.attributes?.vehicleMake || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, vehicleMake: event.target.value } })}
                  label={t('attributeVehicleMake')}
                />
                <TextField
                  value={item.attributes?.model || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, model: event.target.value } })}
                  label={t('deviceModel')}
                />
                <TextField
                  value={item.attributes?.modelYear || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, modelYear: event.target.value } })}
                  label={t('attributeModelYear')}
                />
                <TextField
                  value={item.attributes?.color || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, color: event.target.value } })}
                  label={t('attributeColor')}
                />
                <SelectField
                  value={item.attributes?.fuelType || 'petrol'}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, fuelType: event.target.value } })}
                  label={t('attributeFuelType')}
                  data={[
                    { id: 'petrol', name: 'Petrol' },
                    { id: 'diesel', name: 'Diesel' },
                    { id: 'electric', name: 'Electric' },
                    { id: 'hybrid', name: 'Hybrid' },
                  ]}
                />
                <TextField
                  value={item.attributes?.engineCapacity || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, engineCapacity: event.target.value } })}
                  label={t('attributeEngineCapacity')}
                />
                <TextField
                  value={item.attributes?.vin || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, vin: event.target.value } })}
                  label={t('attributeVin')}
                />
                <TextField
                  value={item.attributes?.organizationId || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, organizationId: event.target.value } })}
                  label={t('attributeOrganization')}
                />
                <SelectField
                  value={item.attributes?.countryOfRegistration || 'Pakistan'}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, countryOfRegistration: event.target.value } })}
                  label={t('attributeCountryRegistration')}
                  data={countries}
                />
              </div>
            )}

            {activeStep === (isMobile ? 2 : 3) && (
              <div className={classes.grid}>
                <SelectField
                  value={item.groupId}
                  onChange={(event) => setItem({ ...item, groupId: Number(event.target.value) })}
                  endpoint="/api/groups"
                  label={t('groupParent')}
                />
                <TextField
                  value={item.phone || ''}
                  onChange={(event) => setItem({ ...item, phone: event.target.value })}
                  label={t('sharedPhone')}
                />
                <TextField
                  value={item.contact || ''}
                  onChange={(event) => setItem({ ...item, contact: event.target.value })}
                  label={t('deviceContact')}
                />
                <SelectField
                  value={item.category || 'default'}
                  onChange={(event) => setItem({ ...item, category: event.target.value })}
                  data={deviceCategories.map((category) => ({
                    id: category,
                    name: t(`category${category.replace(/^\w/, (c) => c.toUpperCase())}`),
                  })).sort((a, b) => a.name.localeCompare(b.name))}
                  label={t('deviceCategory')}
                />
                <SelectField
                  value={item.calendarId}
                  onChange={(event) => setItem({ ...item, calendarId: Number(event.target.value) })}
                  endpoint="/api/calendars"
                  label={t('sharedCalendar')}
                />

                <div className={classes.row}>
                  <FormControlLabel
                    control={<Switch checked={item.disabled} onChange={(event) => setItem({ ...item, disabled: event.target.checked })} />}
                    label={t('sharedDisabled')}
                    disabled={!admin}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowQr(true)}
                    sx={{ color: 'common.white' }}
                  >
                    {t('sharedQrCode')}
                  </Button>
                </div>
                {item.id && (
                  <MuiFileInput
                    className={classes.fullWidth}
                    placeholder={t('attributeDeviceImage')}
                    value={imageFile}
                    onChange={handleFileInput}
                    inputProps={{ accept: 'image/*' }}
                  />
                )}
              </div>
            )}


          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, gap: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: '12px',
                padding: '10px 24px',
                textTransform: 'none',
                fontWeight: 'bold',
                '&.Mui-disabled': {
                  borderColor: 'rgba(0, 0, 0, 0.12)',
                  color: 'rgba(0, 0, 0, 0.26)',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              {t('sharedBack')}
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={activeStep === 0 && (!item.name || !item.uniqueId)}
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
            ) : null}
          </Box>
        </div>
      )}
      <QrCodeDialog open={showQr} onClose={() => setShowQr(false)} />
    </EditItemView>
  );
};

export default DevicePage;
