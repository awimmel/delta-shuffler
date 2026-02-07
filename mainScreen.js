const blessed = require("blessed");
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
		this.footer = createFooter(this.screen);

		this.setShortcuts();

		this.setBackKeypress();
		this.searchBar.setKeyPresses(this.playlistDetailsView, this.playlistTable, this.menu);

		if (playlistHelper.readPlaylists().length === 0) {
			refreshHelper.refresh(this);
			this.createWaitingPopover();
		}

		this.setColors();
		this.playlistTable.focus();
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
					this.menu.back();
				} else if (char === ",") {
					this.menu.togglePlayback();
				} else if (char === ">") {
					this.menu.skip();
				} else if (char === ".") {
					this.menu.queue();
				} else if (char === "?") {
					if (!this.playlistTable.hidden && this.playlistTable.getDataCount() > 0) {
						this.playlistTable.focus();
					} else if (this.playlistDetailsView.getActiveTable().getDataCount() > 0) {
						this.playlistDetailsView.focus();
					}
				} else if (char === "s") {
					if (this.playlistTable.hidden) {
						this.playlistDetailsView.showSongsTable();
					}
				} else if (char === "a") {
					if (this.playlistTable.hidden) {
						this.playlistDetailsView.showAlgorithmsTable();
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

	setColors() {
		this.menu.setColors();
		this.searchBar.setColors();
		this.playlistTable.setColors();
		this.playlistDetailsView.setColors();
		this.searchBar.setKeyPresses(this.playlistDetailsView, this.playlistTable, this.menu);
		this.setBackKeypress();
		this.screen.render();
	}

	setBackKeypress() {
		this.backButton.removeAllListeners("keypress");
		this.backButton.on("keypress", (char, key) => {
			const activeTable = this.playlistDetailsView.getActiveTable();
			if (key.name === "enter") {
				this.playlistDetailsView.hide();
				this.algorithmsTable.hide();
				this.songsTable.hide();

				this.searchBar.setValue("");
				this.playlistTable.filterData("");
				this.playlistTable.show();
				this.playlistTable.focus();
			} else if (key.name === "right") {
				const createAlgorithm = this.playlistDetailsView.playlistToolbar.createAlgorithm;
				this.playlistDetailsView.playlistToolbar.prevFocus = createAlgorithm;
				createAlgorithm.focus();
			} else if (key.name === "up") {
				this.searchBar.focus();
			} else if (key.name === "down" && activeTable.getDataCount() > 0) {
				activeTable.focus();
			}
		});
	}
}

function createFooter(screen) {
	return blessed.box({
		parent: screen,
		bottom: 0,
		left: "center",
		width: "100%",
		height: 1,
		tags: true,
		align: "center",
		style: {
			bold: true
		},
		content:
			"♫ Powered by Spotify | {cyan-fg}/{/cyan-fg} search | {green-fg}?{/green-fg} table | {blue-fg}s{/blue-fg} songs table | " +
			"{magenta-fg}a{/magenta-fg} algorithms table | {yellow-fg}<{/yellow-fg} rewind | " +
			"{yellow-fg},{/yellow-fg} pause/play | {yellow-fg}>{/yellow-fg} skip | " +
			"{yellow-fg}.{/yellow-fg} queue | {red-fg}esc{/red-fg} back/close"
	});
}

module.exports = MainScreen;
