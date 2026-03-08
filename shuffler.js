const express = require("express");
const blessed = require("blessed");
const fs = require("fs");
const AuthScreen = require("./screens/authScreen.js");
const MainScreen = require("./screens/mainScreen.js");

const routes = require("./server/routes.js");
const getAppDataDir = require("./utilities/getAppDataDir.js");
const path = require("path");

const screen = blessed.screen({
	smartCSR: true,
	title: "Delta Shuffler",
	term: "xterm-256color"
});

const appDataDir = getAppDataDir();

if (!fs.existsSync(getAppDataDir())) {
	fs.mkdirSync(appDataDir, { recursive: true });
}

const dbFiles = [
	["algorithms.json", "./database/algorithms.example.json"],
	["playlists.json", "./database/playlists.example.json"],
	["playlistSongs.json", "./database/playlistSongs.example.json"],
	["settings.json", "./database/settings.example.json"],
	["songs.json", "./database/songs.example.json"]
];

for (const dbFile of dbFiles) {
	const currPath = path.join(appDataDir, dbFile[0]);
	if (!fs.existsSync(currPath)) {
		fs.copyFileSync(dbFile[1], currPath);
	}
}

const settings = JSON.parse(fs.readFileSync(path.join(appDataDir, "settings.json")));

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