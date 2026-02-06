const createTable = require("./table.js");
const setTableKeypress = require("../utilities/setTableKeypress");

const playlistHelper = require("../backend/playlistHelper.js");

const columns = ["PLAYLIST", "SONG COUNT"];

class PlaylistTable {
	constructor(screen, playlists, search, playlistDetailsView) {
		this.screen = screen;
		this.playlists = playlistHelper.sortPlaylists(playlists);
		this.filteredPlaylists = this.playlists;
		this.playlistCount = this.playlists.length;
		this.playlistTable = createTable(
			this.screen,
			14,
			columns,
			playlistHelper.displayPlaylists(this.playlists, this.screen.width)
		);
		this.search = search;
		this.playlistDetailsView = playlistDetailsView;
		this.setKeypresses();
		this.hidden = false;
	}

	setData(playlists) {
		this.playlists = playlistHelper.sortPlaylists(playlists);
		this.filteredPlaylists = this.playlists;
		this.playlistCount = this.playlists.length;
		this.playlistTable.setData([
			columns,
			...playlistHelper.displayPlaylists(this.playlists, this.screen.width)
		]);
	}

	getDataCount() {
		return this.playlistCount;
	}

	filterData(query) {
		this.filteredPlaylists = this.playlists.filter(item => item.name.toLowerCase().includes(query));
		this.playlistCount = this.filteredPlaylists.length;
		this.playlistTable.setData([
			columns,
			...playlistHelper.displayPlaylists(this.filteredPlaylists, this.screen.width)
		]);
	}

	focus() {
		this.playlistTable.focus();
	}

	show() {
		this.playlistTable.show();
		this.hidden = false;
	}

	setColors() {
		this.playlistTable.destroy();
		this.playlistTable = createTable(
			this.screen,
			14,
			columns,
			playlistHelper.displayPlaylists(this.filteredPlaylists, this.screen.width)
		);
		this.setKeypresses();
	}

	setKeypresses() {
		setTableKeypress(
			this.playlistTable,
			index => {
				this.search.setValue("");
				this.playlistTable.setData([
					columns,
					...playlistHelper.displayPlaylists(this.playlists, this.screen.width)
				]);

				const playlistId = this.filteredPlaylists[index - 1].id;
				const algorithmsTable = this.playlistDetailsView.algorithmsTable;
				algorithmsTable.setData(playlistId);

				const songsTable = this.playlistDetailsView.songsTable;
				songsTable.setData(playlistId);

				this.playlistDetailsView.playlistToolbar.setPlaylistId(playlistId);

				this.playlistTable.hide();
				this.hidden = true;

				this.playlistDetailsView.show();
				algorithmsTable.show();
				algorithmsTable.focus();
			},
			() => {
				this.search.focus();
			}
		);
	}
}

module.exports = PlaylistTable;
