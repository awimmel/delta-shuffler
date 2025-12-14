const blessed = require("blessed");
const createRefreshPopover = require("./popovers/refreshPopover.js");
const createSettingsPopover = require("./popovers/settingsPopover.js");
const focusText = require("../utilities/focusText.js");
const toolbarKeypress = require("../utilities/toolbarKeypress.js");
const focusFunction = require("../utilities/focusElement.js");
const variables = require("../database/variables.json");
const primaryColor = variables.primaryColor;

module.exports = function createMenu(mainScreen, searchBar) {
	// Toolbar container
	const toolbar = blessed.box({
		parent: mainScreen.screen,
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
	const currPlaying = blessed.box({
		parent: toolbar,
		content: "When I'm Sixty Four \u2014 The Beatles",
		top: 1,
		left: 0,
		height: 1,
		width: "50%-5",
		style: {
			bold: true
		}
	});

	// Playback tools
	const backSong = blessed.box({
		parent: toolbar,
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
	const pauseSong = blessed.box({
		parent: toolbar,
		content: "||",
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
	const skipSong = blessed.box({
		parent: toolbar,
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
	const refresh = blessed.box({
		parent: toolbar,
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
	const settings = blessed.box({
		parent: toolbar,
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
	const close = blessed.box({
		parent: toolbar,
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

	toolbarKeypress(
		backSong,
		() => {},
		focusFunction(pauseSong),
		() => {},
		() => {
			focusText(searchBar);
		},
		() => {}
	);
	toolbarKeypress(
		pauseSong,
		focusFunction(backSong),
		focusFunction(skipSong),
		() => {},
		() => {
			focusText(searchBar);
		},
		() => {}
	);
	toolbarKeypress(
		skipSong,
		focusFunction(pauseSong),
		focusFunction(refresh),
		() => {},
		() => {
			focusText(searchBar);
		},
		() => {}
	);
	toolbarKeypress(
		refresh,
		focusFunction(skipSong),
		focusFunction(settings),
		() => {},
		() => {
			focusText(searchBar);
		},
		() => {
			createRefreshPopover(mainScreen, refresh);
		}
	);
	toolbarKeypress(
		settings,
		focusFunction(refresh),
		focusFunction(close),
		() => {},
		() => {
			focusText(searchBar);
		},
		() => {
			createSettingsPopover(mainScreen.screen, settings);
		}
	);
	toolbarKeypress(
		close,
		focusFunction(settings),
		() => {},
		() => {},
		() => {
			focusText(searchBar);
		},
		() => process.exit(0)
	);

	return toolbar;
};
