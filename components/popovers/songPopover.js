const blessed = require("blessed");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const escapeKeypress = require("../../utilities/escapeKeypress.js");
const songHelper = require("../../backend/songHelper.js");
const playerHelper = require("../../backend/playerHelper.js");
const settingsHelper = require("../../backend/settingsHelper.js");

module.exports = function createSongPopover(mainScreen, songsTable, song) {
	const screen = mainScreen.screen;
	const songBox = blessed.box({
		parent: screen,
		border: "line",
		height: 14,
		width: "50%",
		top: "center",
		left: "center",
		label: ` {bold}${song.name}{/bold} `,
		tags: true,
		hidden: false,
		style: {
			fg: settingsHelper.getText(),
			border: {
				fg: settingsHelper.getFocus()
			}
		}
	});

	let songStr = `Artist(s): ${songHelper.getArtistString(song)}\n\nAlbum: ${song.album.name}`;
	songStr += `\n\nRelease Date: ${song.album.release_date}\n\nAdded Rank: ${song.addedRank} (${song.addedAt.split("T")[0]})`;

	// Info about the current song
	blessed.text({
		parent: songBox,
		content: songStr,
		top: 1,
		left: 2,
		width: "100%-4",
		height: 9,
		style: {
			fg: settingsHelper.getText()
		}
	});

	const closeBox = blessed.box({
		parent: songBox,
		content: "Close",
		bottom: -2,
		left: "25%-7",
		height: 3,
		width: 7,
		tags: true,
		align: "center",
		valign: "middle",
		border: "line",
		keys: true,
		style: {
			fg: settingsHelper.getText(),
			border: {
				fg: settingsHelper.getDecline()
			},
			focus: {
				bg: settingsHelper.getDecline(),
				border: {
					fg: settingsHelper.getFocus()
				}
			}
		}
	});

	const queueBox = blessed.box({
		parent: songBox,
		content: "Queue",
		bottom: -2,
		left: "75%",
		height: 3,
		width: 7,
		tags: true,
		align: "center",
		valign: "middle",
		border: "line",
		keys: true,
		style: {
			fg: settingsHelper.getText(),
			border: {
				fg: settingsHelper.getConfirmation()
			},
			focus: {
				bg: settingsHelper.getConfirmation(),
				border: {
					fg: settingsHelper.getFocus()
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
			mainScreen.setFocus(true);
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

			mainScreen.setFocus(true);
			songBox.destroy();
			songsTable.focus();
			screen.render();
		}
	);

	escapeKeypress([queueBox], closeBox);

	mainScreen.setFocus(false);

	closeBox.focus();
	screen.render();

	return songBox;
};

function adjustCasing(str) {
	return str.replace(/(^|[\s-])(\w)/g, (match, separator, letter) => {
		return separator + letter.toUpperCase();
	});
}
