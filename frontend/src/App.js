import React, { useState, useEffect } from "react";
import Routes from "./routes";
import "react-toastify/dist/ReactToastify.css";

import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { ptBR } from "@mui/material/locale";

import { CssBaseline, FormControlLabel, FormGroup, Switch } from "@mui/material";

import api from "./services/api";
import toastError from "./errors/toastError";

import lightBackground from "./assets/wa-background-light.png";
import darkBackground from "./assets/wa-background-dark.jpg";
import config from "./config.json";

const useStyles = makeStyles(() => ({
  switch: {
    margin: "2px",
    position: "absolute", right: 0
  },
}));

const App = () => {
  const [locale, setLocale] = useState(ptBR);
  const [checked, setChecked] = useState(false);
  const classes = useStyles();

  const lightTheme = createTheme(
    {
      palette: {
        mode: 'light',
        primary: { main: config.system.color.lightTheme.palette.primary || "#6B62FE" },
        secondary: { main: config.system.color.lightTheme.palette.secondary || "#F50057" },
        toolbar: { main: config.system.color.lightTheme.toolbar.background || "#6B62FE" },
        menuItens: { main: config.system.color.lightTheme.menuItens || "#ffffff" },
        sub: { main: config.system.color.lightTheme.sub || "#ffffff" },
        toolbarIcon: { main: config.system.color.lightTheme.toolbarIcon || "#ffffff"},
        divide: { main: config.system.color.lightTheme.divide || "#E0E0E0" },
      },
      backgroundImage: `url(${lightBackground})`,
    },
    locale
  );

  const darkTheme = createTheme(
    {
      palette: {
        mode: 'dark',
        primary: { main: config.system.color.darkTheme.palette.primary || "#52d869" },
        secondary: { main: config.system.color.darkTheme.palette.secondary || "#ff9100" },
        toolbar: { main: config.system.color.darkTheme.toolbar.background || "#52d869" },
        menuItens: { main: config.system.color.darkTheme.menuItens || "#181d22" },
        sub: { main: config.system.color.darkTheme.sub || "#181d22" },
        toolbarIcon: { main: config.system.color.darkTheme.toolbarIcon || "#181d22"},
        divide: { main: config.system.color.darkTheme.divide || "#080d14" },
        background: {
          default: config.system.color.darkTheme.palette.background.default || "#080d14",
          paper: config.system.color.darkTheme.palette.background.paper || "#181d22",
        },
        text: {
          primary: config.system.color.darkTheme.palette.text.primary || "#52d869",
          secondary: config.system.color.darkTheme.palette.text.secondary || "#ffffff",
        },
      },
      backgroundImage: `url(${darkBackground})`,
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: "#080d14",
            },
          },
        },
      },
    },
    locale
  );

  const [theme, setTheme] = useState("light");

  const themeToggler = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
  };

  const handleChange = (event) => {
    setChecked (event.target.checked);
    themeToggler();
  };

  useEffect(() => {

    const fetchDarkMode = async () => {
      try {
        const { data } = await api.get("/settings");
        const settingIndex = data.filter(s => s.key === 'darkMode');

        if (settingIndex && settingIndex.length > 0 && settingIndex[0].value === "enabled") {
          setTheme("dark");
          setChecked(true);
        }

      } catch (err) {
        setTheme("light")
        toastError(err);
      }
    };

    fetchDarkMode();

  }, []);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
        <Routes />
        <FormGroup row className={classes.switch}>
          <FormControlLabel control={
          <Switch
            checked={checked}
            onChange={handleChange}
            inputProps={ {'aria-label': 'controlled' }}
          />}label="Dark Mode" />
          
        </FormGroup>
        <CssBaseline />
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;