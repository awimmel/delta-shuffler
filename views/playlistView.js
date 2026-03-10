const blessed = require("blessed");

const PlaylistTable = require("../tables/playlistTable.js");
const PrimaryToolbar = require("../components/primaryToolbar.js");

const playlistHelper = require("../backend/playlistHelper.js");
const settingsHelper = require("../backend/settingsHelper.js");

class PlaylistView {
	constructor(mainScreen, searchBar, playlistDetailsView) {
		this.playlistView = blessed.box({
			parent: mainScreen.screen,
			left: 0,
			width: "100%",
			keys: true
		});

		this.playlistTable = new PlaylistTable(
			this,
			playlistHelper.readVisiblePlaylists(),
			searchBar,
			playlistDetailsView
		);

		this.primaryToolbar = new PrimaryToolbar(
			mainScreen,
			this.playlistView,
			searchBar,
			this.playlistTable
		);

		this.hidden = false;
		this.resizeAndSetColors();
	}

	show() {
		this.playlistView.show();
		this.hidden = false;
	}

	hide() {
		this.playlistView.hide();
		this.hidden = true;
	}

	focus(keyName) {
		if (keyName === "down") {
			this.primaryToolbar.focus();
		} else if (this.getDataCount() > 0) {
			this.playlistTable.focus();
		} else {
			this.primaryToolbar.focus();
		}
	}

	filterData(query) {
		this.playlistTable.filterData(query);
	}

	getDataCount() {
		return this.playlistTable.getDataCount();
	}

	resizeAndSetColors() {
		this.adjHeight();
		this.setColors();
	}

	adjHeight() {
		const showAlbumArt = settingsHelper.getShowAlbumArt();
		this.playlistView.top = showAlbumArt ? 15 : 13;

		const showFooter = settingsHelper.getShowFooter();
		if (showAlbumArt && showFooter) {
			this.playlistView.height = "100%-15";
		} else if (showAlbumArt) {
			this.playlistView.height = "100%-14";
		} else if (showFooter) {
			this.playlistView.height = "100%-13";
		} else {
			this.playlistView.height = "100%-12";
		}
	}

	setColors() {
		this.primaryToolbar.setColors();
		this.playlistTable.resizeAndSetColors();
	}

	setPlaylists(playlists) {
		this.playlistTable.setData(playlists);
	}
}

module.exports = PlaylistView;
