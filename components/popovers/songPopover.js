const blessed = require("blessed");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const escapeKeypress = require("../../utilities/escapeKeypress.js");
const songHelper = require("../../backend/songHelper.js");
const playerHelper = require("../../backend/playerHelper.js");

module.exports = function createSongPopover(mainScreen, songsTable, song) {
	const screen = mainScreen.screen;
	const songBox = blessed.box({
		parent: screen,
		border: "line",
		height: 16,
		width: "50%",
		top: "center",
		left: "center",
		label: ` {bold}${song.name}{/bold} `,
		tags: true,
		hidden: false
	});

	let songStr = `Artist: ${songHelper.getArtistString(song)}\n\nAlbum: ${song.album.name}`;
	const genreStr = [
		...new Set(song.artists.flatMap(artist => artist.genres.map(genre => adjustCasing(genre))))
	].join(", ");
	if (genreStr.length !== 0) {
		songStr += `\n\nGenres: ${genreStr}`;
	}
	songStr += `\n\nRelease Date: ${song.album.release_date}\n\nAdded Rank: ${song.addedRank} (${song.addedAt.split("T")[0]})`;

	// Info about the current song
	blessed.text({
		parent: songBox,
		content: songStr,
		top: 1,
		left: 2,
		width: "100%-4",
		height: 11
	});

	const closeBox = blessed.box({
		parent: songBox,
		content: "Close",
		top: 13,
		left: "25%-7",
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
		top: 13,
		left: "75%",
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
