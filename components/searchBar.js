const blessed = require("blessed");
const variables = require("../database/variables.json");
const primaryColor = variables.primaryColor;
const focusText = require("../utilities/focusText");

class SearchBar {
	constructor(screen) {
		this.screen = screen;
		this.searchBar = blessed.textbox({
			parent: screen,
			top: 5,
			left: 0,
			height: 3,
			width: "100%",
			content: "",
			border: "line",
			keys: true,
			style: {
				fg: "white",
				focus: {
					border: {
						fg: "white"
					}
				},
				border: {
					fg: primaryColor
				}
			}
		});
	}

	focus() {
		focusText(this.searchBar);
	}

	setKeyPresses(playlistDetailsView, playlistTable, menu) {
		this.searchBar.on("keypress", (char, key) => {
			if (key.name === "enter") {
				if (!playlistDetailsView.hidden) {
					playlistDetailsView.focus();
				} else if (!playlistTable.hidden) {
					playlistTable.focus();
				}
				this.screen.render();
			} else if (key.name === "down") {
				if (!playlistDetailsView.hidden) {
					playlistDetailsView.playlistToolbar.backButton.focus();
				} else if (!playlistTable.hidden) {
					playlistTable.focus();
				}
			} else if (key.name === "up") {
				menu.children[2].focus();
			} else if (key.name !== "escape") {
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
