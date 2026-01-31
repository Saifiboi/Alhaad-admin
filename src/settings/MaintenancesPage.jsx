import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffectAsync } from '../reactHelper';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { formatDistance, formatSpeed } from '../common/util/formatter';
import { useAttributePreference } from '../common/util/preferences';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import TruckLoader from '../common/components/TruckLoader';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import fetchOrThrow from '../common/util/fetchOrThrow';
import RemoveDialog from '../common/components/RemoveDialog';

const MaintenanceCard = ({ item, onEdit, onRemove, convertAttribute }) => {
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
              {item.name}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, textTransform: 'uppercase' }}>
                  {t('sharedType')}:
                </Typography>
                <Chip
                  label={item.type}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    borderColor: 'divider',
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, textTransform: 'uppercase' }}>
                  {t('maintenanceStart')}:
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {convertAttribute(item.type, true, item.start)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, textTransform: 'uppercase' }}>
                  {t('maintenancePeriod')}:
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {convertAttribute(item.type, false, item.period)}
                </Typography>
              </Box>
            </Stack>
          </Stack>

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
              onClick={() => onRemove(item.id)}
              color="error"
              sx={{
                backgroundColor: 'error.lighter',
                '&:hover': { backgroundColor: 'error.light', color: 'common.white' },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

const MaintenacesPage = () => {
  const t = useTranslation();
  const navigate = useNavigate();

  const positionAttributes = usePositionAttributes(t);

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const speedUnit = useAttributePreference('speedUnit');
  const distanceUnit = useAttributePreference('distanceUnit');

  const [removingId, setRemovingId] = useState(null);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetchOrThrow('/api/maintenance');
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const convertAttribute = useCallback((key, start, value) => {
    const attribute = positionAttributes[key];
    if (key.endsWith('Time')) {
      if (start) {
        return dayjs(value).locale('en').format('YYYY-MM-DD');
      }
      return `${value / 86400000} ${t('sharedDays')}`;
    }
    if (attribute && attribute.dataType) {
      switch (attribute.dataType) {
        case 'speed':
          return formatSpeed(value, speedUnit, t);
        case 'distance':
          return formatDistance(value, distanceUnit, t);
        case 'hours':
          return `${value / 3600000} ${t('sharedHours')}`;
        default:
          return value;
      }
    }

    return value;
  }, [positionAttributes, speedUnit, distanceUnit, t]);

  const handleRemove = useCallback(async (removed) => {
    if (removed) {
      setTimestamp(Date.now());
    }
    setRemovingId(null);
  }, [setTimestamp, setRemovingId]);

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedMaintenance']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {!loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {items.filter(filterByKeyword(searchKeyword)).map((item) => (
              <MaintenanceCard
                key={item.id}
                item={item}
                onEdit={(id) => navigate(`/settings/maintenance/${id}`)}
                onRemove={(id) => setRemovingId(id)}
                convertAttribute={convertAttribute}
              />
            ))}
          </Box>
        ) : (
          <TruckLoader fullHeight={false} />
        )}
      </Container>
      <CollectionFab editPath="/settings/maintenance" />
      <RemoveDialog
        open={!!removingId}
        endpoint="maintenance"
        itemId={removingId}
        onResult={(removed) => handleRemove(removed)}
      />
    </PageLayout>
  );
};

export default MaintenacesPage;
