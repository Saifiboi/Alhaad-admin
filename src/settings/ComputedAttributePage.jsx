import { useState } from 'react';
import {
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  createFilterOptions,
  Autocomplete,
  Button,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  Box,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditItemView from './components/EditItemView';
import { useTranslation } from '../common/components/LocalizationProvider';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import SettingsMenu from './components/SettingsMenu';
import SelectField from '../common/components/SelectField';
import { useCatch } from '../reactHelper';
import { snackBarDurationLongMs } from '../common/util/duration';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const allowedProperties = ['valid', 'latitude', 'longitude', 'altitude', 'speed', 'course', 'address', 'accuracy'];

const ComputedAttributePage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);

  const [item, setItem] = useState();
  const [deviceId, setDeviceId] = useState();
  const [result, setResult] = useState();
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['sharedRequired', 'sharedExtra', 'sharedTest'];

  const options = Object.entries(positionAttributes).filter(([key, value]) => !value.property || allowedProperties.includes(key)).map(([key, value]) => ({
    key,
    name: value.name,
    type: value.type,
  }));

  const filter = createFilterOptions({
    stringify: (option) => option.name,
  });

  const testAttribute = useCatch(async () => {
    const query = new URLSearchParams({ deviceId });
    const url = `/api/attributes/computed/test?${query.toString()}`;
    const response = await fetchOrThrow(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    setResult(await response.text());
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const validate = () => activeStep === steps.length - 1 && item && item.description && item.expression;

  return (
    <EditItemView
      endpoint="attributes/computed"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedComputedAttribute']}
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
                  value={item.description || ''}
                  onChange={(e) => setItem({ ...item, description: e.target.value })}
                  label={t('sharedDescription')}
                />
                <Autocomplete
                  freeSolo
                  value={options.find((option) => option.key === item.attribute) || item.attribute || null}
                  onChange={(_, option) => {
                    const attribute = option ? option.key || option.inputValue || option : null;
                    if (option && (option.type || option.inputValue)) {
                      setItem({ ...item, attribute, type: option.type });
                    } else {
                      setItem({ ...item, attribute });
                    }
                  }}
                  filterOptions={(options, params) => {
                    const filtered = filter(options, params);
                    if (params.inputValue && !options.some((x) => (typeof x === 'object' ? x.key : x) === params.inputValue)) {
                      filtered.push({ inputValue: params.inputValue, name: `${t('sharedAdd')} "${params.inputValue}"` });
                    }
                    return filtered;
                  }}
                  options={options}
                  getOptionLabel={(option) => typeof option === 'object' ? option.inputValue || option.name : option}
                  renderOption={(props, option) => <li {...props}>{option.name || option}</li>}
                  renderInput={(params) => <TextField {...params} label={t('sharedAttribute')} />}
                />
                <TextField
                  className={classes.fullWidth}
                  value={item.expression || ''}
                  onChange={(e) => setItem({ ...item, expression: e.target.value })}
                  label={t('sharedExpression')}
                  multiline
                  rows={4}
                />
                <FormControl disabled={item.attribute in positionAttributes}>
                  <InputLabel>{t('sharedType')}</InputLabel>
                  <Select
                    label={t('sharedType')}
                    value={item.type || ''}
                    onChange={(e) => setItem({ ...item, type: e.target.value })}
                  >
                    <MenuItem value="string">{t('sharedTypeString')}</MenuItem>
                    <MenuItem value="number">{t('sharedTypeNumber')}</MenuItem>
                    <MenuItem value="boolean">{t('sharedTypeBoolean')}</MenuItem>
                  </Select>
                </FormControl>
              </div>
            )}

            {activeStep === 1 && (
              <div className={classes.grid}>
                <TextField
                  type="number"
                  value={item.priority || 0}
                  onChange={(e) => setItem({ ...item, priority: Number(e.target.value) })}
                  label={t('sharedPriority')}
                />
              </div>
            )}

            {activeStep === 2 && (
              <div className={classes.grid}>
                <SelectField
                  value={deviceId}
                  onChange={(e) => setDeviceId(Number(e.target.value))}
                  endpoint="/api/devices"
                  label={t('sharedDevice')}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={testAttribute}
                  disabled={!deviceId}
                  sx={{ color: 'common.white', borderRadius: '12px' }}
                >
                  {t('sharedTestExpression')}
                </Button>
                <Snackbar
                  open={!!result}
                  onClose={() => setResult(null)}
                  autoHideDuration={snackBarDurationLongMs}
                  message={result}
                />
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
              }}
            >
              {t('sharedBack')}
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={activeStep === 0 && (!item.description || !item.expression)}
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

export default ComputedAttributePage;
