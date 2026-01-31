import {
  Switch,
  OutlinedInput,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';


import { useTranslation } from '../../common/components/LocalizationProvider';
import { useAttributePreference } from '../../common/util/preferences';
import {
  distanceFromMeters, distanceToMeters, distanceUnitString, speedFromKnots, speedToKnots, speedUnitString, volumeFromLiters, volumeToLiters, volumeUnitString,
} from '../../common/util/converter';
import useFeatures from '../../common/util/useFeatures';
import useSettingsStyles from '../common/useSettingsStyles';

const EditAttributesAccordion = ({ attributes, setAttributes, definitions, focusAttribute }) => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const features = useFeatures();

  const speedUnit = useAttributePreference('speedUnit');
  const distanceUnit = useAttributePreference('distanceUnit');
  const volumeUnit = useAttributePreference('volumeUnit');



  const updateAttribute = (key, value, type, subtype) => {
    const updatedAttributes = { ...attributes };
    switch (subtype) {
      case 'speed':
        updatedAttributes[key] = speedToKnots(Number(value), speedUnit);
        break;
      case 'distance':
        updatedAttributes[key] = distanceToMeters(Number(value), distanceUnit);
        break;
      case 'volume':
        updatedAttributes[key] = volumeToLiters(Number(value), volumeUnit);
        break;
      default:
        updatedAttributes[key] = type === 'number' ? Number(value) : value;
        break;
    }
    setAttributes(updatedAttributes);
  };

  const deleteAttribute = (key) => {
    const updatedAttributes = { ...attributes };
    delete updatedAttributes[key];
    setAttributes(updatedAttributes);
  };

  const getAttributeName = (key, subtype) => {
    const definition = definitions[key];
    const name = definition ? definition.name : key;
    switch (subtype) {
      case 'speed':
        return `${name} (${speedUnitString(speedUnit, t)})`;
      case 'distance':
        return `${name} (${distanceUnitString(distanceUnit, t)})`;
      case 'volume':
        return `${name} (${volumeUnitString(volumeUnit, t)})`;
      default:
        return name;
    }
  };

  const getAttributeType = (value) => {
    if (typeof value === 'number') {
      return 'number';
    } if (typeof value === 'boolean') {
      return 'boolean';
    }
    return 'string';
  };

  const getAttributeSubtype = (key) => {
    const definition = definitions[key];
    return definition && definition.subtype;
  };

  const getDisplayValue = (value, subtype) => {
    if (value) {
      switch (subtype) {
        case 'speed':
          return speedFromKnots(value, speedUnit);
        case 'distance':
          return distanceFromMeters(value, distanceUnit);
        case 'volume':
          return volumeFromLiters(value, volumeUnit);
        default:
          return value;
      }
    }
    return '';
  };

  const convertToList = (attributes) => {
    const booleanList = [];
    const otherList = [];
    const excludeAttributes = ['speedUnit', 'distanceUnit', 'altitudeUnit', 'volumeUnit', 'timezone'];
    Object.keys(attributes || []).filter((key) => !excludeAttributes.includes(key)).forEach((key) => {
      const value = attributes[key];
      const type = getAttributeType(value);
      const subtype = getAttributeSubtype(key);
      if (type === 'boolean') {
        booleanList.push({
          key, value, type, subtype,
        });
      } else {
        otherList.push({
          key, value, type, subtype,
        });
      }
    });
    return [...otherList, ...booleanList];
  };



  return features.disableAttributes ? '' : (
    <>
      <div className={classes.grid}>
        {convertToList(attributes).map(({
          key, value, type, subtype,
        }) => {
          if (type === 'boolean') {
            return (
              <div key={key} className={classes.row} style={{ alignItems: 'center' }}>
                <FormControlLabel
                  control={(
                    <Switch
                      checked={value}
                      onChange={(e) => updateAttribute(key, e.target.checked)}
                    />
                  )}
                  label={getAttributeName(key, subtype)}
                  sx={{ flexGrow: 1 }}
                />
                <IconButton size="small" className={classes.removeButton} onClick={() => deleteAttribute(key)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
            );
          }
          return (
            <FormControl key={key} fullWidth>
              <InputLabel>{getAttributeName(key, subtype)}</InputLabel>
              <OutlinedInput
                label={getAttributeName(key, subtype)}
                type={type === 'number' ? 'number' : 'text'}
                value={getDisplayValue(value, subtype)}
                onChange={(e) => updateAttribute(key, e.target.value, type, subtype)}
                autoFocus={focusAttribute === key}
                endAdornment={(
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end" onClick={() => deleteAttribute(key)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )}
              />
            </FormControl>
          );
        })}

      </div>
    </>
  );
};

export default EditAttributesAccordion;
