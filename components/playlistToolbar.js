const blessed = require("blessed");
const focusText = require("../utilities/focusText.js");
const toolbarKeypress = require("../utilities/toolbarKeypress.js");
const focusFunction = require("../utilities/focusElement.js");
const NameAlgorithmPopover = require("../components/popovers/nameAlgorithmPopover.js");
const variables = require("../database/variables.json");
const primaryColor = variables.primaryColor;
const songHelper = require("../backend/songHelper.js");

let localSearchBar;
let localAlgorithmsTable;
let localSongsTable;

module.exports = function createPlaylistToolbar(parent, searchBar, algorithmsTable, songsTable) {
	localSearchBar = searchBar;
	localAlgorithmsTable = algorithmsTable;
	localSongsTable = songsTable;

	const playlistToolbar = blessed.box({
		parent: parent,
		top: 0,
		left: 0,
		height: 3,
		width: "100%",
		content: "",
		keys: true
	});

	const backButton = blessed.box({
		parent: playlistToolbar,
		top: 0,
		left: 0,
		height: 3,
		width: 6,
		content: "Back",
		border: "line",
		keys: true,
		style: {
			fg: "white",
			focus: {
				fg: "black",
				bg: primaryColor,
				border: {
					fg: "white"
				}
			},
			border: {
				fg: primaryColor
			}
		}
	});

	const createAlgorithm = blessed.box({
		parent: playlistToolbar,
		top: 0,
		left: 6,
		height: 3,
		width: 19,
		content: "Create Algorithm",
		border: "line",
		keys: true,
		style: {
			fg: "white",
			focus: {
				fg: "black",
				bg: primaryColor,
				border: {
					fg: "white"
				}
			},
			border: {
				fg: primaryColor
			}
		}
	});

	const showAlgorithms = blessed.box({
		parent: playlistToolbar,
		top: 0,
		left: 25,
		height: 3,
		width: 17,
		content: "Show Algorithms",
		border: "line",
		keys: true,
		style: {
			fg: "white",
			focus: {
				fg: "black",
				bg: primaryColor,
				border: {
					fg: "white"
				}
			},
			border: {
				fg: primaryColor
			}
		}
	});

	const showSongs = blessed.box({
		parent: playlistToolbar,
		top: 0,
		left: 42,
		height: 3,
		width: 12,
		content: "Show Songs",
		border: "line",
		keys: true,
		style: {
			fg: "white",
			focus: {
				fg: "black",
				bg: primaryColor,
				border: {
					fg: "white"
				}
			},
			border: {
				fg: primaryColor
			}
		}
	});

	toolbarKeypress(
		createAlgorithm,
		focusFunction(backButton),
		focusFunction(showAlgorithms),
		() => {
			focusText(localSearchBar);
		},
		() => {
			focusTable();
		},
		() => {
			new NameAlgorithmPopover(parent.parent, backButton, searchBar, "1");
		}
	);
	toolbarKeypress(
		showAlgorithms,
		focusFunction(createAlgorithm),
		focusFunction(showSongs),
		() => {
			focusText(localSearchBar);
		},
		() => {
			focusTable();
		},
		() => {
			searchBar.setValue("");
			localAlgorithmsTable.setData([["NAME"], ...localAlgorithmsTable._rawData]);

			localSongsTable.hide();
			localAlgorithmsTable.show();
			localAlgorithmsTable.focus();
		}
	);
	toolbarKeypress(
		showSongs,
		focusFunction(showAlgorithms),
		() => {},
		() => {
			focusText(localSearchBar);
		},
		() => {
			focusTable();
		},
		() => {
			searchBar.setValue("");
			localSongsTable.setData([
				["SONG", "ARTIST", "ALBUM"],
				...songHelper.displaySongs(localSongsTable.rawData)
			]);

			localAlgorithmsTable.hide();
			localSongsTable.show();
			localSongsTable.focus();
		}
	);

	return playlistToolbar;
};

function focusTable() {
	if (!localAlgorithmsTable.hidden) {
		localAlgorithmsTable.focus();
	} else {
		localSongsTable.focus();
	}
}
