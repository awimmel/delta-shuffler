const express = require("express");
const blessed = require("blessed");
const variables = require("./database/variables.json");

const AuthScreen = require("./authScreen.js");
const MainScreen = require("./mainScreen.js");

const routes = require("./server/routes.js");
const path = require("path");

const screen = blessed.screen({
	smartCSR: true,
	title: "Spotify Companion",
	term: "xterm-256color"
});

if (!variables.clientId || !variables.clientSecret || !variables.accessToken || !variables.refreshToken) {
	const app = express();
	app.use(express.json());
	app.use('/', routes);
	app.use(express.static(path.join(__dirname, '/public')));
	const server = app.listen(3438);
	new AuthScreen(screen, server);
} else {
	new MainScreen(screen);
}