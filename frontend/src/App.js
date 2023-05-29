import React, { useState, useEffect } from "react";
import Routes from "./routes";
import "react-toastify/dist/ReactToastify.css";

import { createTheme, makeStyles, ThemeProvider } from "@material-ui/core/styles";
import { ptBR } from "@material-ui/core/locale";

import { CssBaseline, FormControlLabel, FormGroup, Switch } from "@material-ui/core";

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
  const [locale, setLocale] = useState();
  const [checked, setChecked] = useState(false);
  const classes = useStyles();

  const lightTheme = createTheme(
    {
      scrollbarStyles: {
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
          backgroundColor: "#e8e8e8",
        },
      },
      palette: {
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
      overrides: {
        MuiCssBaseline: {
          '@global': {
            body: {
              backgroundColor: "#080d14",
            }
          }
        }
      },
      scrollbarStyles: {
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
          backgroundColor: "#ffffff",
        },
      },
      palette: {
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
    },
    locale
  );

  const [theme, setTheme] = useState("light");

  const themeToggler = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
  };

  const handleChange = (event) => {
    setChecked (event.target.checked);
    if(checked === false)
    {
      themeToggler();
    }
    else if (checked === true) {
      themeToggler();
    }
  };

  useEffect(() => {

    const fetchDarkMode = async () => {
      try {
        const { data } = await api.get("/settings");
        const settingIndex = data.filter(s => s.key === 'darkMode');

        if (settingIndex[0].value === "enabled") {
          setTheme("dark")
        }

      } catch (err) {
        setTheme("light")
        toastError(err);
      }
    };

    fetchDarkMode();

  }, []);

  useEffect(() => {
    const i18nlocale = localStorage.getItem("i18nextLng");
    const browserLocale = i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);

    if (browserLocale === "ptBR") {
      setLocale(ptBR);
    }
  }, []);

  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <Routes />
      <FormGroup row className={classes.switch}>
        <FormControlLabel control={
        <Switch
          cheked={checked}
          onChange={handleChange}
          inputProps={ {'aria-label': 'controlled' }}
        />}label="Dark Mode" />
        
      </FormGroup>
      <CssBaseline />
    </ThemeProvider>
  );
};

export default App;