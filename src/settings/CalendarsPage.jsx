import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Typography, Box, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';
import RemoveDialog from '../common/components/RemoveDialog';

const CalendarCard = ({ item, onEdit, onRemove }) => {
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

const CalendarsPage = () => {
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
      const response = await fetchOrThrow('/api/calendars');
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
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedCalendars']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />

      {!loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', mt: 3 }}>
          {items.filter(filterByKeyword(searchKeyword)).map((item) => (
            <CalendarCard
              key={item.id}
              item={item}
              onEdit={(id) => navigate(`/settings/calendar/${id}`)}
              onRemove={(id) => setRemovingId(id)}
            />
          ))}
        </Box>
      ) : (
        <TableShimmer columns={2} endAction />
      )}

      <CollectionFab editPath="/settings/calendar" />

      <RemoveDialog
        style={{ transform: 'none' }}
        open={!!removingId}
        endpoint="calendars"
        itemId={removingId}
        onResult={handleRemoveResult}
      />
    </PageLayout>
  );
};

export default CalendarsPage;
