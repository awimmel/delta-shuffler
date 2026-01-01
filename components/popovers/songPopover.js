const blessed = require("blessed");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const songHelper = require("../../backend/songHelper.js");
const playerHelper = require("../../backend/playerHelper.js");

module.exports = function createSongPopover(screen, songsTable, song) {
	const songBox = blessed.box({
		parent: screen,
		border: "line",
		height: 10,
		width: 60,
		top: "center",
		left: "center",
		label: ` {bold}${song.name}{/bold} `,
		tags: true,
		hidden: false
	});

	// Info about the current song
	blessed.text({
		parent: songBox,
		content: `Artist: ${songHelper.getArtistString(song)}\n\nAlbum: ${song.album.name}`,
		top: 1,
		left: 2,
		width: "100%-4",
		height: 3
	});

	const closeBox = blessed.box({
		parent: songBox,
		content: "Close",
		top: 7,
		left: 15,
		height: 3,
		width: 7,
		tags: true,
		align: "center",
		valign: "middle",
		border: "line",
		keys: true,
		style: {
			fg: "white",
			bg: "default",
			border: {
				fg: "red"
			},
			focus: {
				bg: "red",
				border: {
					fg: "white"
				}
			}
		}
	});

	const queueBox = blessed.box({
		parent: songBox,
		content: "Queue",
		top: 7,
		left: 35,
		height: 3,
		width: 7,
		tags: true,
		align: "center",
		valign: "middle",
		border: "line",
		keys: true,
		style: {
			fg: "white",
			bg: "default",
			border: {
				fg: "blue"
			},
			focus: {
				bg: "blue",
				border: {
					fg: "white"
				}
			}
		}
	});

	toolbarKeypress(
		closeBox,
		() => {},
		focusFunction(queueBox),
		() => {},
		() => {},
		() => {
			songBox.destroy();
			songsTable.focus();
			screen.render();
		}
	);
	toolbarKeypress(
		queueBox,
		focusFunction(closeBox),
		() => {},
		() => {},
		() => {},
		async () => {
			await playerHelper.queueSongs([song.id]);

			songBox.destroy();
			songsTable.focus();
			screen.render();
		}
	);

	closeBox.focus();
	screen.render();

	return songBox;
};
