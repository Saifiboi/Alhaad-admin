import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Typography, Box, IconButton, Button, useTheme, Tooltip
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import PublishIcon from '@mui/icons-material/Publish';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffectAsync } from '../reactHelper';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import TruckLoader from '../common/components/TruckLoader';
import { useTranslation } from '../common/components/LocalizationProvider';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import { useRestriction } from '../common/util/permissions';
import fetchOrThrow from '../common/util/fetchOrThrow';
import RemoveDialog from '../common/components/RemoveDialog';

const GroupCard = ({
  item, limitCommands, onConnections, onCommand, onEdit, onRemove,
}) => {
  const theme = useTheme();
  const t = useTranslation();

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
        <Box display="flex" alignItems="center" sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="body1" fontWeight="700" sx={{ fontSize: '0.95rem', color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </Typography>
        </Box>

        {/* Right Section: Actions */}
        <Box display="flex" alignItems="center" gap={1}>
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
          {!limitCommands && (
            <Tooltip title={t('deviceCommand')}>
              <IconButton
                size="small"
                onClick={() => onCommand(item.id)}
                sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main' } }}
              >
                <PublishIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
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
};

const GroupsPage = () => {
  const navigate = useNavigate();

  const limitCommands = useRestriction('limitCommands');

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetchOrThrow('/api/groups');
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
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsGroups']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />

      {!loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', mt: 3 }}>
          {items.filter(filterByKeyword(searchKeyword)).map((item) => (
            <GroupCard
              key={item.id}
              item={item}
              limitCommands={limitCommands}
              onConnections={(id) => navigate(`/settings/group/${id}/connections`)}
              onCommand={(id) => navigate(`/settings/group/${id}/command`)}
              onEdit={(id) => navigate(`/settings/group/${id}`)}
              onRemove={(id) => setRemovingId(id)}
            />
          ))}
        </Box>
      ) : (
        <TruckLoader fullHeight={false} />
      )}

      <CollectionFab editPath="/settings/group" />

      <RemoveDialog
        style={{ transform: 'none' }}
        open={!!removingId}
        endpoint="groups"
        itemId={removingId}
        onResult={handleRemoveResult}
      />
    </PageLayout>
  );
};

export default GroupsPage;
