const blessed = require("blessed");
const MainScreen = require("./mainScreen.js");

const screen = blessed.screen({
	smartCSR: true,
	title: "Spotify Companion",
	term: "xterm-256color"
});

const mainScreen = new MainScreen(screen);
