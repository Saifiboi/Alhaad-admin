import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Typography, Box, IconButton, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffectAsync } from '../reactHelper';
import { prefixString } from '../common/util/stringUtils';
import { formatBoolean } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';
import RemoveDialog from '../common/components/RemoveDialog';

const NotificationCard = ({
  item,
  t,
  onEdit,
  onRemove,
  formatList,
}) => {
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
                {t(prefixString('event', item.type))}
              </Typography>
              <Chip
                size="small"
                label={item.always ? t('notificationAlways') : t('sharedDescription')}
                sx={{
                  height: 20,
                  fontSize: '0.625rem',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  bgcolor: item.always ? '#dcfce7' : '#f1f5f9',
                  color: item.always ? '#166534' : '#64748b',
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {item.description}
            </Typography>

            <Box display="flex" flexDirection="column" gap={0.5}>
              {item.notificators && (
                <Typography variant="caption" color="text.secondary">
                  <strong>{t('notificationNotificators')}:</strong> {formatList('notificator', item.notificators)}
                </Typography>
              )}
              {item.attributes.alarms && (
                <Typography variant="caption" color="text.secondary">
                  <strong>{t('sharedAlarms')}:</strong> {formatList('alarm', item.attributes.alarms)}
                </Typography>
              )}
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            <IconButton size="small" onClick={() => onEdit(item.id)} sx={{ color: 'text.secondary', opacity: 0.7 }}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onRemove(item.id)} sx={{ color: 'text.secondary', opacity: 0.7 }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const NotificationsPage = () => {
  const { classes } = useSettingsStyles();
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
        <TableShimmer columns={5} endAction />
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
