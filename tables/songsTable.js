const createTable = require("./table.js");
const songHelper = require("../backend/songHelper.js");

const columns = ["NAME", "ARTIST", "ALBUM"];

class SongsTable {
	constructor(parent, songs) {
		this.parent = parent;
		this.songs = songs;
		this.table = createTable(parent, 3, columns, songs, []);
		this.hidden = false;
	}

	setData(songs) {
		this.songs = songs;
		this.table.setData([columns, ...songHelper.displaySongs(songs)]);
	}

	filterData(songs) {
		this.table.setData([columns, ...songHelper.displaySongs(songs)]);
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
};

module.exports = SongsTable;
