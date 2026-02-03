import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  IconButton,
  Card,
  CardContent,
  Box,
  Chip,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useAdministrator } from '../common/util/permissions';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import TruckLoader from '../common/components/TruckLoader';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import fetchOrThrow from '../common/util/fetchOrThrow';
import RemoveDialog from '../common/components/RemoveDialog';

const AttributeCard = ({ item, onEdit, onDelete, administrator }) => {
  const t = useTranslation();
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
              {item.description}
            </Typography>
            <Chip
              size="small"
              label={item.type}
              sx={{
                height: 18,
                fontSize: '9px',
                fontWeight: '800',
                borderRadius: '4px',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(31, 41, 55, 1)' : '#f1f5f9',
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            />
          </Box>
          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>
                {t('sharedAttribute')}:
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px', fontWeight: 500 }}>
                {item.attribute}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, borderLeft: '1px solid', borderColor: 'divider', pl: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>
                {t('sharedExpression')}:
              </Typography>
              <Typography variant="caption" sx={{
                color: 'text.secondary',
                fontSize: '11px',
                fontFamily: 'monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '400px',
              }}>
                {item.expression}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Section: Actions */}
        {administrator && (
          <Box display="flex" gap={0.5} sx={{ ml: 2 }}>
            <IconButton size="small" onClick={() => onEdit(item.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'text.primary' } }}>
              <EditIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(item.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.light' } }}>
              <DeleteIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const ComputedAttributesPage = () => {
  const navigate = useNavigate();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const administrator = useAdministrator();

  const [removingId, setRemovingId] = useState(null);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetchOrThrow('/api/attributes/computed');
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const handleEdit = (id) => {
    navigate(`/settings/attribute/${id}`);
  };

  const handleRemove = useCallback(async (removed) => {
    if (removed) {
      setTimestamp(Date.now());
    }
    setRemovingId(null);
  }, [setTimestamp, setRemovingId]);

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedComputedAttributes']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      {!loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', mt: 2 }}>
          {items.filter(filterByKeyword(searchKeyword)).map((item) => (
            <AttributeCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={setRemovingId}
              administrator={administrator}
            />
          ))}
        </Box>
      ) : (
        <TruckLoader fullHeight={false} />
      )}
      <CollectionFab editPath="/settings/attribute" disabled={!administrator} />
      <RemoveDialog
        open={!!removingId}
        endpoint="attributes/computed"
        itemId={removingId}
        onResult={(removed) => handleRemove(removed)}
      />
    </PageLayout>
  );
};

export default ComputedAttributesPage;
