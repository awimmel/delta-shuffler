const blessed = require("blessed");

const createSongPopover = require("../components/popovers/songPopover");
const createAlgorithmPopover = require("../components/popovers/algorithmPopover");
const AlgorithmsTable = require("../tables/algorithmsTable");
const PlaylistToolbar = require("../components/playlistToolbar");
const SongsTable = require("../tables/songsTable");

const setTableKeypress = require("../utilities/setTableKeypress");
const focusFunction = require("../utilities/focusElement.js");

class PlaylistDetailsView {
	constructor(mainScreen, searchBar) {
		this.mainScreen = mainScreen;
		const parent = mainScreen.screen;
		this.playlistDetailsView = blessed.box({
			parent: parent,
			top: 11,
			left: 0,
			height: "100%-11",
			width: "100%",
			keys: true
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

		this.playlistDetailsView.hide();
		this.hidden = true;

		this.setColors();
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

	showAlgorithmsTable() {
		if (this.algorithmsTable.hidden) {
			this.songsTable.hide();
			this.algorithmsTable.show();
			this.algorithmsTable.focus();
		} else {
			this.algorithmsTable.focus();
		}
	}

	showSongsTable() {
		if (this.songsTable.hidden) {
			this.algorithmsTable.hide();
			this.songsTable.show();
			this.songsTable.focus();
		} else {
			this.songsTable.focus();
		}
	}

	setColors() {
		this.algorithmsTable.setColors();
		this.algorithmsTable.hide();
		this.songsTable.setColors();
		this.songsTable.hide();
		this.playlistToolbar.setColors();
		this.setTableKeypresses();
	}

	setTableKeypresses() {
		setTableKeypress(
			this.algorithmsTable.table,
			index => {
				const algorithm = this.algorithmsTable.filteredAlgorithms[index - 1];
				createAlgorithmPopover(this.mainScreen, this.algorithmsTable, algorithm);
			},
			focusFunction(this.playlistToolbar),
			this.playlistToolbar.backButton
		);
		setTableKeypress(
			this.songsTable.table,
			index => {
				createSongPopover(
					this.mainScreen,
					this.songsTable,
					this.songsTable.filteredSongs[index - 1]
				);
			},
			focusFunction(this.playlistToolbar),
			this.playlistToolbar.backButton
		);
	}
}

module.exports = PlaylistDetailsView;
