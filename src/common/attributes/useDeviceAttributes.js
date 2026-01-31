import { useMemo } from 'react';

export default (t) => useMemo(() => ({
  'command.sender': {
    name: t('deviceCommandSender'),
    type: 'string',
  },
  'web.reportColor': {
    name: t('attributeWebReportColor'),
    type: 'string',
    subtype: 'color',
  },
  devicePassword: {
    name: t('attributeDevicePassword'),
    type: 'string',
  },
  deviceImage: {
    name: t('attributeDeviceImage'),
    type: 'string',
  },
  'processing.copyAttributes': {
    name: t('attributeProcessingCopyAttributes'),
    type: 'string',
  },
  'decoder.timezone': {
    name: t('sharedTimezone'),
    type: 'string',
  },
  'forward.url': {
    name: t('attributeForwardUrl'),
    type: 'string',
  },
  color: {
    name: t('attributeColor'),
    type: 'string',
    subtype: 'color',
  },
  vehicleRegistration: {
    name: t('attributeVehicleRegistration'),
    type: 'string',
  },
  vehicleMake: {
    name: t('attributeVehicleMake'),
    type: 'string',
  },
  vehicleType: {
    name: t('attributeVehicleType'),
    type: 'string',
  },
  serialNumber: {
    name: t('attributeSerialNumber'),
    type: 'string',
  },
  firmwareVersion: {
    name: t('attributeFirmware'),
    type: 'string',
  },
  powerSource: {
    name: t('attributePowerSource'),
    type: 'string',
  },
  connectivityType: {
    name: t('attributeConnectivity'),
    type: 'string',
  },
  macAddress: {
    name: t('attributeMacAddress'),
    type: 'string',
  },
  modelYear: {
    name: t('attributeModelYear'),
    type: 'string',
  },
  fuelType: {
    name: t('attributeFuelType'),
    type: 'string',
  },
  engineCapacity: {
    name: t('attributeEngineCapacity'),
    type: 'string',
  },
  vin: {
    name: t('attributeVin'),
    type: 'string',
  },
  countryOfRegistration: {
    name: t('attributeCountryRegistration'),
    type: 'string',
  },
  platform: {
    name: t('sharedPreferences'),
    type: 'string',
  },
  osVersion: {
    name: t('attributePlatformVersion'),
    type: 'string',
  },
  deviceUuid: {
    name: t('attributeDeviceUuid'),
    type: 'string',
  },
}), [t]);
