const blessed = require("blessed");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const playlistHelper = require("../../backend/playlistHelper.js");
const focusFunction = require("../../utilities/focusElement.js");

const variables = require("../../database/variables.json");
const primaryColor = variables.primaryColor;

module.exports = function createSettingsPopover(mainScreen, settingsButton) {
	const screen = mainScreen.screen;
	const settingsBox = blessed.box({
		parent: screen,
		border: "line",
		height: "60%",
		width: 60,
		top: "center",
		left: "center",
		label: ` {bold}Settings{/bold} `,
		tags: true,
		hidden: false
	});

	blessed.text({
		parent: settingsBox,
		content: "Hide Playlists:",
		top: 1,
		left: 1,
		width: 17,
		height: 1
	});

	const playlists = playlistHelper
		.readPlaylists()
		.sort((first, second) => first.name.localeCompare(second.name));
	const hidden = new Set(
		playlists
			.map((playlist, index) => (!playlist.visible ? index : -1))
			.filter(index => index !== -1)
	);

	const playlistList = blessed.list({
		parent: settingsBox,
		top: 2,
		left: 1,
		width: `100%-4`,
		height: "100%-6",
		items: playlists.map(playlist =>
			playlist.visible ? `[x] ${playlist.name}` : `[ ] ${playlist.name}`
		),
		keys: true,
		border: "line",
		style: {
			selected: {
				bg: primaryColor,
				fg: "black",
				bold: true
			},
			border: {
				fg: primaryColor
			},
			focus: {
				border: {
					fg: "white"
				}
			}
		}
	});

	const closeBox = blessed.box({
		parent: settingsBox,
		content: "Close",
		bottom: -2,
		left: 27,
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
				fg: primaryColor
			},
			focus: {
				fg: "black",
				bg: primaryColor,
				border: {
					fg: "white"
				}
			}
		}
	});

	toolbarKeypress(
		closeBox,
		() => {},
		() => {},
		focusFunction(playlistList),
		() => {},
		() => {
			const hiddenIds = playlists
				.filter((playlist, index) => hidden.has(index))
				.map(playlist => playlist.id);
			playlistHelper.hidePlaylists(hiddenIds);

			mainScreen.setPlaylists(playlists.filter((playlist, index) => !hidden.has(index)));
			mainScreen.setFocus(true);

			settingsBox.destroy();
			settingsButton.focus();
			screen.render();
		}
	);

	playlistList.key("enter", () => {
		const index = playlistList.selected;
		if (hidden.has(index)) {
			hidden.delete(index);
		} else {
			hidden.add(index);
		}
		const checkbox = hidden.has(index) ? "[ ]" : "[x]";
		playlistList.setItem(index, `${checkbox} ${playlists[index].name}`);
		screen.render();
	});
	let prevSelected;
	playlistList.key("down", () => {
		if (prevSelected === playlistList.items.length - 1) {
			closeBox.focus();
			return;
		} else {
			prevSelected = playlistList.selected;
		}
	});
	playlistList.key("up", () => {
		prevSelected = playlistList.selected;
	});

	mainScreen.setFocus(false);
	playlistList.focus();
	screen.render();

	return settingsBox;
};
