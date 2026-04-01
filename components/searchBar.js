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

	setViews(playlistView, playlistDetailsView, menu) {
		this.playlistView = playlistView;
		this.playlistDetailsView = playlistDetailsView;
		this.menu = menu;
	}

	focus() {
		this.searchBar.removeAllListeners("keypress");
		this.setKeyPresses();
		focusText(this.searchBar);
	}

	setKeyPresses() {
		this.searchBar.on("keypress", (char, key) => {
			if (key.name === "enter" || key.name === "down") {
				const elToFocus = !this.playlistDetailsView.hidden ? this.playlistDetailsView : this.playlistView;
				elToFocus.focus(key.name);
				this.screen.render();
			} else if (key.name === "up") {
				this.menu.focus();
			} else if (key.name !== "escape" && this.searchBar._reading) {
				updateList(this.searchBar, char, this.playlistView, this.playlistDetailsView, this.screen);
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
		this.searchBar.top = settingsHelper.getShowAlbumArt() ? 12 : 10;

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

function updateList(searchBar, newChar, playlistView, playlistDetailsView, screen) {
	const query = getQuery(searchBar, newChar);
	if (!playlistDetailsView.hidden) {
		playlistDetailsView.filterData(query);
	} else {
		playlistView.filterData(query);
	}
}

function getQuery(searchBar, currChar) {
	const currQuery = searchBar.getValue().toLowerCase();
	if (currChar != null && currChar !== "\b" && currChar !== "\x7f") {
		return currQuery + currChar.toLowerCase();
	} else {
		return currQuery.slice(0, -1);
	}
}

module.exports = SearchBar;
