import { useContext, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Container, Button, Accordion, AccordionDetails, AccordionSummary, Skeleton, Typography, TextField, Box,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useCatch, useEffectAsync } from '../../reactHelper';
import { useTranslation } from '../../common/components/LocalizationProvider';
import PageLayout from '../../common/components/PageLayout';
import WindowModeContext from '../../common/components/WindowModeContext';
import useSettingsStyles from '../common/useSettingsStyles';
import fetchOrThrow from '../../common/util/fetchOrThrow';

const EditItemView = ({
  children, endpoint, item, setItem, defaultItem, validate, onItemSaved, menu, breadcrumbs,
}) => {
  const navigate = useNavigate();
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const { id } = useParams();

  const { isWindow, onClose } = useContext(WindowModeContext);

  useEffectAsync(async () => {
    if (!item) {
      if (id) {
        const response = await fetchOrThrow(`/api/${endpoint}/${id}`);
        setItem(await response.json());
      } else {
        setItem(defaultItem || {});
      }
    }
  }, [id, item, defaultItem]);

  const location = useLocation();
  const handleBack = useCallback(() => {
    if (location.key !== 'default') {
      navigate(-1);
    } else if (isWindow && onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  }, [isWindow, onClose, navigate, location.key]);

  const handleSave = useCatch(async () => {
    let url = `/api/${endpoint}`;
    if (id) {
      url += `/${id}`;
    }

    const response = await fetchOrThrow(url, {
      method: !id ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });

    if (onItemSaved) {
      onItemSaved(await response.json());
    }
    handleBack();
  });

  return (
    <PageLayout menu={menu} breadcrumbs={breadcrumbs}>
      <Container maxWidth="lg" className={classes.container}>
        <div className={classes.content}>
          {item ? children : (
            <Accordion defaultExpanded>
              <AccordionSummary>
                <Typography variant="subtitle1">
                  <Skeleton width="10em" />
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={-i} width="100%">
                    <TextField />
                  </Skeleton>
                ))}
              </AccordionDetails>
            </Accordion>
          )}
        </div>
        <Box className={classes.buttons} sx={{ gap: 2, padding: 2 }}>
          <Button
            color="error"
            variant="outlined"
            onClick={handleBack}
            disabled={!item}
            startIcon={<CloseIcon />}
            sx={{
              borderRadius: '12px',
              padding: '10px 24px',
              textTransform: 'none',
              fontWeight: 'bold',
            }}
          >
            {t('sharedCancel')}
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={handleSave}
            disabled={!item || !validate()}
            startIcon={<SaveIcon />}
            sx={{
              borderRadius: '12px',
              padding: '10px 24px',
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: '0 4px 14px 0 rgba(249, 115, 22, 0.39)',
              color: 'common.white',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(249, 115, 22, 0.23)',
              },
            }}
          >
            {t('sharedSave')}
          </Button>
        </Box>
      </Container>
    </PageLayout>
  );
};

export default EditItemView;
