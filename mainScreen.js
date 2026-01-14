const Menu = require("./components/menu");
const SearchBar = require("./components/searchBar");
const PlaylistTable = require("./tables/playlistTable");
const PlaylistDetailsView = require("./views/playlistDetailsView");

const playlistHelper = require("./backend/playlistHelper.js");

class MainScreen {
	constructor(screen) {
		this.screen = screen;

		this.searchBar = new SearchBar(this.screen);
		this.screen.on("keypress", (char, key) => {
			if (char === "/") {
				this.searchBar.focus();
			}
		});

		this.menu = new Menu(this, this.searchBar);
		this.playlistDetailsView = new PlaylistDetailsView(this, this.searchBar);
		this.backButton = this.playlistDetailsView.playlistToolbar.backButton;
		this.algorithmsTable = this.playlistDetailsView.algorithmsTable;
		this.songsTable = this.playlistDetailsView.songsTable;
		this.playlistTable = new PlaylistTable(
			this.screen,
			playlistHelper.readVisiblePlaylists(),
			this.searchBar,
			this.playlistDetailsView
		);

		this.backButton.on("keypress", (char, key) => {
			const activeTable = this.playlistDetailsView.getActiveTable();
			if (key.name === "enter") {
				this.searchBar.setValue("");
				this.playlistDetailsView.hide();
				this.algorithmsTable.hide();
				this.songsTable.hide();

				this.playlistTable.show();
				this.playlistTable.focus();
			} else if (key.name === "right") {
				const createAlgorithm = this.playlistDetailsView.playlistToolbar.createAlgorithm;
				this.playlistDetailsView.playlistToolbar.prevFocus = createAlgorithm;
				createAlgorithm.focus();
			} else if (key.name === "up") {
				this.searchBar.focus();
			} else if (key.name === "down") {
				activeTable.focus();
			}
		});

		this.searchBar.setKeyPresses(this.playlistDetailsView, this.playlistTable, this.menu);
		this.searchBar.focus();
		this.screen.render();
	}

	setPlaylists(playlists) {
		this.playlistTable.setData(playlists);
		this.playlistDetailsView.hide();
		this.playlistTable.show();
		this.playlistTable.focus();
	}
}

module.exports = MainScreen;
