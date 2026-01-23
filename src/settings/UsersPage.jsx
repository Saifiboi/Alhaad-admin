import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableRow, TableCell, TableHead, TableBody, Switch, TableFooter, FormControlLabel,
  Card, CardContent, Typography, Grid, IconButton, Box, Button, Chip
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCatch, useEffectAsync } from '../reactHelper';
import { formatBoolean, formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TruckLoader from '../common/components/TruckLoader';
import { useManager } from '../common/util/permissions';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';
import RemoveDialog from '../common/components/RemoveDialog';

const UserCard = ({
  item, t, manager, onLogin, onConnections, onEdit, onRemove,
}) => {
  const isExpired = item.expirationTime && new Date(item.expirationTime) < new Date();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3, // ~24px
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
              <Chip
                label={item.administrator ? 'ADMIN' : 'USER'}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.625rem',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  bgcolor: item.administrator ? '#ffedd5' : '#f1f5f9', // Orange-50 or Slate-100
                  color: item.administrator ? '#c2410c' : '#64748b', // Orange-700 or Slate-500
                }}
              />
              {item.disabled && (
                <Chip
                  label="DISABLED"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.625rem',
                    fontWeight: 'bold',
                    borderRadius: '6px',
                    bgcolor: '#fef2f2',
                    color: '#ef4444',
                  }}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {item.email}
            </Typography>
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

        <Box mt={2} display="flex" justifyContent="space-between" alignItems="flex-end">
          <Box>
            <Typography variant="caption" display="block" color="text.secondary" fontWeight="bold" sx={{ fontSize: '0.65rem', letterSpacing: '0.05em', mb: 0.5 }}>
              EXPIRATION
            </Typography>
            <Typography variant="body2" fontWeight="medium" color={isExpired ? 'error.main' : 'text.primary'}>
              {item.expirationTime ? formatTime(item.expirationTime, 'date') : '—'}
            </Typography>
          </Box>

          <Box display="flex" gap={1.5}>
            <Button
              variant="contained"
              disableElevation
              startIcon={<LinkIcon />}
              onClick={() => onConnections(item.id)}
              sx={{
                bgcolor: '#eef2ff', // Indigo-50
                color: '#6366f1', // Indigo-500
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                px: 2,
                py: 0.8,
                '&:hover': { bgcolor: '#e0e7ff' },
              }}
            >
              {t('sharedConnections')}
            </Button>
            {manager && (
              <Button
                variant="contained"
                disableElevation
                startIcon={<LoginIcon />}
                onClick={() => onLogin(item.id)}
                sx={{
                  bgcolor: '#f8fafc', // Slate-50
                  color: '#475569', // Slate-600
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '8px',
                  px: 2,
                  py: 0.8,
                  '&:hover': { bgcolor: '#f1f5f9' },
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const UsersPage = () => {
  const { classes } = useSettingsStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const manager = useManager();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [temporary, setTemporary] = useState(false);

  // Remove Dialog State
  const [removingId, setRemovingId] = useState(null);

  const handleLogin = useCatch(async (userId) => {
    await fetchOrThrow(`/api/session/${userId}`);
    window.location.replace('/');
  });

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetchOrThrow('/api/users?excludeAttributes=true');
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
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsUsers']}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
        <FormControlLabel
          control={(
            <Switch
              value={temporary}
              onChange={(e) => setTemporary(e.target.checked)}
              size="small"
            />
          )}
          label={t('userTemporary')}
          labelPlacement="start"
          sx={{ ml: 2 }}
        />
      </Box>

      {!loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
          {items.filter((u) => temporary || !u.temporary).filter(filterByKeyword(searchKeyword)).map((item) => (
            <UserCard
              key={item.id}
              item={item}
              t={t}
              manager={manager}
              onLogin={handleLogin}
              onConnections={(id) => navigate(`/settings/user/${id}/connections`)}
              onEdit={(id) => navigate(`/settings/user/${id}`)}
              onRemove={(id) => setRemovingId(id)}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ transform: 'translateY(-5%)' }}>
          <TruckLoader fullHeight={false} />
        </Box>
      )}

      <CollectionFab editPath="/settings/user" />

      <RemoveDialog
        style={{ transform: 'none' }}
        open={!!removingId}
        endpoint="users"
        itemId={removingId}
        onResult={handleRemoveResult}
      />
    </PageLayout>
  );
};

export default UsersPage;
