import { Fab } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useRestriction } from '../../common/util/permissions';

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

  const readonly = useRestriction('readonly');

  if (!readonly && !disabled) {
    return (
      <div className={classes.fab}>
        <Fab size="small" color="primary" onClick={() => navigate(editPath)}>
          <AddIcon fontSize="small" />
        </Fab>
      </div>
    );
  }
  return '';
};

export default CollectionFab;
