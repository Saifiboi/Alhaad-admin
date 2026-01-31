import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Container,
  IconButton,
  Card,
  CardContent,
  Box,
  Chip,
  Stack,
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

  return (
    <Card elevation={0} sx={{
      mb: 1,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      '&:hover': {
        boxShadow: (theme) => theme.shadows[2],
        borderColor: 'primary.main',
      },
      transition: 'all 0.2s ease',
    }}>
      <CardContent sx={{ p: '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>
              {item.description}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, textTransform: 'uppercase' }}>
                  {t('sharedAttribute')}:
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {item.attribute}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, textTransform: 'uppercase' }}>
                  {t('sharedExpression')}:
                </Typography>
                <Typography variant="body2" sx={{
                  color: 'text.secondary',
                  fontFamily: 'monospace',
                  backgroundColor: 'action.hover',
                  px: 0.5,
                  borderRadius: 0.5,
                  fontSize: '0.8rem',
                }} noWrap>
                  {item.expression}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, textTransform: 'uppercase' }}>
                  {t('sharedType')}:
                </Typography>
                <Chip
                  label={item.type}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    borderColor: 'divider',
                  }}
                />
              </Box>
            </Stack>
          </Stack>

          {administrator && (
            <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
              <IconButton
                size="small"
                onClick={() => onEdit(item.id)}
                color="primary"
                sx={{
                  backgroundColor: 'primary.lighter',
                  '&:hover': { backgroundColor: 'primary.light', color: 'common.white' },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDelete(item.id)}
                color="error"
                sx={{
                  backgroundColor: 'error.lighter',
                  '&:hover': { backgroundColor: 'error.light', color: 'common.white' },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}
        </Box>
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
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {!loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
      </Container>
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
