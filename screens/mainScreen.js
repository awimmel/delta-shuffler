const blessed = require("blessed");
const Menu = require("../components/menu.js");
const SearchBar = require("../components/searchBar.js");
const PlaylistDetailsView = require("../views/playlistDetailsView.js");
const PlaylistView = require("../views/playlistView.js");

const playlistHelper = require("../backend/playlistHelper.js");
const settingsHelper = require("../backend/settingsHelper.js");
const createRefreshPopover = require("../components/popovers/refreshPopover.js");
const createWaitingPopover = require("../components/popovers/waitingPopover.js");

class MainScreen {
	constructor(screen) {
		this.screen = screen;
		this.focus = true;
		this.searchBar = new SearchBar(this.screen);

		this.menu = new Menu(this, this.searchBar);
		this.playlistDetailsView = new PlaylistDetailsView(this, this.searchBar);
		this.playlistView = new PlaylistView(this, this.searchBar, this.playlistDetailsView);
		this.backButton = this.playlistDetailsView.playlistToolbar.backButton;
		this.algorithmsTable = this.playlistDetailsView.algorithmsTable;
		this.songsTable = this.playlistDetailsView.songsTable;
		this.footer = createFooter(this.screen);

		this.setShortcuts();

		this.setBackKeypress();
		this.searchBar.setKeyPresses(this.playlistView, this.playlistDetailsView, this.menu);

		this.resizeAndSetColors();
		this.playlistView.focus();

		if (playlistHelper.readPlaylists().length === 0) {
			createRefreshPopover(this, this.searchBar, false);
		}

		this.screen.render();
	}

	setPlaylists(playlists) {
		this.playlistView.setPlaylists(playlists);
		this.playlistDetailsView.hide();
		this.playlistView.show();
		this.playlistView.focus();
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
				} else if (char === "'") {
					this.menu.reshuffleSongs();
				} else if (char === "?") {
					if (!this.playlistView.hidden && this.playlistView.getDataCount() > 0) {
						this.playlistView.focus();
					} else if (this.playlistDetailsView.getActiveTable().getDataCount() > 0) {
						this.playlistDetailsView.focus();
					}
				} else if (char === "s") {
					if (this.playlistView.hidden) {
						this.searchBar.setValue("");
						this.playlistDetailsView.showSongsTable();
					}
				} else if (char === "a") {
					if (this.playlistView.hidden) {
						this.searchBar.setValue("");
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

	resizeAndSetColors() {
		this.menu.resizeAndSetColors();
		this.searchBar.resizeAndSetColors();
		this.playlistView.resizeAndSetColors();
		this.playlistDetailsView.resizeAndSetColors();
		this.searchBar.setKeyPresses(this.playlistView, this.playlistDetailsView, this.menu);
		this.setBackKeypress();

		if (settingsHelper.getShowFooter()) {
			this.footer.show();
		} else {
			this.footer.hide();
		}

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
				this.playlistView.filterData("");
				this.playlistView.show();
				this.playlistView.focus();
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
			"{magenta-fg}a{/magenta-fg} alg. table | {yellow-fg}<{/yellow-fg} rewind | " +
			"{yellow-fg},{/yellow-fg} pause/play | {yellow-fg}>{/yellow-fg} skip | " +
			"{yellow-fg}.{/yellow-fg} queue | {yellow-fg}'{/yellow-fg} reshuffle | " +
			"{red-fg}esc{/red-fg} back/close",
		hidden: settingsHelper.getShowFooter()
	});
}

module.exports = MainScreen;
