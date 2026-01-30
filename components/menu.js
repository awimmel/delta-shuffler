const blessed = require("blessed");
const createRefreshPopover = require("./popovers/refreshPopover.js");
const createSettingsPopover = require("./popovers/settingsPopover.js");
const toolbarKeypress = require("../utilities/toolbarKeypress.js");
const displayString = require("../utilities/displayString.js");
const playerHelper = require("../backend/playerHelper.js");
const variables = require("../database/variables.json");
const SongProgressBar = require("../components/songProgressBar.js");
const primaryColor = variables.primaryColor;
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
			height: 8,
			border: "line",
			style: {
				bold: true,
				border: {
					fg: primaryColor
				},
				focus: {
					border: {
						fg: "white"
					}
				}
			}
		});

		this.albumArt = blessed.image({
			parent: this.toolbar,
			top: 0,
			left: 1,
			width: 12,
			height: 6,
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
			left: 14,
			height: 1,
			width: "50%-19",
			style: {
				bold: true
			}
		});

		// Playback tools
		this.backSong = blessed.box({
			parent: this.toolbar,
			content: "<<",
			top: 0,
			left: "50%-4",
			height: 3,
			width: 4,
			border: "line",
			style: {
				fg: "white",
				border: {
					fg: primaryColor
				},
				focus: {
					fg: "black",
					bg: primaryColor,
					border: {
						fg: "white"
					}
				},
				bold: true
			}
		});
		this.pauseSong = blessed.box({
			parent: this.toolbar,
			content: play,
			top: 0,
			left: "50%",
			height: 3,
			width: 4,
			border: "line",
			style: {
				fg: "white",
				border: {
					fg: primaryColor
				},
				focus: {
					fg: "black",
					bg: primaryColor,
					border: {
						fg: "white"
					}
				},
				bold: true
			}
		});

		this.skipSong = blessed.box({
			parent: this.toolbar,
			content: ">>",
			top: 0,
			left: "50%+4",
			height: 3,
			width: 4,
			border: "line",
			style: {
				fg: "white",
				border: {
					fg: primaryColor
				},
				focus: {
					fg: "black",
					bg: primaryColor,
					border: {
						fg: "white"
					}
				},
				bold: true
			}
		});

		this.queueSong = blessed.box({
			parent: this.toolbar,
			content: "+≡",
			top: 0,
			left: "50%+8",
			height: 3,
			width: 4,
			border: "line",
			style: {
				fg: "white",
				border: {
					fg: primaryColor
				},
				focus: {
					fg: "black",
					bg: primaryColor,
					border: {
						fg: "white"
					}
				},
				bold: true
			}
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
			border: "line",
			style: {
				fg: "white",
				border: {
					fg: "blue"
				},
				focus: {
					bg: "blue",
					border: {
						fg: "white"
					}
				},
				bold: true
			}
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
			border: "line",
			style: {
				fg: "white",
				border: {
					fg: "gray"
				},
				focus: {
					bg: "gray",
					border: {
						fg: "white"
					}
				},
				bold: true
			}
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
			border: "line",
			style: {
				fg: "white",
				border: {
					fg: "red"
				},
				focus: {
					bg: "red",
					border: {
						fg: "white"
					}
				},
				bold: true
			}
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
				let modifPlayback = false;
				if (this.pauseSong.getContent() === pause) {
					modifPlayback = await playerHelper.pauseSong();
				} else {
					modifPlayback = await playerHelper.playSong();
				}

				if (modifPlayback) {
					this.pauseSong.setContent(this.pauseSong.getContent() === pause ? play : pause);
					this.screen.render();
				}

				this.songProgressBar.pause();
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
		);
		toolbarKeypress(
			this.queueSong,
			() => {
				this.prevFocus = this.skipSong;
				this.skipSong.focus();
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
				playerHelper.queueSongs([this.currPlaying.id]);
			}
		);
		toolbarKeypress(
			this.refresh,
			() => {
				this.prevFocus = this.queueSong;
				this.queueSong.focus();
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

		this.screen.render();
	}

	focus() {
		this.prevFocus.focus();
	}

	focusBack() {
		this.backSong.focus();
	}

	focusPause() {
		this.pauseSong.focus();
	}

	focusSkip() {
		this.skipSong.focus();
	}

	focusClose() {
		this.close.focus();
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

	currPlaying.setContent(displayString(playingResult.content, currPlaying.width));
	currPlaying.id = playingResult.songId;
	const pauseContent = playingResult.playing ? pause : play;
	pauseSong.setContent(pauseContent);

	if (playingResult.content && playingResult.playing && playingResult.spot && playingResult.duration) {
		songProgressBar.setProgress(playingResult.spot, playingResult.duration);
		albumArt.hidden = false;
	} else if (playingResult.content && !playingResult.playing && playingResult.spot && playingResult.duration) {
		songProgressBar.pause(playingResult.spot, playingResult.duration);
		albumArt.hidden = false;
	} else {
		songProgressBar.hide();
		albumArt.hidden = true;
	}
	screen.render();
}
