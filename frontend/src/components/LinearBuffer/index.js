import React from 'react';
import { makeStyles } from "@mui/styles";
import LinearProgress from '@mui/material/LinearProgress';

const useStyles = makeStyles({
  root: {
    width: '100%',
    marginTop: '1rem',
  },
});

export default function LinearDeterminate({progressMessage}) {
  const classes = useStyles();
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    setProgress(progressMessage);
  }, [progressMessage]);

  return (
    <div className={classes.root}>
      <LinearProgress variant="determinate" value={progress} />
    </div>
  );
}
