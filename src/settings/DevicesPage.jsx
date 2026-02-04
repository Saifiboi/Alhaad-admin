import {
  useState, useMemo, memo,
} from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  TextField,
  Pagination,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
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
import { filterByKeyword } from './components/SearchHeader';
import { formatStatus, formatTime } from '../common/util/formatter';
import { useDeviceReadonly, useManager } from '../common/util/permissions';
import usePersistedState from '../common/util/usePersistedState';
import fetchOrThrow from '../common/util/fetchOrThrow';
import exportExcel from '../common/util/exportExcel';
import RemoveDialog from '../common/components/RemoveDialog';
import { getCachedDevices, setCachedDevices } from '../common/util/deviceCache';

const DeviceCard = memo(({
  item,
  position,
  deviceReadonly,
  t,
  onConnections,
  onEdit,
  onRemove,
}) => {
  const theme = useTheme();

  if (!item) return null;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '12px',
        border: '1px solid',
        borderColor: theme.palette.divider,
        bgcolor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
        width: '100%',
        minHeight: '80px',
        transition: 'all 0.2s',
        '&:active': { transform: 'scale(0.98)' },
      }}
    >
      <CardContent sx={{ p: '12px 16px !important', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '60px' }}>
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
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              borderLeft: '1px solid',
              borderColor: 'divider',
              pl: 1.5,
              minWidth: 0,
              flex: 1,
            }}>
              <Typography variant="caption" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', color: 'text.disabled', fontSize: '11px' }}>
                {position?.address || 'No Address'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Section: Actions */}
        <Box display="flex" alignItems="center" gap={1.5}>
          {!deviceReadonly && (
            <Box display="flex" gap={0.5}>
              <Tooltip title={t('sharedEdit')}>
                <IconButton size="small" onClick={() => onEdit(item.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'text.primary' } }}>
                  <EditIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('sharedRemove')}>
                <IconButton size="small" onClick={() => onRemove(item.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.light' } }}>
                  <DeleteIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          <Tooltip title={t('sharedConnections')}>
            <IconButton
              size="small"
              onClick={() => onConnections(item.id)}
              sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main' } }}
            >
              <LinkIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
});

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
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = usePersistedState('devicesItemsPerPage', 20);

  useEffectAsync(async () => {
    const cachedDevices = getCachedDevices(showAll);

    if (cachedDevices && cachedDevices.length > 0) {
      setItems(cachedDevices);
      setLoading(false);

      try {
        const query = new URLSearchParams({ all: showAll });
        const response = await fetchOrThrow(`/api/devices?${query.toString()}`);
        const devicesData = await response.json();
        setItems(devicesData);
        setCachedDevices(devicesData, showAll);
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    } else {
      setLoading(true);
      try {
        const query = new URLSearchParams({ all: showAll });
        const response = await fetchOrThrow(`/api/devices?${query.toString()}`);
        const devicesData = await response.json();
        setItems(devicesData);
        setCachedDevices(devicesData, showAll);
      } finally {
        setLoading(false);
      }
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

  const filteredItems = useMemo(() =>
    items.filter(filterByKeyword(searchKeyword)),
    [items, searchKeyword]
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setSearchKeyword(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'deviceTitle']}>
      {/* Top Actions Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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

        <Typography variant="body2" color="text.secondary">
          {filteredItems.length} device{filteredItems.length !== 1 ? 's' : ''} total
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box mb={2}>
        <TextField
          variant="outlined"
          placeholder={t('sharedSearch')}
          value={searchKeyword}
          onChange={(e) => handleSearch(e.target.value)}
          size="small"
          fullWidth
          sx={{ maxWidth: '500px' }}
        />
      </Box>

      {/* Pagination Info and Controls */}
      {!loading && filteredItems.length > 0 && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              Page {currentPage} of {totalPages} • Showing {paginatedItems.length} devices
            </Typography>
            <FormControl size="small" variant="outlined">
              <Select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                sx={{ fontSize: '11px', height: '28px' }}
              >
                <MenuItem value={20} sx={{ fontSize: '11px' }}>20 per page</MenuItem>
                <MenuItem value={50} sx={{ fontSize: '11px' }}>50 per page</MenuItem>
                <MenuItem value={100} sx={{ fontSize: '11px' }}>100 per page</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {!loading && filteredItems.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
          {paginatedItems.map((item) => item ? (
            <DeviceCard
              key={item.id}
              item={item}
              position={positions[item.id]}
              deviceReadonly={deviceReadonly}
              t={t}
              onConnections={(id) => navigate(`/settings/device/${id}/connections`)}
              onEdit={(id) => navigate(`/settings/device/${id}`)}
              onRemove={(id) => setRemovingId(id)}
            />
          ) : null)}
        </Box>
      ) : !loading ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {searchKeyword ? 'No devices match your search' : 'No devices found'}
          </Typography>
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
