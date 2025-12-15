const createTable = require("./table.js");
const focusText = require("../utilities/focusText.js");
const setTableKeypress = require("../utilities/setTableKeypress");

const playlistHelper = require("../backend/playlistHelper.js");
const songHelper = require("../backend/songHelper.js");
const algorithmHelper = require("../backend/algorithmHelper.js");

class PlaylistTable {
	constructor(mainScreen, playlists, search, playlistDetailsView) {
		this.playlists = playlists;
		this.playlistsToDisplay = playlistHelper.displayPlaylists(this.playlists);
		this.playlistTable = createTable(
			mainScreen,
			11,
			["PLAYLIST", "SONG COUNT"],
			this.playlistsToDisplay,
			this.playlists
		);

		setTableKeypress(
			this.playlistTable,
			index => {
				search.setValue("");
				this.playlistTable.setData([["PLAYLIST", "SONG COUNT"], ...this.playlistsToDisplay]);

				const playlistId = this.playlists[index].id;
				const algorithmsTable = playlistDetailsView.algorithmsTable;
				const algorithms = algorithmHelper.readAlgorithms(playlistId)
				algorithmsTable.setData(algorithms);

				const songsTable = playlistDetailsView.songsTable;
				const songs = songHelper.readSongs(playlistId);
				songsTable.setData(songs);

				this.playlistTable.hide();
				playlistDetailsView.show();
				algorithmsTable.show();
				algorithmsTable.focus();
			},
			() => {
				focusText(search);
			}
		);
	}

	setData(playlists) {
		this.playlists = playlists;
		this.playlistsToDisplay = playlistHelper.displayPlaylists(this.playlists);
		this.playlistTable.setData([["PLAYLIST", "SONG COUNT"], ...this.playlistsToDisplay]);
	}

	focus() {
		this.playlistTable.focus();
	}

	show() {
		this.playlistTable.show();
	}
}

module.exports = PlaylistTable;
