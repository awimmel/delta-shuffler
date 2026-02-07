const blessed = require("blessed");
const toolbarKeypress = require("../utilities/toolbarKeypress.js");
const NameAlgorithmPopover = require("../components/popovers/nameAlgorithmPopover.js");
const playlistHelper = require("../backend/playlistHelper.js");
const themeHelper = require("../backend/themeHelper.js");

class PlaylistToolbar {
	constructor(mainScreen, parent, searchBar, algorithmsTable, songsTable) {
		this.mainScreen = mainScreen;
		this.searchBar = searchBar;
		this.algorithmsTable = algorithmsTable;
		this.songsTable = songsTable;

		this.toolbar = blessed.box({
			parent: parent,
			top: 0,
			left: 0,
			height: 3,
			width: "100%",
			content: "",
			keys: true
		});

		this.playlistName = blessed.text({
			parent: parent,
			content: "",
			top: 1,
			left: 1,
			width: "50%",
			height: 1
		});

		this.backButton = blessed.box({
			parent: this.toolbar,
			top: 0,
			right: 48,
			height: 3,
			width: 6,
			content: "Back",
			border: "line",
			keys: true
		});

		this.createAlgorithm = blessed.box({
			parent: this.toolbar,
			top: 0,
			right: 29,
			height: 3,
			width: 19,
			content: "Create Algorithm",
			border: "line",
			keys: true
		});

		this.showAlgorithms = blessed.box({
			parent: this.toolbar,
			top: 0,
			right: 12,
			height: 3,
			width: 17,
			content: "Show Algorithms",
			border: "line",
			keys: true
		});

		this.showSongs = blessed.box({
			parent: this.toolbar,
			top: 0,
			right: 0,
			height: 3,
			width: 12,
			content: "Show Songs",
			border: "line",
			keys: true
		});

		this.prevFocus = this.backButton;

		toolbarKeypress(
			this.createAlgorithm,
			() => {
				this.prevFocus = this.backButton;
				this.backButton.focus();
			},
			() => {
				this.prevFocus = this.showAlgorithms;
				this.showAlgorithms.focus();
			},
			() => {
				this.searchBar.focus();
			},
			() => {
				this.focusTable();
			},
			() => {
				new NameAlgorithmPopover(
					this.mainScreen,
					this.createAlgorithm,
					this.searchBar,
					this.algorithmsTable
				);
			}
		);
		toolbarKeypress(
			this.showAlgorithms,
			() => {
				this.prevFocus = this.createAlgorithm;
				this.createAlgorithm.focus();
			},
			() => {
				this.prevFocus = this.showSongs;
				this.showSongs.focus();
			},
			() => {
				this.searchBar.focus();
			},
			() => {
				this.focusTable();
			},
			() => {
				this.searchBar.setValue("");

				this.songsTable.hide();
				this.algorithmsTable.show();
				this.algorithmsTable.focus();
			}
		);
		toolbarKeypress(
			this.showSongs,
			() => {
				this.prevFocus = this.showAlgorithms;
				this.showAlgorithms.focus();
			},
			() => {},
			() => {
				this.searchBar.focus();
			},
			() => {
				this.focusTable();
			},
			() => {
				this.searchBar.setValue("");

				this.algorithmsTable.hide();
				this.songsTable.show();
				this.songsTable.focus();
			}
		);
	}

	focusTable() {
		if (!this.algorithmsTable.hidden) {
			this.algorithmsTable.focus();
		} else {
			this.songsTable.focus();
		}
	}

	focus() {
		this.prevFocus.focus();
	}

	setPlaylistId(playlistId) {
		const playlistName = playlistHelper.getPlaylistName(playlistId);
		this.playlistName.setContent(playlistName);
	}

	setColors() {
		this.playlistName.style = {
			fg: themeHelper.getText(),
			bold: true
		};

		const buttonStyle = {
			fg: themeHelper.getText(),
			border: {
				fg: themeHelper.getPrimary()
			}
		};
		this.backButton.style = JSON.parse(JSON.stringify(buttonStyle));
		setFocus(this.backButton);

		this.createAlgorithm.style = JSON.parse(JSON.stringify(buttonStyle));
		setFocus(this.createAlgorithm);

		this.showAlgorithms.style = JSON.parse(JSON.stringify(buttonStyle));
		setFocus(this.showAlgorithms);

		this.showSongs.style = JSON.parse(JSON.stringify(buttonStyle));
		setFocus(this.showSongs);

		this.mainScreen.screen.render();
	}
}

function setFocus(el) {
	el.on("focus", function () {
		this.style.fg = themeHelper.getSecondary();
		this.style.bg = themeHelper.getPrimary();
		this.style.border.fg = themeHelper.getFocus();
		this.screen.render();
	});

	el.on("blur", function () {
		this.style.fg = themeHelper.getText();
		this.style.bg = "none";
		this.style.border.fg = themeHelper.getPrimary();
		this.screen.render();
	});
}

module.exports = PlaylistToolbar;
