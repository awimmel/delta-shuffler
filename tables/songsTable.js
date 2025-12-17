const createTable = require("./table.js");
const songHelper = require("../backend/songHelper.js");

const columns = ["NAME", "ARTIST", "ALBUM"];

class SongsTable {
	constructor(parent) {
		this.parent = parent;
		this.songs = [];
		this.table = createTable(parent, 3, columns, [], []);
		this.hidden = false;
	}

	setData(playlistId) {
		this.songs = songHelper.readSongs(playlistId);
		this.table.setData([columns, ...songHelper.displaySongs(this.songs)]);
	}

	filterData(query) {
		const filteredSongs = this.songs.filter(
			song =>
				song.name.toLowerCase().includes(query) ||
				songHelper.getArtistString(song).toLowerCase().includes(query) ||
				song.album.name.toLowerCase().includes(query)
		);
		this.table.setData([columns, ...songHelper.displaySongs(filteredSongs)]);
	}

	hide() {
		this.table.hide();
		this.hidden = true;
	}

	focus() {
		this.table.focus();
	}

	show() {
		this.table.show();
		this.hidden = false;
	}
}

module.exports = SongsTable;
