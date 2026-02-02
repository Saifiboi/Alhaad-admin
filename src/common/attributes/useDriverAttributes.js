import { useMemo } from 'react';

export default (t) => useMemo(() => ({
    firstName: {
        name: t('attributeFirstName'),
        type: 'string',
    },
    lastName: {
        name: t('attributeLastName'),
        type: 'string',
    },
    dateOfBirth: {
        name: t('attributeDateOfBirth'),
        type: 'string',
    },
    licenseNumber: {
        name: t('attributeLicenseNumber'),
        type: 'string',
    },
    licenseType: {
        name: t('attributeLicenseType'),
        type: 'string',
    },
    licenseExpiryDate: {
        name: t('attributeLicenseExpiry'),
        type: 'string',
    },
    licenseIssuingCountry: {
        name: t('attributeLicenseCountry'),
        type: 'string',
    },
    status: {
        name: t('attributeDriverStatus'),
        type: 'string',
    },
    driverType: {
        name: t('attributeDriverType'),
        type: 'string',
    },
    organizationId: {
        name: t('attributeOrganization'),
        type: 'string',
    },
    assignedVehicleId: {
        name: t('attributeAssignedVehicle'),
        type: 'string',
    },
    licenseVerified: {
        name: t('attributeLicenseVerified'),
        type: 'boolean',
    },
    backgroundCheckStatus: {
        name: t('attributeBackgroundCheck'),
        type: 'string',
    },
    medicalClearanceStatus: {
        name: t('attributeMedicalClearance'),
        type: 'string',
    },
}), [t]);
