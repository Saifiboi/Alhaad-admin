import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Typography, Box, IconButton, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import { formatBoolean } from '../common/util/formatter';
import { prefixString } from '../common/util/stringUtils';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import { useRestriction } from '../common/util/permissions';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';
import RemoveDialog from '../common/components/RemoveDialog';

const CommandCard = ({
  item,
  t,
  limitCommands,
  onEdit,
  onRemove,
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
                {item.description}
              </Typography>
            </Box>
            <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
              <Chip
                size="small"
                label={t(prefixString('command', item.type))}
                sx={{
                  height: 20,
                  fontSize: '0.625rem',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  bgcolor: '#eef2ff',
                  color: '#6366f1',
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ bgcolor: 'action.hover', px: 0.8, py: 0.2, borderRadius: 1 }}>
                {t('commandSendSms')}: {formatBoolean(item.textChannel, t)}
              </Typography>
            </Box>
          </Box>

          {!limitCommands && (
            <Box display="flex" gap={1}>
              <IconButton size="small" onClick={() => onEdit(item.id)} sx={{ color: 'text.secondary', opacity: 0.7 }}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onRemove(item.id)} sx={{ color: 'text.secondary', opacity: 0.7 }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const CommandsPage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();
  const navigate = useNavigate();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const limitCommands = useRestriction('limitCommands');

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetchOrThrow('/api/commands');
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const handleRemoveResult = (removed) => {
    setRemovingId(null);
    if (removed) {
      setTimestamp(Date.now());
    }
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedSavedCommands']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />

      {!loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', mt: 3 }}>
          {items.filter(filterByKeyword(searchKeyword)).map((item) => (
            <CommandCard
              key={item.id}
              item={item}
              t={t}
              limitCommands={limitCommands}
              onEdit={(id) => navigate(`/settings/command/${id}`)}
              onRemove={(id) => setRemovingId(id)}
            />
          ))}
        </Box>
      ) : (
        <TableShimmer columns={limitCommands ? 3 : 4} endAction />
      )}

      <CollectionFab editPath="/settings/command" disabled={limitCommands} />

      <RemoveDialog
        style={{ transform: 'none' }}
        open={!!removingId}
        endpoint="commands"
        itemId={removingId}
        onResult={handleRemoveResult}
      />
    </PageLayout>
  );
};

export default CommandsPage;
