const blessed = require("blessed");
const toolbarKeypress = require("../utilities/toolbarKeypress.js");
const createQueueTopPopover = require("../components/popovers/queueTopPopover.js");
const settingsHelper = require("../backend/settingsHelper.js");

class PrimaryToolbar {
	constructor(mainScreen, parent, searchBar, playlistTable) {
		this.mainScreen = mainScreen;
		this.searchBar = searchBar;
		this.playlistTable = playlistTable;

		this.toolbar = blessed.box({
			parent: parent,
			top: 0,
			left: 0,
			height: 3,
			width: "100%",
			content: "",
			keys: true
		});

		this.queueTop = blessed.box({
			parent: this.toolbar,
			top: 0,
			right: 0,
			height: 3,
			width: 17,
			content: "Queue Top Items",
			border: "line",
			keys: true
		});

		toolbarKeypress(
			this.queueTop,
			() => {},
			() => {},
			() => {
				this.searchBar.focus();
			},
			() => {
				this.focusTable();
			},
			() => {
				createQueueTopPopover(this.mainScreen, this.queueTop);
			}
		);

		this.setColors();
	}

	focusTable() {
		if (this.playlistTable.getDataCount() > 0) {
			this.playlistTable.focus();
		}
	}

	focus() {
		this.queueTop.focus();
	}

	setColors() {
		this.queueTop.style = JSON.parse(
			JSON.stringify({
				fg: settingsHelper.getText(),
				border: {
					fg: settingsHelper.getPrimary()
				}
			})
		);
		this.queueTop.on("focus", function () {
			this.style.fg = settingsHelper.getSecondary();
			this.style.bg = settingsHelper.getPrimary();
			this.style.border.fg = settingsHelper.getFocus();
			this.screen.render();
		});

		this.queueTop.on("blur", function () {
			this.style.fg = settingsHelper.getText();
			this.style.bg = "none";
			this.style.border.fg = settingsHelper.getPrimary();
			this.screen.render();
		});

		this.mainScreen.screen.render();
	}
}

module.exports = PrimaryToolbar;
