import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Typography, Box, IconButton, useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffectAsync } from '../reactHelper';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import TruckLoader from '../common/components/TruckLoader';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import fetchOrThrow from '../common/util/fetchOrThrow';
import RemoveDialog from '../common/components/RemoveDialog';

const DriverCard = ({
  item, onEdit, onRemove,
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
        <Box display="flex" alignItems="center" sx={{ minWidth: 0, flexGrow: 1, gap: 2 }}>
          <Typography variant="body1" fontWeight="700" sx={{ fontSize: '0.95rem', color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </Typography>
          <Box sx={{ borderLeft: '1px solid', borderColor: 'divider', pl: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
              {item.uniqueId}
            </Typography>
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

const DriversPage = () => {

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const navigate = useNavigate();

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetchOrThrow('/api/drivers');
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
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedDrivers']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />

      {!loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', mt: 3 }}>
          {items.filter(filterByKeyword(searchKeyword)).map((item) => (
            <DriverCard
              key={item.id}
              item={item}
              onEdit={(id) => navigate(`/settings/driver/${id}`)}
              onRemove={(id) => setRemovingId(id)}
            />
          ))}
        </Box>
      ) : (
        <TruckLoader fullHeight={false} />
      )}

      <CollectionFab editPath="/settings/driver" />

      <RemoveDialog
        style={{ transform: 'none' }}
        open={!!removingId}
        endpoint="drivers"
        itemId={removingId}
        onResult={handleRemoveResult}
      />
    </PageLayout>
  );
};

export default DriversPage;
