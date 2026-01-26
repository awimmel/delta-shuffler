const createTable = require("./table.js");
const setTableKeypress = require("../utilities/setTableKeypress");

const playlistHelper = require("../backend/playlistHelper.js");

const columns = ["PLAYLIST", "SONG COUNT"];

class PlaylistTable {
	constructor(mainScreen, playlists, search, playlistDetailsView) {
		this.playlists = playlistHelper.sortPlaylists(playlists);
		this.filteredPlaylists = this.playlists;
		this.playlistCount = this.playlists.length;
		this.playlistTable = createTable(
			mainScreen,
			14,
			columns,
			playlistHelper.displayPlaylists(this.playlists),
			this.playlists
		);
		this.hidden = false;

		setTableKeypress(
			this.playlistTable,
			index => {
				search.setValue("");
				this.playlistTable.setData([columns, ...playlistHelper.displayPlaylists(this.playlists)]);

				const playlistId = this.filteredPlaylists[index - 1].id;
				const algorithmsTable = playlistDetailsView.algorithmsTable;
				algorithmsTable.setData(playlistId);

				const songsTable = playlistDetailsView.songsTable;
				songsTable.setData(playlistId);

				playlistDetailsView.playlistToolbar.setPlaylistId(playlistId);

				this.playlistTable.hide();
				this.hidden = true;

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
		this.playlists = playlistHelper.sortPlaylists(playlists);
		this.filteredPlaylists = this.playlists;
		this.playlistCount = this.playlists.length;
		this.playlistTable.setData([columns, ...playlistHelper.displayPlaylists(this.playlists)]);
	}

	getDataCount() {
		return this.playlistCount;
	}

	filterData(query) {
		this.filteredPlaylists = this.playlists.filter(item => item.name.toLowerCase().includes(query));
		this.playlistCount = this.filteredPlaylists.length;
		this.playlistTable.setData([
			columns,
			...playlistHelper.displayPlaylists(this.filteredPlaylists)
		]);
	}

	focus() {
		this.playlistTable.focus();
	}

	show() {
		this.playlistTable.show();
		this.hidden = false;
	}
}

module.exports = PlaylistTable;
