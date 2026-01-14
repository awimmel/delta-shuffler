const blessed = require("blessed");
const variables = require("../database/variables.json");
const primaryColor = variables.primaryColor;

const createSongPopover = require("../components/popovers/songPopover");
const createAlgorithmPopover = require("../components/popovers/algorithmPopover");
const AlgorithmsTable = require("../tables/algorithmsTable");
const PlaylistToolbar = require("../components/playlistToolbar");
const SongsTable = require("../tables/songsTable");

const setTableKeypress = require("../utilities/setTableKeypress");
const focusFunction = require("../utilities/focusElement.js");

class PlaylistDetailsView {
	constructor(mainScreen, searchBar) {
		const parent = mainScreen.screen;
		this.playlistDetailsView = blessed.box({
			parent: parent,
			top: 8,
			left: 0,
			height: "100%-8",
			width: "100%",
			keys: true,
			style: {
				header: {
					fg: primaryColor,
					bold: true
				},
				cell: {
					bold: true,
					selected: {
						bg: primaryColor,
						fg: "black",
						bold: true
					}
				}
			}
		});

		this.algorithmsTable = new AlgorithmsTable(this.playlistDetailsView);
		this.algorithmsTable.hide();

		this.songsTable = new SongsTable(this.playlistDetailsView);
		this.songsTable.hide();

		this.playlistToolbar = new PlaylistToolbar(
			mainScreen,
			this.playlistDetailsView,
			searchBar,
			this.algorithmsTable,
			this.songsTable
		);

		this.playlistToolbar.toolbar.on("keypress", (char, key) => {
			if (key.name === "up") {
				searchBar.focus();
			} else if (key.name === "down") {
				if (!this.algorithmsTable.hidden) {
					this.algorithmsTable.focus();
				} else {
					this.songsTable.focus();
				}
			}
		});

		setTableKeypress(
			this.algorithmsTable.table,
			index => {
				const algorithm = this.algorithmsTable.filteredAlgorithms[index - 1];
				createAlgorithmPopover(mainScreen, this.algorithmsTable, algorithm, searchBar);
			},
			focusFunction(this.playlistToolbar)
		);
		setTableKeypress(
			this.songsTable.table,
			index => {
				createSongPopover(mainScreen, this.songsTable, this.songsTable.filteredSongs[index - 1]);
			},
			focusFunction(this.playlistToolbar)
		);

		this.playlistDetailsView.hide();
		this.hidden = true;
	}

	show() {
		this.playlistDetailsView.show();
		this.hidden = false;
	}

	hide() {
		this.playlistDetailsView.hide();
		this.hidden = true;
	}

	focus(keyName) {
		if (keyName === "down") {
			this.playlistToolbar.focus();
		} else {
			this.getActiveTable().focus();
		}
	}

	getActiveTable() {
		if (this.algorithmsTable.hidden) {
			return this.songsTable;
		} else {
			return this.algorithmsTable;
		}
	}

	filterData(query) {
		this.getActiveTable().filterData(query);
	}

	getDataCount() {
		return this.getActiveTable().getDataCount();
	}
}

module.exports = PlaylistDetailsView;
