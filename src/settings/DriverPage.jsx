import { useState } from 'react';
import {
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import useSettingsStyles from './common/useSettingsStyles';
import useDriverAttributes from '../common/attributes/useDriverAttributes';
import SelectField from '../common/components/SelectField';

const DriverPage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();
  const driverAttributes = useDriverAttributes(t);

  const [item, setItem] = useState();
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['sharedPersonal', 'sharedLicense', 'sharedCompliance', 'sharedAttributes'];

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const validate = () => activeStep === steps.length - 1 && item && item.name && item.uniqueId;

  return (
    <EditItemView
      endpoint="drivers"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedDriver']}
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
                />
                <TextField
                  value={item.attributes?.firstName || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, firstName: event.target.value } })}
                  label={t('attributeFirstName')}
                />
                <TextField
                  value={item.attributes?.lastName || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, lastName: event.target.value } })}
                  label={t('attributeLastName')}
                />
                <TextField
                  type="date"
                  value={item.attributes?.dateOfBirth || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, dateOfBirth: event.target.value } })}
                  label={t('attributeDateOfBirth')}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  value={item.attributes?.phone || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, phone: event.target.value } })}
                  label={t('sharedPhone')}
                />
                <TextField
                  value={item.attributes?.email || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, email: event.target.value } })}
                  label={t('userEmail')}
                />
              </div>
            )}

            {activeStep === 1 && (
              <div className={classes.grid}>
                <TextField
                  value={item.attributes?.licenseNumber || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, licenseNumber: event.target.value } })}
                  label={t('attributeLicenseNumber')}
                />
                <TextField
                  value={item.attributes?.licenseType || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, licenseType: event.target.value } })}
                  label={t('attributeLicenseType')}
                />
                <TextField
                  type="date"
                  value={item.attributes?.licenseExpiryDate || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, licenseExpiryDate: event.target.value } })}
                  label={t('attributeLicenseExpiry')}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  value={item.attributes?.licenseIssuingCountry || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, licenseIssuingCountry: event.target.value } })}
                  label={t('attributeLicenseCountry')}
                />
              </div>
            )}

            {activeStep === 2 && (
              <div className={classes.grid}>
                <SelectField
                  value={item.attributes?.status || 'pending'}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, status: event.target.value } })}
                  label={t('attributeDriverStatus')}
                  data={[
                    { id: 'active', name: t('deviceStatusOnline') },
                    { id: 'inactive', name: t('deviceStatusOffline') },
                    { id: 'pending', name: t('sharedLoading').replace('...', '') },
                  ]}
                />
                <SelectField
                  value={item.attributes?.driverType || 'personal'}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, driverType: event.target.value } })}
                  label={t('attributeDriverType')}
                  data={[
                    { id: 'personal', name: 'Personal' },
                    { id: 'commercial', name: 'Commercial' },
                    { id: 'fleet', name: 'Fleet' },
                  ]}
                />
                <TextField
                  value={item.attributes?.organizationId || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, organizationId: event.target.value } })}
                  label={t('attributeOrganization')}
                />
                <SelectField
                  value={item.attributes?.assignedVehicleId}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, assignedVehicleId: event.target.value } })}
                  endpoint="/api/devices"
                  label={t('attributeAssignedVehicle')}
                />
                <FormControlLabel
                  control={(
                    <Switch
                      checked={item.attributes?.licenseVerified || false}
                      onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, licenseVerified: event.target.checked } })}
                    />
                  )}
                  label={t('attributeLicenseVerified')}
                />
                <SelectField
                  value={item.attributes?.backgroundCheckStatus || 'pending'}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, backgroundCheckStatus: event.target.value } })}
                  label={t('attributeBackgroundCheck')}
                  data={[
                    { id: 'pending', name: 'Pending' },
                    { id: 'passed', name: 'Passed' },
                    { id: 'failed', name: 'Failed' },
                  ]}
                />
                <SelectField
                  value={item.attributes?.medicalClearanceStatus || 'pending'}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, medicalClearanceStatus: event.target.value } })}
                  label={t('attributeMedicalClearance')}
                  data={[
                    { id: 'pending', name: 'Pending' },
                    { id: 'passed', name: 'Passed' },
                    { id: 'failed', name: 'Failed' },
                  ]}
                />
                <TextField
                  value={item.attributes?.city || ''}
                  onChange={(event) => setItem({ ...item, attributes: { ...item.attributes, city: event.target.value } })}
                  label={t('sharedCity')}
                />
              </div>
            )}

            {activeStep === 3 && (
              <EditAttributesAccordion
                attributes={item.attributes}
                setAttributes={(attributes) => setItem({ ...item, attributes })}
                definitions={driverAttributes}
              />
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
    </EditItemView>
  );
};

export default DriverPage;
