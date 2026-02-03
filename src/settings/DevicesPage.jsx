import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Button, FormControlLabel, Switch, Card, CardContent, Typography, Box, IconButton, Chip, Grid,
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
        borderRadius: '16px',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 1)',
        bgcolor: theme.palette.mode === 'dark' ? '#334155' : '#ffffff',
        width: '100%',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
        },
      }}
    >
      <CardContent sx={{ p: '16px !important' }}>
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="subtitle1" fontWeight="700" sx={{ fontSize: '1rem', color: 'text.primary' }}>
              {item.name}
            </Typography>
            <Chip
              size="small"
              label={formatStatus(item.status, t)}
              sx={{
                height: 20,
                fontSize: '10px',
                fontWeight: '600',
                borderRadius: '999px',
                bgcolor: item.status === 'online' ? (theme.palette.mode === 'dark' ? 'rgba(22, 101, 52, 0.2)' : '#dcfce7') : (theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 1)' : '#f1f5f9'),
                color: item.status === 'online' ? (theme.palette.mode === 'dark' ? '#4ade80' : '#166534') : 'text.secondary',
                border: '1px solid',
                borderColor: item.status === 'online' ? (theme.palette.mode === 'dark' ? 'rgba(22, 101, 52, 0.5)' : '#bbf7d0') : 'divider',
              }}
            />
          </Box>
          {!deviceReadonly && (
            <Box display="flex" gap={1}>
              <IconButton size="small" onClick={() => onEdit(item.id)} sx={{ color: 'text.secondary', p: 0.5 }}>
                <EditIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton size="small" onClick={() => onRemove(item.id)} sx={{ color: 'error.light', p: 0.5 }}>
                <DeleteIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Info Grid Section */}
        <Grid container spacing={2} sx={{ mb: 2, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Grid size={6}>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', fontWeight: '800', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
              ID / Serial
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '12px', color: 'text.secondary', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.uniqueId}
            </Typography>
          </Grid>
          <Grid size={6} sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', fontWeight: '800', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
              Last Seen
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '12px', color: 'text.secondary' }}>
              {item.status === 'online' ? 'Live Now' : formatTime(item.lastUpdate, 'minutes')}
            </Typography>
          </Grid>
        </Grid>

        {/* Footer Section: Address and Connections */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-end" gap={2}>
          <Box flex={1} minWidth={0}>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', fontWeight: '800', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
              Address
            </Typography>
            <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', color: 'text.secondary', fontSize: '12px' }}>
              {position ? (
                <AddressValue
                  latitude={position.latitude}
                  longitude={position.longitude}
                  originalAddress={position.address}
                />
              ) : (
                <Typography variant="caption" color="primary" sx={{ fontWeight: '500', cursor: 'pointer' }}>Show Address</Typography>
              )}
            </Box>
          </Box>

          <Button
            variant="contained"
            disableElevation
            startIcon={<LinkIcon sx={{ fontSize: 16 }} />}
            onClick={() => onConnections(item.id)}
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(49, 46, 129, 0.3)' : '#eef2ff',
              color: theme.palette.mode === 'dark' ? '#818cf8' : '#4f46e5',
              textTransform: 'none',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '12px',
              px: 1.5,
              py: 0.75,
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(49, 46, 129, 0.5)' : '#e0e7ff',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(49, 46, 129, 0.5)' : '#e0e7ff',
              },
              whiteSpace: 'nowrap',
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
              groups={groups}
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
