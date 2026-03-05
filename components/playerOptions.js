const blessed = require("blessed");
const toolbarKeypress = require("../utilities/toolbarKeypress.js");
const setFocusStyle = require("../utilities/setFocusStyle.js");
const playerHelper = require("../backend/playerHelper.js");
const settingsHelper = require("../backend/settingsHelper.js");

const pause = "||";
const play = "▷";

class PlayerOptions {
	constructor(menu, toolbar, searchBar) {
		this.menu = menu;
		this.toolbar = toolbar;
		this.searchBar = searchBar;

		// Playback tools
		this.backSong = blessed.box({
			parent: this.toolbar,
			content: "<<",
			left: "50%-6",
			height: 3,
			width: 4,
			border: "line"
		});

		this.pauseSong = blessed.box({
			parent: this.toolbar,
			content: play,
			left: "50%-2",
			height: 3,
			width: 4,
			border: "line"
		});

		this.skipSong = blessed.box({
			parent: this.toolbar,
			content: ">>",
			left: "50%+2",
			height: 3,
			width: 4,
			border: "line"
		});

		this.queueSong = blessed.box({
			parent: this.toolbar,
			content: "+≡",
			left: "50%+6",
			height: 3,
			width: 4,
			border: "line"
		});

		this.reshuffle = blessed.box({
			parent: this.toolbar,
			content: "Reshuffle",
			left: "50%+10",
			height: 3,
			width: 11,
			border: "line"
		});

		this.openSong = blessed.box({
			parent: this.toolbar,
			content: "Open Song",
			left: "50%+21",
			height: 3,
			width: 11,
			border: "line"
		});

		toolbarKeypress(
			this.backSong,
			() => {},
			() => {
				this.pauseSong.focus();
			},
			() => {
				if (settingsHelper.getShowAlbumArt()) {
					this.menu.focusOptions();
				}
			},
			() => {
				this.searchBar.focus();
			},
			async () => {
				await this.back();
			}
		);
		toolbarKeypress(
			this.pauseSong,
			() => {
				this.backSong.focus();
			},
			() => {
				this.skipSong.focus();
			},
			() => {
				if (settingsHelper.getShowAlbumArt()) {
					this.menu.focusOptions();
				}
			},
			() => {
				this.searchBar.focus();
			},
			async () => {
				await this.togglePlayback();
			}
		);
		toolbarKeypress(
			this.skipSong,
			() => {
				this.pauseSong.focus();
			},
			() => {
				this.queueSong.focus();
			},
			() => {
				if (settingsHelper.getShowAlbumArt()) {
					this.menu.focusOptions();
				}
			},
			() => {
				this.searchBar.focus();
			},
			async () => {
				await this.skip();
			}
		);
		toolbarKeypress(
			this.queueSong,
			() => {
				this.skipSong.focus();
			},
			() => {
				this.reshuffle.focus();
			},
			() => {
				if (settingsHelper.getShowAlbumArt()) {
					this.menu.focusOptions();
				}
			},
			() => {
				this.searchBar.focus();
			},
			() => {
				playerHelper.queueSongs([this.menu.getCurrPlayingId()]);
			}
		);
		toolbarKeypress(
			this.reshuffle,
			() => {
				this.queueSong.focus();
			},
			() => {
				this.openSong.focus();
			},
			() => {
				if (settingsHelper.getShowAlbumArt()) {
					this.menu.focusOptions();
				}
			},
			() => {
				this.searchBar.focus();
			},
			() => {
				playerHelper.reshuffleSongs();
			}
		);
		toolbarKeypress(
			this.openSong,
			() => {
				this.reshuffle.focus();
			},
			() => {
				if (!settingsHelper.getShowAlbumArt()) {
					this.menu.focusOptions();
				}
			},
			() => {
				if (settingsHelper.getShowAlbumArt()) {
					this.menu.focusOptions();
				}
			},
			() => {
				this.searchBar.focus();
			},
			async () => {
				const songId = this.menu.getCurrPlayingId();
				if (songId) {
					//eventually fix import here to follow better practice
					const open = (await import("open")).default;
					await open(`https://open.spotify.com/track/${songId}`);
				}
			}
		);

		this.resizeAndSetColors();

		this.menu.screen.render();
	}

	focus() {
		this.pauseSong.focus();
	}

	focusRight() {
		this.openSong.focus();
	}

	async back() {
		this.pauseSong.setContent(pause);
		await playerHelper.prevSong();

		// Give Spotify a tenth of a second to account for the request
		setTimeout(() => this.menu.updateCurrPlaying(), 100);
	}

	async togglePlayback() {
		let modifPlayback = false;
		if (this.pauseSong.getContent() === pause) {
			modifPlayback = await playerHelper.pauseSong();
			this.menu.songProgressBar.pause();
		} else {
			modifPlayback = await playerHelper.playSong();
			this.menu.songProgressBar.setAutoUpdate();
		}

		if (modifPlayback) {
			this.pauseSong.setContent(this.pauseSong.getContent() === pause ? play : pause);
			this.menu.screen.render();
		}
	}

	async skip() {
		this.pauseSong.setContent(pause);
		await playerHelper.skipSong();

		// Give Spotify a tenth of a second to account for the request
		setTimeout(() => this.menu.updateCurrPlaying(), 100);
	}

	queue() {
		playerHelper.queueSongs([this.menu.getCurrPlayingId()]);
	}

	reshuffleSongs() {
		playerHelper.reshuffleSongs();
	}

	resizeAndSetColors() {
		this.adjAlbumArt();
		this.setColors();
		this.menu.screen.render();
	}

	adjAlbumArt() {
		const topValue = settingsHelper.getShowAlbumArt() ? "100%-5" : 0;
		this.backSong.top = topValue;
		this.pauseSong.top = topValue;
		this.skipSong.top = topValue;
		this.queueSong.top = topValue;
		this.reshuffle.top = topValue;
		this.openSong.top = topValue;
	}

	setColors() {
		const playerButtonStyle = {
			fg: settingsHelper.getText(),
			border: {
				fg: settingsHelper.getPrimary()
			},
			bold: true
		};
		this.backSong.style = JSON.parse(JSON.stringify(playerButtonStyle));
		setFocusStyle(this.backSong, true, settingsHelper.getPrimary());

		this.pauseSong.style = JSON.parse(JSON.stringify(playerButtonStyle));
		setFocusStyle(this.pauseSong, true, settingsHelper.getPrimary());

		this.skipSong.style = JSON.parse(JSON.stringify(playerButtonStyle));
		setFocusStyle(this.skipSong, true, settingsHelper.getPrimary());

		this.queueSong.style = JSON.parse(JSON.stringify(playerButtonStyle));
		setFocusStyle(this.queueSong, true, settingsHelper.getPrimary());

		this.reshuffle.style = JSON.parse(JSON.stringify(playerButtonStyle));
		setFocusStyle(this.reshuffle, true, settingsHelper.getPrimary());

		this.openSong.style = JSON.parse(JSON.stringify(playerButtonStyle));
		setFocusStyle(this.openSong, true, settingsHelper.getPrimary());
	}
}

module.exports = PlayerOptions;
