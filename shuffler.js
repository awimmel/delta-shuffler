const express = require("express");
const blessed = require("blessed");
const fs = require("fs");
const AuthScreen = require("./screens/authScreen.js");
const MainScreen = require("./screens/mainScreen.js");

const routes = require("./server/routes.js");
const path = require("path");

const screen = blessed.screen({
	smartCSR: true,
	title: "Delta Shuffler",
	term: "xterm-256color"
});

const dbFiles = [
	["./database/algorithms.json", "./database/algorithms.example.json"],
	["./database/playlists.json", "./database/playlists.example.json"],
	["./database/playlistSongs.json", "./database/playlistSongs.example.json"],
	["./database/settings.json", "./database/settings.example.json"],
	["./database/songs.json", "./database/songs.example.json"]
];

for (const dbFile of dbFiles) {
	if (!fs.existsSync(dbFile[0])) {
		fs.copyFileSync(dbFile[1], dbFile[0]);
	}
}

const settings = JSON.parse(fs.readFileSync("./database/settings.json"));

if (!settings.clientId || !settings.clientSecret || !settings.accessToken || !settings.refreshToken) {
	const app = express();
	app.use(express.json());
	app.use("/", routes);
	app.use(express.static(path.join(__dirname, "/public")));
	const server = app.listen(3438);
	new AuthScreen(screen, server);
} else {
	new MainScreen(screen);
}