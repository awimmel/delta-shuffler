const Menu = require("./components/menu");
const SearchBar = require("./components/searchBar");
const PlaylistTable = require("./tables/playlistTable");
const PlaylistDetailsView = require("./views/playlistDetailsView");

const playlistHelper = require("./backend/playlistHelper.js");
const refreshHelper = require("./backend/refreshHelper.js");
const createWaitingPopover = require("./components/popovers/waitingPopover.js");

class MainScreen {
	constructor(screen) {
		this.screen = screen;
		this.focus = true;
		this.searchBar = new SearchBar(this.screen);

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

		this.setShortcuts();

		this.searchBar.setKeyPresses(this.playlistDetailsView, this.playlistTable, this.menu);
		this.searchBar.focus();

		if (playlistHelper.readPlaylists().length === 0) {
			refreshHelper.refresh(this);
			this.createWaitingPopover();
		}

		this.screen.render();
	}

	setPlaylists(playlists) {
		this.playlistTable.setData(playlists);
		this.playlistDetailsView.hide();
		this.playlistTable.show();
		this.playlistTable.focus();
	}

	setShortcuts() {
		this.screen.on("keypress", (char, key) => {
			if (this.focus) {
				if (char === "/") {
					this.searchBar.focus();
				} else if (char === "<") {
					this.menu.focusBack();
				} else if (char === "+") {
					this.menu.focusPause();
				} else if (char === ">") {
					this.menu.focusSkip();
				} else if (char === "?") {
					if (!this.playlistTable.hidden) {
						this.playlistTable.focus();
					} else {
						this.playlistDetailsView.focus();
					}
				}
			}
		});

		this.screen.key("escape", () => {
			if (this.focus) {
				this.menu.focusClose();
			}
		});
	}

	setFocus(newFocus) {
		this.focus = newFocus;
	}

	createWaitingPopover() {
		createWaitingPopover(this);
	}
}

module.exports = MainScreen;
