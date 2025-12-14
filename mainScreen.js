const focusText = require("./utilities/focusText.js");

const createMenu = require("./components/menu");
const createSearchbar = require("./components/searchBar");
const PlaylistTable = require("./tables/playlistTable");
const createPlaylistDetailsView = require("./views/playlistDetailsView");

const playlistHelper = require("./backend/playlistHelper.js");
const songHelper = require("./backend/songHelper.js");

class MainScreen {
	constructor(screen) {
		this.screen = screen;

		this.screen.on("keypress", (char, key) => {
			if (char === "/") {
				focusText(searchBar);
			}
		});

		this.searchBar = createSearchbar(this.screen);
		this.menu = createMenu(this, this.searchBar);
		this.playlists = playlistHelper.readPlaylists();
		this.filteredPlaylists = this.playlists;
		this.playlistDetailsView = createPlaylistDetailsView(this.screen, this.searchBar);
		this.backButton = this.playlistDetailsView.children[2].children[0];
		this.algorithmsTable = this.playlistDetailsView.children[0];
		this.songsTable = this.playlistDetailsView.children[1];
		this.playlistTable = new PlaylistTable(
			this.screen,
			this.filteredPlaylists,
			this.searchBar,
			this.playlistDetailsView
		);

		this.backButton.on("keypress", (char, key) => {
			const activeTable = this.playlistDetailsView.children[0].hidden
				? this.playlistDetailsView.children[1]
				: this.playlistDetailsView.children[0];
			if (key.name === "enter") {
				this.playlistDetailsView.hide();
				this.algorithmsTable.hide();
				this.songsTable.hide();

				this.playlistTable.show();
				this.playlistTable.focus();
			} else if (key.name === "right") {
				this.playlistDetailsView.children[2].children[1].focus();
			} else if (key.name === "up") {
				focusText(this.searchBar);
			} else if (key.name === "down") {
				activeTable.focus();
			}
		});

		this.playlistDetailsView.hide();
		this.updateList();
		focusText(this.searchBar);
		this.screen.render();

		this.searchBar.on("keypress", (char, key) => {
			if (key.name === "enter") {
				if (!this.playlistDetailsView.hidden) {
					this.playlistDetailsView.focus();
				} else if (!playlistTable.hidden) {
					this.playlistTable.focus();
				}
				this.screen.render();
			} else if (key.name === "down") {
				if (!this.playlistDetailsView.hidden) {
					this.playlistDetailsView.children[2].children[0].focus();
				} else if (!this.playlistTable.hidden) {
					this.playlistTable.focus();
				}
			} else if (key.name === "up") {
				this.menu.children[2].focus();
			} else if (key.name !== "escape") {
				this.updateList(char);
			}
		});
	}

	updateList(newChar) {
		const query = this.getQuery(newChar);
		if (!this.algorithmsTable.hidden) {
			const filteredAlgorithms = this.algorithmsTable._rawData.filter(item =>
				item[0].toLowerCase().includes(query)
			);
			this.algorithmsTable.setData([["NAME"], ...filteredAlgorithms]);
		} else if (!this.songsTable.hidden) {
			const filteredSongs = this.songsTable.rawData.filter(
				song =>
					song.name.toLowerCase().includes(query) ||
					songHelper.getArtistString(song).toLowerCase().includes(query) ||
					song.album.name.toLowerCase().includes(query)
			);
			this.songsTable.setData([
				["SONG", "ARTIST", "ALBUM"],
				...songHelper.displaySongs(filteredSongs)
			]);
		} else {
			this.filteredPlaylists = this.playlists.filter(item =>
				item.name.toLowerCase().includes(query)
			);
			this.playlistTable.setData(this.filteredPlaylists);
		}
		this.screen.render();
	}

	getQuery(currChar) {
		const currQuery = this.searchBar.getValue().toLowerCase().trim();
		if (currChar != null && currChar !== "\b") {
			return currQuery + currChar.toLowerCase();
		} else {
			return currQuery.slice(0, -1);
		}
	}

	setPlaylists(playlists) {
		this.playlists = playlists;
		this.filteredPlaylists = playlists;
		this.playlistTable.setData(playlists);
		this.playlistDetailsView.hide();
		this.playlistTable.show();
	}
}

module.exports = MainScreen;
