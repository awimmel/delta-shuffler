const blessed = require("blessed");
const variables = require("../database/variables.json");
const primaryColor = variables.primaryColor;

const createPlaylistToolbar = require("../components/playlistToolbar");
const createSongPopover = require("../components/popovers/songPopover");
const createAlgorithmPopover = require("../components/popovers/algorithmPopover");
const AlgorithmsTable = require("../tables/algorithmsTable");
const SongsTable = require("../tables/songsTable");

const setTableKeypress = require("../utilities/setTableKeypress");

class PlaylistDetailsView {
	constructor(parent, searchBar) {
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

		this.algorithmsTable = new AlgorithmsTable(this.playlistDetailsView, []);
		this.algorithmsTable.hide();

		this.songsTable = new SongsTable(this.playlistDetailsView, []);
		this.songsTable.hide();

		this.playlistToolbar = createPlaylistToolbar(
			this.playlistDetailsView,
			searchBar,
			this.algorithmsTable,
			this.songsTable
		);
		const createAlgorithmButton = this.playlistToolbar.children[0];

		this.playlistToolbar.on("keypress", (char, key) => {
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
				const algorithm = this.algorithmsTable.algorithms[index - 1];
				createAlgorithmPopover(parent, this.algorithmsTable, algorithm, searchBar);
			},
			() => createAlgorithmButton.focus()
		);
		setTableKeypress(
			this.songsTable.table,
			index => {
				createSongPopover(parent, this.songsTable, this.songsTable.songs[index - 1]);
			},
			() => createAlgorithmButton.focus()
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

	getActiveTable() {
		if (this.algorithmsTable.hidden) {
			return this.songsTable;
		} else {
			return this.algorithmsTable;
		}
	}
}

module.exports = PlaylistDetailsView;
