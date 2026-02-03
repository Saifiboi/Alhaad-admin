import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Typography, Box, IconButton, Chip, useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffectAsync } from '../reactHelper';
import { prefixString } from '../common/util/stringUtils';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import TruckLoader from '../common/components/TruckLoader';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import fetchOrThrow from '../common/util/fetchOrThrow';
import RemoveDialog from '../common/components/RemoveDialog';

const NotificationCard = ({
  item,
  t,
  onEdit,
  onRemove,
  formatList,
}) => {
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
              {t(prefixString('event', item.type))}
            </Typography>
            <Chip
              size="small"
              label={item.always ? t('notificationAlways') : t('sharedDescription')}
              sx={{
                height: 18,
                fontSize: '9px',
                fontWeight: '800',
                borderRadius: '4px',
                bgcolor: item.always ? (theme.palette.mode === 'dark' ? 'rgba(22, 101, 52, 0.2)' : '#dcfce7') : (theme.palette.mode === 'dark' ? 'rgba(31, 41, 55, 1)' : '#f1f5f9'),
                color: item.always ? (theme.palette.mode === 'dark' ? '#4ade80' : '#166534') : 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            />
          </Box>
          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
              {item.description}
            </Typography>
            {item.notificators && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, borderLeft: '1px solid', borderColor: 'divider', pl: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>
                  {t('notificationNotificators')}:
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>
                  {formatList('notificator', item.notificators)}
                </Typography>
              </Box>
            )}
            {item.attributes.alarms && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, borderLeft: '1px solid', borderColor: 'divider', pl: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>
                  {t('sharedAlarms')}:
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>
                  {formatList('alarm', item.attributes.alarms)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Right Section: Actions */}
        <Box display="flex" gap={1}>
          <IconButton size="small" onClick={() => onEdit(item.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'text.primary' } }}>
            <EditIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton size="small" onClick={() => onRemove(item.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.light' } }}>
            <DeleteIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

const NotificationsPage = () => {
  const t = useTranslation();
  const navigate = useNavigate();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetchOrThrow('/api/notifications');
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const formatList = (prefix, value) => {
    if (value) {
      return value
        .split(/[, ]+/)
        .filter(Boolean)
        .map((it) => t(prefixString(prefix, it)))
        .join(', ');
    }
    return '';
  };

  const handleRemoveResult = (removed) => {
    setRemovingId(null);
    if (removed) {
      setTimestamp(Date.now());
    }
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedNotifications']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />

      {!loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', mt: 3 }}>
          {items.filter(filterByKeyword(searchKeyword)).map((item) => (
            <NotificationCard
              key={item.id}
              item={item}
              t={t}
              onEdit={(id) => navigate(`/settings/notification/${id}`)}
              onRemove={(id) => setRemovingId(id)}
              formatList={formatList}
            />
          ))}
        </Box>
      ) : (
        <TruckLoader fullHeight={false} />
      )}

      <CollectionFab editPath="/settings/notification" />

      <RemoveDialog
        style={{ transform: 'none' }}
        open={!!removingId}
        endpoint="notifications"
        itemId={removingId}
        onResult={handleRemoveResult}
      />
    </PageLayout>
  );
};

export default NotificationsPage;
