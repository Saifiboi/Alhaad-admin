import { Fab, Tooltip } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useRestriction } from '../../common/util/permissions';
import { useTranslation } from '../../common/components/LocalizationProvider';

const useStyles = makeStyles()((theme) => ({
  fab: {
    position: 'fixed',
    bottom: theme.spacing(1.5),
    right: theme.spacing(1.5),
    [theme.breakpoints.down('md')]: {
      bottom: `calc(${theme.dimensions.bottomBarHeight}px + ${theme.spacing(1.5)})`,
    },
    zIndex: theme.zIndex.speedDial, // Ensure it sits above content but below potential overlays
  },
}));

const CollectionFab = ({ editPath, disabled }) => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const readonly = useRestriction('readonly');

  if (!readonly && !disabled) {
    return (
      <div className={classes.fab}>
        <Tooltip title={t('sharedAdd')}>
          <Fab size="small" color="primary" onClick={() => navigate(editPath)}>
            <AddIcon fontSize="small" />
          </Fab>
        </Tooltip>
      </div>
    );
  }
  return '';
};

export default CollectionFab;
