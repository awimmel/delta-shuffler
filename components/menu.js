const blessed = require("blessed");
const createRefreshPopover = require("./popovers/refreshPopover.js");
const createSettingsPopover = require("./popovers/settingsPopover.js");
const toolbarKeypress = require("../utilities/toolbarKeypress.js");
const playerHelper = require("../backend/playerHelper.js");
const variables = require("../database/variables.json");
const primaryColor = variables.primaryColor;

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
			height: 5,
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

		// Currently playing
		this.currPlaying = blessed.box({
			parent: this.toolbar,
			content: "",
			top: 1,
			left: 0,
			height: 1,
			width: "50%-5",
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
			content: pause,
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
		updateCurrPlaying(this.screen, this.currPlaying, this.pauseSong);

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
				await retrieveAndSetCurrPlaying(this.screen, this.currPlaying, this.pauseSong);
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
			() => {
				if (this.pauseSong.getContent() === pause) {
					playerHelper.pauseSong();
					this.pauseSong.setContent(play);
					this.screen.render();
				} else {
					playerHelper.playSong();
					this.pauseSong.setContent(pause);
					this.screen.render();
				}
			}
		);
		toolbarKeypress(
			this.skipSong,
			() => {
				this.prevFocus = this.pauseSong;
				this.pauseSong.focus();
			},
			() => {
				this.prevFocus = this.refresh;
				this.refresh.focus();
			},
			() => {},
			() => {
				this.searchBar.focus();
			},
			async () => {
				this.pauseSong.setContent(pause);
				await playerHelper.skipSong();
				await retrieveAndSetCurrPlaying(this.screen, this.currPlaying, this.pauseSong);
			}
		);
		toolbarKeypress(
			this.refresh,
			() => {
				this.prevFocus = this.skipSong;
				this.skipSong.focus();
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

async function updateCurrPlaying(screen, currPlaying, pauseSong) {
	await retrieveAndSetCurrPlaying(screen, currPlaying, pauseSong);

	setInterval(async () => {
		await retrieveAndSetCurrPlaying(screen, currPlaying, pauseSong);
	}, 15_000);
}

async function retrieveAndSetCurrPlaying(screen, currPlaying, pauseSong) {
	const playingResult = await playerHelper.getCurrPlaying();
	currPlaying.setContent(playingResult.content);
	const pauseContent = playingResult.playing ? pause : play;
	pauseSong.setContent(pauseContent);
	screen.render();
}
