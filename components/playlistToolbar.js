const blessed = require("blessed");
const focusText = require("../utilities/focusText.js");
const toolbarKeypress = require("../utilities/toolbarKeypress.js");
const focusFunction = require("../utilities/focusElement.js");
const NameAlgorithmPopover = require("../components/popovers/nameAlgorithmPopover.js");
const variables = require("../database/variables.json");
const primaryColor = variables.primaryColor;

class PlaylistToolbar {
	constructor(parent, searchBar, algorithmsTable, songsTable) {
		this.searchBar = searchBar;
		this.algorithmsTable = algorithmsTable;
		this.songsTable = songsTable;

		this.toolbar = blessed.box({
			parent: parent,
			top: 0,
			left: 0,
			height: 3,
			width: "100%",
			content: "",
			keys: true
		});

		this.backButton = blessed.box({
			parent: this.toolbar,
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

		this.createAlgorithm = blessed.box({
			parent: this.toolbar,
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

		this.showAlgorithms = blessed.box({
			parent: this.toolbar,
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

		this.showSongs = blessed.box({
			parent: this.toolbar,
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
			this.createAlgorithm,
			focusFunction(this.backButton),
			focusFunction(this.showAlgorithms),
			() => {
				focusText(this.searchBar);
			},
			() => {
				this.focusTable();
			},
			() => {
				new NameAlgorithmPopover(parent.parent, this.backButton, this.searchBar, "1");
			}
		);
		toolbarKeypress(
			this.showAlgorithms,
			focusFunction(this.createAlgorithm),
			focusFunction(this.showSongs),
			() => {
				focusText(this.searchBar);
			},
			() => {
				this.focusTable();
			},
			() => {
				this.searchBar.setValue("");

				this.songsTable.hide();
				this.algorithmsTable.show();
				this.algorithmsTable.focus();
			}
		);
		toolbarKeypress(
			this.showSongs,
			focusFunction(this.showAlgorithms),
			() => {},
			() => {
				focusText(this.searchBar);
			},
			() => {
				this.focusTable();
			},
			() => {
				this.searchBar.setValue("");

				this.algorithmsTable.hide();
				this.songsTable.show();
				this.songsTable.focus();
			}
		);
	}

	focusTable() {
		if (!this.algorithmsTable.hidden) {
			this.algorithmsTable.focus();
		} else {
			this.songsTable.focus();
		}
	}
}

module.exports = PlaylistToolbar;
