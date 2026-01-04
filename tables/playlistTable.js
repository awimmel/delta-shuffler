const createTable = require("./table.js");
const setTableKeypress = require("../utilities/setTableKeypress");

const playlistHelper = require("../backend/playlistHelper.js");

const columns = ["PLAYLIST", "SONG COUNT"];

class PlaylistTable {
	constructor(mainScreen, playlists, search, playlistDetailsView) {
		this.playlists = playlistHelper.sortPlaylists(playlists);
		this.playlistTable = createTable(
			mainScreen,
			11,
			columns,
			playlistHelper.displayPlaylists(this.playlists),
			this.playlists
		);

		setTableKeypress(
			this.playlistTable,
			index => {
				search.setValue("");
				this.playlistTable.setData([columns, ...playlistHelper.displayPlaylists(this.playlists)]);

				const playlistId = this.playlists[index - 1].id;
				const algorithmsTable = playlistDetailsView.algorithmsTable;
				algorithmsTable.setData(playlistId);

				const songsTable = playlistDetailsView.songsTable;
				songsTable.setData(playlistId);

				this.playlistTable.hide();
				playlistDetailsView.show();
				algorithmsTable.show();
				algorithmsTable.focus();
			},
			() => {
				search.focus();
			}
		);
	}

	setData(playlists) {
		this.playlists = playlists;
		this.playlistTable.setData([columns, ...playlistHelper.displayPlaylists(this.playlists)]);
	}

	filterData(query) {
		const filteredPlaylists = this.playlists.filter(item => item.name.toLowerCase().includes(query));
		this.playlistTable.setData([columns, ...playlistHelper.displayPlaylists(filteredPlaylists)]);
	}

	focus() {
		this.playlistTable.focus();
	}

	show() {
		this.playlistTable.show();
	}
}

module.exports = PlaylistTable;
