const createTable = require("./table.js");
const songHelper = require("../backend/songHelper.js");

const columns = ["NAME", "ARTIST", "ALBUM"];

class SongsTable {
	constructor(parent) {
		this.parent = parent;
		this.width = this.parent.width;
		this.songs = [];
		this.filteredSongs = this.songs;
		this.songCount = 0;
		this.table = createTable(this.parent, 3, columns, []);
		this.hidden = false;
	}

	setData(playlistId) {
		this.songs = songHelper.readSongs(playlistId);
		this.filteredSongs = this.songs;
		this.songCount = this.songs.length;
		this.table.setData([columns, ...songHelper.displaySongs(this.songs, this.width)]);
	}

	getDataCount() {
		return this.songCount;
	}

	filterData(query) {
		this.filteredSongs = this.songs.filter(song => {
			const genres = [
				...new Set(song.artists.flatMap(artist => artist.genres.map(genre => genre.toLowerCase())))
			];

			return (
				song.name.toLowerCase().includes(query) ||
				songHelper.getArtistString(song).toLowerCase().includes(query) ||
				song.album.name.toLowerCase().includes(query) ||
				genres.some(genre => genre.includes(query))
			);
		});
		this.songCount = this.filteredSongs.length;
		this.table.setData([columns, ...songHelper.displaySongs(this.filteredSongs, this.width)]);
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

	setColors() {
		this.table.destroy();
		this.table = createTable(
			this.parent,
			3,
			columns,
			songHelper.displaySongs(this.filteredSongs, this.width)
		);
	}
}

module.exports = SongsTable;
