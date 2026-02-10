const blessed = require("blessed");
const createRefreshPopover = require("./popovers/refreshPopover.js");
const createSettingsPopover = require("./popovers/settingsPopover.js");
const toolbarKeypress = require("../utilities/toolbarKeypress.js");
const displayString = require("../utilities/displayString.js");
const playerHelper = require("../backend/playerHelper.js");
const themeHelper = require("../backend/themeHelper.js");
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
			height: 12,
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
			left: 23,
			height: 3,
			width: "100%-52"
		});

		// Playback tools
		this.backSong = blessed.box({
			parent: this.toolbar,
			content: "<<",
			bottom: 0,
			left: "50%-6",
			height: 3,
			width: 4,
			border: "line"
		});
		this.pauseSong = blessed.box({
			parent: this.toolbar,
			content: play,
			bottom: 0,
			left: "50%-2",
			height: 3,
			width: 4,
			border: "line"
		});

		this.skipSong = blessed.box({
			parent: this.toolbar,
			content: ">>",
			bottom: 0,
			left: "50%+2",
			height: 3,
			width: 4,
			border: "line"
		});

		this.queueSong = blessed.box({
			parent: this.toolbar,
			content: "+≡",
			bottom: 0,
			left: "50%+6",
			height: 3,
			width: 4,
			border: "line"
		});

		this.reshuffle = blessed.box({
			parent: this.toolbar,
			content: "Reshuffle",
			bottom: 0,
			left: "50%+10",
			height: 3,
			width: 11,
			border: "line"
		});

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
			this.pauseSong,
			this.songProgressBar
		);

		this.prevFocus = this.pauseSong;

		toolbarKeypress(
			this.backSong,
			() => {},
			() => {
				this.prevFocus = this.pauseSong;
				this.pauseSong.focus();
			},
			() => {},
			() => {
				this.searchBar.focus();
			},
			async () => {
				await this.back();
			}
		);
		toolbarKeypress(
			this.pauseSong,
			() => {
				this.prevFocus = this.backSong;
				this.backSong.focus();
			},
			() => {
				this.prevFocus = this.skipSong;
				this.skipSong.focus();
			},
			() => {},
			() => {
				this.searchBar.focus();
			},
			async () => {
				await this.togglePlayback();
			}
		);
		toolbarKeypress(
			this.skipSong,
			() => {
				this.prevFocus = this.pauseSong;
				this.pauseSong.focus();
			},
			() => {
				this.prevFocus = this.queueSong;
				this.queueSong.focus();
			},
			() => {},
			() => {
				this.searchBar.focus();
			},
			async () => {
				await this.skip();
			}
		);
		toolbarKeypress(
			this.queueSong,
			() => {
				this.prevFocus = this.skipSong;
				this.skipSong.focus();
			},
			() => {
				this.prevFocus = this.reshuffle;
				this.reshuffle.focus();
			},
			() => {},
			() => {
				this.searchBar.focus();
			},
			() => {
				playerHelper.queueSongs([this.currPlaying.id]);
			}
		);
		toolbarKeypress(
			this.reshuffle,
			() => {
				this.prevFocus = this.queueSong;
				this.queueSong.focus();
			},
			() => {
				this.prevFocus = this.refresh;
				this.refresh.focus();
			},
			() => {},
			() => {
				this.searchBar.focus();
			},
			() => {
				playerHelper.reshuffleSongs();
			}
		);
		toolbarKeypress(
			this.refresh,
			() => {
				this.prevFocus = this.reshuffle;
				this.reshuffle.focus();
			},
			() => {
				this.prevFocus = this.settings;
				this.settings.focus();
			},
			() => {},
			() => {
				this.searchBar.focus();
			},
			() => {
				createRefreshPopover(mainScreen, this.refresh);
			}
		);
		toolbarKeypress(
			this.settings,
			() => {
				this.prevFocus = this.refresh;
				this.refresh.focus();
			},
			() => {
				this.prevFocus = this.close;
				this.close.focus();
			},
			() => {},
			() => {
				this.searchBar.focus();
			},
			() => {
				createSettingsPopover(mainScreen, this.settings);
			}
		);
		toolbarKeypress(
			this.close,
			() => {
				this.prevFocus = this.settings;
				this.settings.focus();
			},
			() => {},
			() => {},
			() => {
				this.searchBar.focus();
			},
			() => process.exit(0)
		);

		this.setColors();

		this.screen.render();
	}

	focus() {
		this.prevFocus.focus();
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

	setColors() {
		this.toolbar.style = {
			bold: true,
			border: {
				fg: themeHelper.getPrimary()
			}
		};
		this.currPlaying.style = {
			fg: themeHelper.getText(),
			bold: true
		};

		const playerButtonStyle = {
			fg: themeHelper.getText(),
			border: {
				fg: themeHelper.getPrimary()
			},
			bold: true
		};
		this.backSong.style = JSON.parse(JSON.stringify(playerButtonStyle));
		setFocus(this.backSong, true, themeHelper.getPrimary());

		this.pauseSong.style = JSON.parse(JSON.stringify(playerButtonStyle));
		setFocus(this.pauseSong, true, themeHelper.getPrimary());

		this.skipSong.style = JSON.parse(JSON.stringify(playerButtonStyle));
		setFocus(this.skipSong, true, themeHelper.getPrimary());

		this.queueSong.style = JSON.parse(JSON.stringify(playerButtonStyle));
		setFocus(this.queueSong, true, themeHelper.getPrimary());

		this.reshuffle.style = JSON.parse(JSON.stringify(playerButtonStyle));
		setFocus(this.reshuffle, true, themeHelper.getPrimary());

		this.refresh.style = {
			fg: themeHelper.getText(),
			border: {
				fg: themeHelper.getConfirmation()
			},
			bold: true
		};
		setFocus(this.refresh, false, themeHelper.getConfirmation());

		this.settings.style = {
			fg: themeHelper.getText(),
			border: {
				fg: themeHelper.getUtility()
			},
			bold: true
		};
		setFocus(this.settings, false, themeHelper.getUtility());

		this.close.style = {
			fg: themeHelper.getText(),
			border: {
				fg: themeHelper.getDecline()
			},
			bold: true
		};
		setFocus(this.close, false, themeHelper.getDecline());

		this.songProgressBar.setColors();

		this.screen.render();
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

	albumArt.clearImage();
	albumArt.setImage(imagePath);

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
		albumArt.hidden = false;
	} else if (
		playingResult.songAndArtist &&
		!playingResult.playing &&
		playingResult.spot &&
		playingResult.duration
	) {
		songProgressBar.pauseWithOverride(playingResult.spot, playingResult.duration);
		albumArt.hidden = false;
	} else {
		songProgressBar.hide();
		albumArt.hidden = true;
	}
	screen.render();
}

function setFocus(el, setFg, focusColor) {
	el.on("focus", function () {
		if (setFg) {
			this.style.fg = themeHelper.getSecondary();
		}
		this.style.bg = focusColor;
		this.style.border.fg = themeHelper.getFocus();
		this.screen.render();
	});

	el.on("blur", function () {
		if (setFg) {
			this.style.fg = themeHelper.getText();
		}
		this.style.bg = "none";
		this.style.border.fg = focusColor;
		this.screen.render();
	});
}
