import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Button, FormControlLabel, Switch, Card, CardContent, Typography, Box, IconButton, Chip
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import TruckLoader from '../common/components/TruckLoader';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import { formatStatus, formatTime } from '../common/util/formatter';
import { useDeviceReadonly, useManager } from '../common/util/permissions';
import DeviceUsersValue from './components/DeviceUsersValue';
import usePersistedState from '../common/util/usePersistedState';
import fetchOrThrow from '../common/util/fetchOrThrow';
import AddressValue from '../common/components/AddressValue';
import exportExcel from '../common/util/exportExcel';
import RemoveDialog from '../common/components/RemoveDialog';

const DeviceCard = ({
  item,
  positions,
  manager,
  deviceReadonly,
  t,
  onConnections,
  onEdit,
  onRemove,
}) => {
  const position = positions[item.id];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        width: '100%',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <CardContent sx={{ p: '16px !important' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem' }}>
                {item.name}
              </Typography>
              <Chip
                size="small"
                label={formatStatus(item.status, t)}
                sx={{
                  height: 20,
                  fontSize: '0.625rem',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  bgcolor: item.status === 'online' ? '#dcfce7' : item.status === 'offline' ? '#fee2e2' : '#f1f5f9',
                  color: item.status === 'online' ? '#166534' : item.status === 'offline' ? '#991b1b' : '#64748b',
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {item.uniqueId}
            </Typography>
            <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
              {/* {item.groupId && (
                <Typography variant="caption" color="text.secondary" sx={{ bgcolor: 'action.hover', px: 0.8, py: 0.2, borderRadius: 1 }}>
                  {groups[item.groupId]?.name}
                </Typography>
              )} */}
              {item.phone && (
                <Typography variant="caption" color="text.secondary" sx={{ bgcolor: 'action.hover', px: 0.8, py: 0.2, borderRadius: 1 }}>
                  {item.phone}
                </Typography>
              )}
              {item.model && (
                <Typography variant="caption" color="text.secondary" sx={{ bgcolor: 'action.hover', px: 0.8, py: 0.2, borderRadius: 1 }}>
                  {item.model}
                </Typography>
              )}
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            {!deviceReadonly && (
              <>
                <IconButton size="small" onClick={() => onEdit(item.id)} sx={{ color: 'text.secondary', opacity: 0.7 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onRemove(item.id)} sx={{ color: 'text.secondary', opacity: 0.7 }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        <Box mt={2} display="flex" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={2}>
          <Box flex={1} minWidth={0}>
            {position && (
              <>
                <Typography variant="caption" display="block" color="text.secondary" fontWeight="bold" sx={{ fontSize: '0.65rem', letterSpacing: '0.05em', mb: 0.5 }}>
                  {t('positionAddress')}
                </Typography>
                <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                  <AddressValue
                    latitude={position.latitude}
                    longitude={position.longitude}
                    originalAddress={position.address}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {formatTime(item.lastUpdate, 'minutes')}
                </Typography>
              </>
            )}
          </Box>

          <Box display="flex" gap={1.5} alignItems="center">
            {manager && (
              <DeviceUsersValue deviceId={item.id} />
            )}

            <Button
              variant="contained"
              disableElevation
              startIcon={<LinkIcon />}
              onClick={() => onConnections(item.id)}
              sx={{
                bgcolor: '#eef2ff', // Indigo-50
                color: '#6366f1', // Indigo-500
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                px: 2,
                py: 0.8,
                '&:hover': { bgcolor: '#e0e7ff' },
              }}
            >
              {t('sharedConnections')}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const DevicesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();

  const groups = useSelector((state) => state.groups.items);

  const manager = useManager();
  const deviceReadonly = useDeviceReadonly();

  const positions = useSelector((state) => state.session.positions);

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAll, setShowAll] = usePersistedState('showAllDevices', false);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ all: showAll });
      const response = await fetchOrThrow(`/api/devices?${query.toString()}`);
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, [timestamp, showAll]);

  const handleExport = async () => {
    const data = items.filter(filterByKeyword(searchKeyword)).map((item) => ({
      [t('sharedName')]: item.name,
      [t('deviceIdentifier')]: item.uniqueId,
      [t('groupParent')]: item.groupId ? groups[item.groupId]?.name : null,
      [t('sharedPhone')]: item.phone,
      [t('deviceModel')]: item.model,
      [t('deviceContact')]: item.contact,
      [t('userExpirationTime')]: formatTime(item.expirationTime, 'date'),
      [t('deviceStatus')]: formatStatus(item.status, t),
      [t('deviceLastUpdate')]: formatTime(item.lastUpdate, 'minutes'),
      [t('positionAddress')]: positions[item.id]?.address || '',
    }));
    const sheets = new Map();
    sheets.set(t('deviceTitle'), data);
    await exportExcel(t('deviceTitle'), 'devices.xlsx', sheets, theme);
  };

  const handleRemoveResult = (removed) => {
    setRemovingId(null);
    if (removed) {
      setTimestamp(Date.now());
    }
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'deviceTitle']}>
      <Box display="flex" flexWrap="wrap" gap={2} justifyContent="space-between" alignItems="center" mb={3}>
        <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />

        <Box display="flex" gap={2} alignItems="center">
          <Button onClick={handleExport} variant="text" size="small">{t('reportExport')}</Button>
          {manager && (
            <FormControlLabel
              control={(
                <Switch
                  checked={showAll}
                  onChange={(e) => setShowAll(e.target.checked)}
                  size="small"
                />
              )}
              label={t('notificationAlways')}
              labelPlacement="start"
            />
          )}
        </Box>
      </Box>

      {!loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
          {items.filter(filterByKeyword(searchKeyword)).map((item) => (
            <DeviceCard
              key={item.id}
              item={item}
              positions={positions}
              groups={groups}
              manager={manager}
              deviceReadonly={deviceReadonly}
              t={t}
              onConnections={(id) => navigate(`/settings/device/${id}/connections`)}
              onEdit={(id) => navigate(`/settings/device/${id}`)}
              onRemove={(id) => setRemovingId(id)}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ transform: 'translateY(-10%)' }}>
          <TruckLoader fullHeight={false} />
        </Box>
      )}

      <CollectionFab editPath="/settings/device" />

      <RemoveDialog
        style={{ transform: 'none' }}
        open={!!removingId}
        endpoint="devices"
        itemId={removingId}
        onResult={handleRemoveResult}
      />
    </PageLayout>
  );
};

export default DevicesPage;
