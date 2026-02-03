const DEVICE_CACHE_KEY = 'alhaad_devices_cache';
const DEVICE_CACHE_ALL_KEY = 'alhaad_devices_cache_all';
const CACHE_VERSION_KEY = 'alhaad_devices_cache_version';
const CACHE_TIMESTAMP_KEY = 'alhaad_devices_cache_timestamp';

// Cache version - increment when data structure changes
const CURRENT_VERSION = 1;

/**
 * Get devices from local storage
 */
export const getCachedDevices = (all = false) => {
  try {
    const version = localStorage.getItem(CACHE_VERSION_KEY);
    if (version !== String(CURRENT_VERSION)) {
      clearDeviceCache();
      return null;
    }

    const cacheKey = all ? DEVICE_CACHE_ALL_KEY : DEVICE_CACHE_KEY;
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const devices = JSON.parse(cached);
    return devices;
  } catch (error) {
    console.error('Error reading device cache:', error);
    clearDeviceCache();
    return null;
  }
};

/**
 * Save devices to local storage
 */
export const setCachedDevices = (devices, all = false) => {
  try {
    const cacheKey = all ? DEVICE_CACHE_ALL_KEY : DEVICE_CACHE_KEY;
    localStorage.setItem(cacheKey, JSON.stringify(devices));
    localStorage.setItem(CACHE_VERSION_KEY, String(CURRENT_VERSION));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now());
  } catch (error) {
    console.error('Error saving device cache:', error);
  }
};

/**
 * Update a single device in cache
 */
export const updateCachedDevice = (device) => {
  try {
    const cached = getCachedDevices();
    if (!cached) return;

    const devices = Array.isArray(cached) ? cached : Object.values(cached);
    const index = devices.findIndex((d) => d.id === device.id);
    
    if (index !== -1) {
      devices[index] = { ...devices[index], ...device };
    } else {
      devices.push(device);
    }

    setCachedDevices(devices);
  } catch (error) {
    console.error('Error updating device in cache:', error);
  }
};

/**
 * Update multiple devices in cache
 */
export const updateCachedDevices = (updatedDevices) => {
  try {
    const cached = getCachedDevices();
    if (!cached) return;

    const devices = Array.isArray(cached) ? cached : Object.values(cached);
    
    updatedDevices.forEach((updatedDevice) => {
      const index = devices.findIndex((d) => d.id === updatedDevice.id);
      if (index !== -1) {
        devices[index] = { ...devices[index], ...updatedDevice };
      } else {
        devices.push(updatedDevice);
      }
    });

    setCachedDevices(devices);
  } catch (error) {
    console.error('Error updating devices in cache:', error);
  }
};

/**
 * Remove a device from cache
 */
export const removeCachedDevice = (deviceId) => {
  try {
    const cached = getCachedDevices();
    if (!cached) return;

    const devices = Array.isArray(cached) ? cached : Object.values(cached);
    const filtered = devices.filter((d) => d.id !== deviceId);
    
    setCachedDevices(filtered);
  } catch (error) {
    console.error('Error removing device from cache:', error);
  }
};

/**
 * Clear all device cache
 */
export const clearDeviceCache = () => {
  try {
    localStorage.removeItem(DEVICE_CACHE_KEY);
    localStorage.removeItem(DEVICE_CACHE_ALL_KEY);
    localStorage.removeItem(CACHE_VERSION_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Error clearing device cache:', error);
  }
};

/**
 * Get cache timestamp
 */
export const getCacheTimestamp = () => {
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.error('Error getting cache timestamp:', error);
    return null;
  }
};

/**
 * Check if cache is valid (less than 24 hours old)
 */
export const isCacheValid = () => {
  const timestamp = getCacheTimestamp();
  if (!timestamp) return false;
  
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  return (now - timestamp) < maxAge;
};
