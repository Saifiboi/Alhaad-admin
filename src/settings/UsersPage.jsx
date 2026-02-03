import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Switch, FormControlLabel,
  Card, CardContent, Typography, IconButton, Box, Button, Chip, useTheme
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LinkIcon from '@mui/icons-material/Link';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCatch, useEffectAsync } from '../reactHelper';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import TruckLoader from '../common/components/TruckLoader';
import { useManager } from '../common/util/permissions';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import fetchOrThrow from '../common/util/fetchOrThrow';
import RemoveDialog from '../common/components/RemoveDialog';

const UserCard = ({
  item, manager, onLogin, onConnections, onEdit, onRemove,
}) => {
  const theme = useTheme();
  const isExpired = item.expirationTime && new Date(item.expirationTime) < new Date();

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
              {item.name}
            </Typography>
            <Chip
              label={item.administrator ? 'ADMIN' : 'USER'}
              size="small"
              sx={{
                height: 18,
                fontSize: '9px',
                fontWeight: '800',
                borderRadius: '4px',
                bgcolor: item.administrator ? (theme.palette.mode === 'dark' ? 'rgba(124, 45, 18, 0.3)' : '#ffedd5') : (theme.palette.mode === 'dark' ? 'rgba(31, 41, 55, 1)' : '#f1f5f9'),
                color: item.administrator ? (theme.palette.mode === 'dark' ? '#fb923c' : '#c2410c') : 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            />
          </Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.email}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, borderLeft: '1px solid', borderColor: 'divider', pl: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>
                Exp:
              </Typography>
              <Typography variant="caption" sx={{ color: isExpired ? 'error.main' : 'text.secondary', fontSize: '11px' }}>
                {item.expirationTime ? formatTime(item.expirationTime, 'date') : '—'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Section: Actions */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box display="flex" gap={0.5}>
            <IconButton size="small" onClick={() => onEdit(item.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'text.primary' } }}>
              <EditIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton size="small" onClick={() => onRemove(item.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.light' } }}>
              <DeleteIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              disableElevation
              startIcon={<LinkIcon sx={{ fontSize: 16 }} />}
              onClick={() => onConnections(item.id)}
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 58, 138, 0.2)' : '#eff6ff',
                color: theme.palette.mode === 'dark' ? '#60a5fa' : '#2563eb',
                textTransform: 'none',
                fontSize: '11px',
                fontWeight: '600',
                borderRadius: '8px',
                px: 1.5,
                py: 0.5,
                '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 58, 138, 0.3)' : '#dbeafe' },
              }}
            >
              Connections
            </Button>
            {manager && (
              <Button
                variant="contained"
                disableElevation
                startIcon={<LoginIcon sx={{ fontSize: 16 }} />}
                onClick={() => onLogin(item.id)}
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(31, 41, 55, 1)' : '#f8fafc',
                  color: 'text.primary',
                  textTransform: 'none',
                  fontSize: '11px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  px: 1.5,
                  py: 0.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(55, 65, 81, 1)' : '#f1f5f9' },
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
              manager={manager}
              onLogin={handleLogin}
              onConnections={(id) => navigate(`/settings/user/${id}/connections`)}
              onEdit={(id) => navigate(`/settings/user/${id}`)}
              onRemove={(id) => setRemovingId(id)}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ transform: 'translateY(-7%)' }}>
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
