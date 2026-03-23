import React from "react";

import { makeStyles } from "@mui/material/styles";
import Container from "@mui/material/Container";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    flex: 1,
    padding: 16,
    height: `calc(100% - 48px)`
  },

  contentWrapper: {
    height: "100%",
    overflowY: "hidden",
    display: "flex",
    flexDirection: "column",
  },
}));

const MainContainer = ({ children }) => {
  const classes = useStyles();

  return (
    <Container className={classes.mainContainer} maxWidth={false}>
      <div className={classes.contentWrapper}>{children}</div>
    </Container>
  );
};

export default MainContainer;
