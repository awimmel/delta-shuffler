const createTable = require("./table.js");

const playlistHelper = require("../backend/playlistHelper.js");
const setTableKeypress = require("../utilities/setTableKeypress.js");

const columns = ["PLAYLIST", "SONG COUNT"];

class PlaylistTable {
	constructor(view, playlists, search, playlistDetailsView) {
		this.view = view;
		this.parent = this.view.playlistView;
		this.playlists = playlistHelper.sortPlaylists(playlists);
		this.filteredPlaylists = this.playlists;
		this.playlistCount = this.playlists.length;
		this.playlistTable = createPlaylistTable(this.parent, this.playlists, this.parent.width);
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
			...playlistHelper.displayPlaylists(this.playlists, this.parent.width)
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
			...playlistHelper.displayPlaylists(this.filteredPlaylists, this.parent.width)
		]);
	}

	focus() {
		this.playlistTable.focus();
	}

	show() {
		this.playlistTable.show();
		this.hidden = false;
	}

	resizeAndSetColors() {
		this.playlistTable.destroy();
		this.playlistTable = createPlaylistTable(this.parent, this.playlists, this.parent.width);
		this.setKeypresses();
	}

	setKeypresses() {
		setTableKeypress(
			this.playlistTable,
			index => {
				this.search.setValue("");
				this.playlistTable.setData([
					columns,
					...playlistHelper.displayPlaylists(this.playlists, this.parent.width)
				]);
				const playlistId = this.filteredPlaylists[index - 1].id;
				const algorithmsTable = this.playlistDetailsView.algorithmsTable;
				algorithmsTable.setData(playlistId);
				const songsTable = this.playlistDetailsView.songsTable;
				songsTable.setData(playlistId);
				this.playlistDetailsView.playlistToolbar.setPlaylistId(playlistId);
				this.view.hide();
				this.playlistDetailsView.show();
				algorithmsTable.show();
				algorithmsTable.focus();
			},
			() => {
				this.view.primaryToolbar.focus();
			}
		);
	}
}

function createPlaylistTable(parent, playlists, width) {
	return createTable(parent, 3, columns, playlistHelper.displayPlaylists(playlists, width));
}

module.exports = PlaylistTable;
