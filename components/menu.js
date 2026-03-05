const blessed = require("blessed");
const createRefreshPopover = require("./popovers/refreshPopover.js");
const createSettingsPopover = require("./popovers/settingsPopover.js");
const toolbarKeypress = require("../utilities/toolbarKeypress.js");
const displayString = require("../utilities/displayString.js");
const setFocusStyle = require("../utilities/setFocusStyle.js");
const playerHelper = require("../backend/playerHelper.js");
const settingsHelper = require("../backend/settingsHelper.js");
const PlayerOptions = require("../components/playerOptions.js");
const SongProgressBar = require("../components/songProgressBar.js");
const path = require("path");

const imagePath = path.join(__dirname, "../tmp", `album_cover.png`);
const pause = "||";
const play = "▷";

class Menu {
	constructor(mainScreen, searchBar) {
		this.screen = mainScreen.screen;
		this.searchBar = searchBar;

		// Toolbar container
		this.toolbar = blessed.box({
			parent: this.screen,
			top: 0,
			left: 0,
			border: "line"
		});

		this.albumArt = blessed.image({
			parent: this.toolbar,
			top: 0,
			left: 1,
			width: 20,
			height: 10,
			align: "left",
			file: imagePath,
			type: "ansi",
			hidden: true
		});

		// Currently playing
		this.currPlaying = blessed.box({
			parent: this.toolbar,
			content: "",
			top: 1,
			height: 3
		});

		// Playback tools
		this.playerOptions = new PlayerOptions(this, this.toolbar, this.searchBar);

		// Refresh button
		this.refresh = blessed.box({
			parent: this.toolbar,
			content: "Refresh",
			top: 0,
			right: 17,
			height: 3,
			width: 9,
			align: "center",
			valign: "middle",
			border: "line"
		});

		// Settings button
		this.settings = blessed.box({
			parent: this.toolbar,
			content: "Settings",
			top: 0,
			right: 7,
			height: 3,
			width: 10,
			align: "center",
			valign: "middle",
			border: "line"
		});

		// Close button
		this.close = blessed.box({
			parent: this.toolbar,
			content: "Close",
			top: 0,
			right: 0,
			height: 3,
			width: 7,
			align: "center",
			valign: "middle",
			border: "line"
		});

		this.songProgressBar = new SongProgressBar(this.toolbar, this.screen);
		updateCurrPlaying(
			this.screen,
			this.albumArt,
			this.currPlaying,
			this.playerOptions.pauseSong,
			this.songProgressBar
		);

		toolbarKeypress(
			this.refresh,
			() => {
				if (!settingsHelper.getShowAlbumArt()) {
					this.playerOptions.focusRight();
				}
			},
			() => {
				this.settings.focus();
			},
			() => {},
			() => {
				if (settingsHelper.getShowAlbumArt()) {
					this.playerOptions.focus();
				} else {
					this.searchBar.focus();
				}
			},
			async () => {
				await createRefreshPopover(mainScreen, this.refresh, true);
			}
		);
		toolbarKeypress(
			this.settings,
			() => {
				this.refresh.focus();
			},
			() => {
				this.close.focus();
			},
			() => {},
			() => {
				if (settingsHelper.getShowAlbumArt()) {
					this.playerOptions.focus();
				} else {
					this.searchBar.focus();
				}
			},
			() => {
				createSettingsPopover(mainScreen, this.settings);
			}
		);
		toolbarKeypress(
			this.close,
			() => {
				this.settings.focus();
			},
			() => {},
			() => {},
			() => {
				if (settingsHelper.getShowAlbumArt()) {
					this.playerOptions.focus();
				} else {
					this.searchBar.focus();
				}
			},
			() => process.exit(0)
		);

		this.resizeAndSetColors();

		this.screen.render();
	}

	focus() {
		this.playerOptions.focus();
	}

	async back() {
		this.pauseSong.setContent(pause);
		await playerHelper.prevSong();

		// Give Spotify a tenth of a second to account for the request
		setTimeout(
			() =>
				retrieveAndSetCurrPlaying(
					this.screen,
					this.albumArt,
					this.currPlaying,
					this.pauseSong,
					this.songProgressBar
				),
			100
		);
	}

	async togglePlayback() {
		let modifPlayback = false;
		if (this.pauseSong.getContent() === pause) {
			modifPlayback = await playerHelper.pauseSong();
			this.songProgressBar.pause();
		} else {
			modifPlayback = await playerHelper.playSong();
			this.songProgressBar.setAutoUpdate();
		}

		if (modifPlayback) {
			this.pauseSong.setContent(this.pauseSong.getContent() === pause ? play : pause);
			this.screen.render();
		}
	}

	async skip() {
		this.pauseSong.setContent(pause);
		await playerHelper.skipSong();

		// Give Spotify a tenth of a second to account for the request
		setTimeout(
			() =>
				retrieveAndSetCurrPlaying(
					this.screen,
					this.albumArt,
					this.currPlaying,
					this.pauseSong,
					this.songProgressBar
				),
			100
		);
	}

	queue() {
		playerHelper.queueSongs([this.currPlaying.id]);
	}

	reshuffleSongs() {
		playerHelper.reshuffleSongs();
	}

	focusClose() {
		this.close.focus();
	}

	resizeAndSetColors() {
		this.adjAlbumArt();
		this.setColors();
		this.songProgressBar.resizeAndSetColors();
		this.playerOptions.resizeAndSetColors();
	}

	adjAlbumArt() {
		const showAlbumArt = settingsHelper.getShowAlbumArt();
		if (!showAlbumArt) {
			this.albumArt.hidden = true;
		}

		this.toolbar.height = showAlbumArt ? 12 : 9;
		this.currPlaying.left = showAlbumArt ? 23 : 1;
		this.currPlaying.width = showAlbumArt ? "100%-52" : "50%-6";
	}

	setColors() {
		this.toolbar.style = {
			bold: true,
			border: {
				fg: settingsHelper.getPrimary()
			}
		};
		this.currPlaying.style = {
			fg: settingsHelper.getText(),
			bold: true
		};

		this.refresh.style = {
			fg: settingsHelper.getText(),
			border: {
				fg: settingsHelper.getConfirmation()
			},
			bold: true
		};
		setFocusStyle(this.refresh, false, settingsHelper.getConfirmation());

		this.settings.style = {
			fg: settingsHelper.getText(),
			border: {
				fg: settingsHelper.getUtility()
			},
			bold: true
		};
		setFocusStyle(this.settings, false, settingsHelper.getUtility());

		this.close.style = {
			fg: settingsHelper.getText(),
			border: {
				fg: settingsHelper.getDecline()
			},
			bold: true
		};
		setFocusStyle(this.close, false, settingsHelper.getDecline());

		this.screen.render();
	}

	focusOptions() {
		this.refresh.focus();
	}

	updateCurrPlaying() {
		retrieveAndSetCurrPlaying(
			this.screen,
			this.albumArt,
			this.currPlaying,
			this.playerOptions.pauseSong,
			this.songProgressBar
		);
	}

	getCurrPlayingId() {
		return this.currPlaying.id;
	}
}

module.exports = Menu;

async function updateCurrPlaying(screen, albumArt, currPlaying, pauseSong, songProgressBar) {
	await retrieveAndSetCurrPlaying(screen, albumArt, currPlaying, pauseSong, songProgressBar);

	setInterval(async () => {
		await retrieveAndSetCurrPlaying(screen, albumArt, currPlaying, pauseSong, songProgressBar);
	}, 5_000);
}

async function retrieveAndSetCurrPlaying(
	screen,
	albumArt,
	currPlaying,
	pauseSong,
	songProgressBar
) {
	const playingResult = await playerHelper.getCurrPlaying();

	const showAlbumArt = settingsHelper.getShowAlbumArt();
	if (showAlbumArt) {
		albumArt.clearImage();
		albumArt.setImage(imagePath);
	}

	const songAndArtist = displayString(playingResult.songAndArtist, currPlaying.width);
	const album = displayString(playingResult.album, currPlaying.width);
	currPlaying.setContent(`${songAndArtist}\n\n${album}`);
	currPlaying.id = playingResult.songId;
	const pauseContent = playingResult.playing ? pause : play;
	pauseSong.setContent(pauseContent);

	if (
		playingResult.songAndArtist &&
		playingResult.playing &&
		playingResult.spot &&
		playingResult.duration
	) {
		songProgressBar.setProgress(playingResult.spot, playingResult.duration);
		albumArt.hidden = !showAlbumArt;
	} else if (
		playingResult.songAndArtist &&
		!playingResult.playing &&
		playingResult.spot &&
		playingResult.duration
	) {
		songProgressBar.pauseWithOverride(playingResult.spot, playingResult.duration);
		albumArt.hidden = !showAlbumArt;
	} else {
		songProgressBar.hide();
		albumArt.hidden = true;
	}
	screen.render();
}
