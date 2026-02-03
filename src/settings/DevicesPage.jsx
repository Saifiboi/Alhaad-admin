import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Button, FormControlLabel, Switch, Card, CardContent, Typography, Box, IconButton, Chip,
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
import usePersistedState from '../common/util/usePersistedState';
import fetchOrThrow from '../common/util/fetchOrThrow';
import AddressValue from '../common/components/AddressValue';
import exportExcel from '../common/util/exportExcel';
import RemoveDialog from '../common/components/RemoveDialog';

const DeviceCard = ({
  item,
  positions,
  deviceReadonly,
  t,
  onConnections,
  onEdit,
  onRemove,
}) => {
  const position = positions[item.id];
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '12px',
        border: '1px solid',
        borderColor: theme.palette.divider,
        bgcolor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
        width: '100%',
        transition: 'all 0.2s',
        '&:active': { transform: 'scale(0.98)' },
      }}
    >
      <CardContent sx={{ p: '12px 16px !important', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left Section: Info */}
        <Box display="flex" flexDirection="column" sx={{ minWidth: 0, flexGrow: 1 }}>
          <Box display="flex" alignItems="center" gap={1} mb={0.25}>
            <Typography variant="body1" fontWeight="700" sx={{ fontSize: '0.95rem', color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.name}
            </Typography>
            <Chip
              size="small"
              label={formatStatus(item.status, t)}
              sx={{
                height: 18,
                fontSize: '9px',
                fontWeight: '800',
                borderRadius: '4px',
                bgcolor: item.status === 'online' ? (theme.palette.mode === 'dark' ? 'rgba(22, 101, 52, 0.2)' : '#dcfce7') : (theme.palette.mode === 'dark' ? 'rgba(31, 41, 55, 1)' : '#f1f5f9'),
                color: item.status === 'online' ? (theme.palette.mode === 'dark' ? '#4ade80' : '#166534') : 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            />
          </Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
              {item.uniqueId}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, borderLeft: '1px solid', borderColor: 'divider', pl: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>
                Seen:
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>
                {item.status === 'online' ? 'Live Now' : formatTime(item.lastUpdate, 'minutes')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, borderLeft: '1px solid', borderColor: 'divider', pl: 1.5, minWidth: 0, flex: 1 }}>
              <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', color: 'text.disabled', fontSize: '11px' }}>
                {position ? (
                  <AddressValue
                    latitude={position.latitude}
                    longitude={position.longitude}
                    originalAddress={position.address}
                  />
                ) : (
                  'No Address'
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right Section: Actions */}
        <Box display="flex" alignItems="center" gap={1.5}>
          {!deviceReadonly && (
            <Box display="flex" gap={0.5}>
              <IconButton size="small" onClick={() => onEdit(item.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'text.primary' } }}>
                <EditIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton size="small" onClick={() => onRemove(item.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.light' } }}>
                <DeleteIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          )}
          <Button
            variant="contained"
            disableElevation
            startIcon={<LinkIcon sx={{ fontSize: 16 }} />}
            onClick={() => onConnections(item.id)}
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 58, 138, 0.2)' : '#eff6ff',
              color: theme.palette.mode === 'dark' ? '#60a5fa' : '#2563eb',
              textTransform: 'none',
              fontSize: '11px',
              fontWeight: '600',
              borderRadius: '8px',
              px: 1.5,
              py: 0.5,
              '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 58, 138, 0.3)' : '#dbeafe' },
            }}
          >
            Connections
          </Button>
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
