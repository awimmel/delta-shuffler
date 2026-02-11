const blessed = require("blessed");
const settingsHelper = require("../backend/settingsHelper.js");
const focusText = require("../utilities/focusText");

class SearchBar {
	constructor(screen) {
		this.screen = screen;
		this.searchBar = blessed.textbox({
			parent: screen,
			label: " Search: ",
			left: 0,
			height: 3,
			width: "100%",
			content: "",
			border: "line",
			keys: true
		});

		this.resizeAndSetColors();
	}

	focus() {
		focusText(this.searchBar);
	}

	setKeyPresses(playlistDetailsView, playlistTable, menu) {
		this.searchBar.on("keypress", (char, key) => {
			if (key.name === "enter" || key.name === "down") {
				if (!playlistDetailsView.hidden) {
					playlistDetailsView.focus(key.name);
				} else if (!playlistTable.hidden && playlistTable.getDataCount() !== 0) {
					playlistTable.focus();
				}
				this.screen.render();
			} else if (key.name === "up") {
				menu.focus();
			} else if (key.name !== "escape" && this.searchBar._reading) {
				updateList(this.searchBar, char, playlistDetailsView, playlistTable, this.screen);
			}
		});
	}

	getValue() {
		return this.searchBar.getValue();
	}

	setValue(newVal) {
		this.searchBar.setValue(newVal);
	}

	resizeAndSetColors() {
		this.searchBar.top = settingsHelper.getShowAlbumArt() ? 12 : 9;

		this.searchBar.style = {
			fg: settingsHelper.getText(),
			focus: {
				border: {
					fg: settingsHelper.getFocus()
				}
			},
			border: {
				fg: settingsHelper.getPrimary()
			}
		};

		this.searchBar.on("focus", function () {
			this.style.border.fg = settingsHelper.getFocus();
			this.screen.render();
		});

		this.searchBar.on("blur", function () {
			this.style.border.fg = settingsHelper.getPrimary();
			this.screen.render();
		});
	}
}

function updateList(searchBar, newChar, playlistDetailsView, playlistTable, screen) {
	const query = getQuery(searchBar, newChar);
	if (!playlistDetailsView.hidden) {
		playlistDetailsView.filterData(query);
	} else {
		playlistTable.filterData(query);
	}
	screen.render();
}

function getQuery(searchBar, currChar) {
	const currQuery = searchBar.getValue().toLowerCase();
	if (currChar != null && currChar !== "\b") {
		return currQuery + currChar.toLowerCase();
	} else {
		return currQuery.slice(0, -1);
	}
}

module.exports = SearchBar;
