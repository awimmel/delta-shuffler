const blessed = require("blessed");
const playlistHelper = require("../../backend/playlistHelper.js");
const themeHelper = require("../../backend/themeHelper.js");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const escapeKeypress = require("../../utilities/escapeKeypress.js");
const focusText = require("../../utilities/focusText.js");

const hexRegex = /^#[0-9A-Fa-f]{6}$/;

module.exports = function createSettingsPopover(mainScreen, settingsButton) {
	const screen = mainScreen.screen;
	const settingsBox = blessed.box({
		parent: screen,
		border: "line",
		height: "60%",
		width: "50%",
		top: "center",
		left: "center",
		label: ` {bold}Settings{/bold} `,
		tags: true,
		hidden: false
	});

	const hexCodes = themeHelper.getHexCodes();
	const primaryBox = blessed.textbox({
		parent: settingsBox,
		label: " Primary: ",
		top: 1,
		left: 0,
		height: 3,
		width: "50%-1",
		value: hexCodes[0],
		border: "line",
		keys: true,
		style: {
			fg: themeHelper.getText(),
			focus: {
				border: {
					fg: themeHelper.getFocus()
				}
			},
			border: {
				fg: themeHelper.getPrimary()
			}
		}
	});

	const secondaryBox = blessed.textbox({
		parent: settingsBox,
		label: " Secondary: ",
		top: 1,
		left: "50%",
		height: 3,
		width: "50%-1",
		value: hexCodes[1],
		border: "line",
		keys: true,
		style: {
			fg: themeHelper.getText(),
			focus: {
				border: {
					fg: themeHelper.getFocus()
				}
			},
			border: {
				fg: themeHelper.getPrimary()
			}
		}
	});

	const confirmationBox = blessed.textbox({
		parent: settingsBox,
		label: " Confirmation: ",
		top: 4,
		left: 0,
		height: 3,
		width: "50%-1",
		value: hexCodes[2],
		border: "line",
		keys: true,
		style: {
			fg: themeHelper.getText(),
			focus: {
				border: {
					fg: themeHelper.getFocus()
				}
			},
			border: {
				fg: themeHelper.getPrimary()
			}
		}
	});

	const declineBox = blessed.textbox({
		parent: settingsBox,
		label: " Decline: ",
		top: 4,
		left: "50%",
		height: 3,
		width: "50%-1",
		value: hexCodes[3],
		border: "line",
		keys: true,
		style: {
			fg: themeHelper.getText(),
			focus: {
				border: {
					fg: themeHelper.getFocus()
				}
			},
			border: {
				fg: themeHelper.getPrimary()
			}
		}
	});

	const focusBox = blessed.textbox({
		parent: settingsBox,
		label: " Focus: ",
		top: 7,
		left: 0,
		height: 3,
		width: "33%-1",
		value: hexCodes[4],
		border: "line",
		keys: true,
		style: {
			fg: themeHelper.getText(),
			focus: {
				border: {
					fg: themeHelper.getFocus()
				}
			},
			border: {
				fg: themeHelper.getPrimary()
			}
		}
	});

	const textBox = blessed.textbox({
		parent: settingsBox,
		label: " Text: ",
		top: 7,
		left: "33%+1",
		height: 3,
		width: "33%-1",
		value: hexCodes[5],
		border: "line",
		keys: true,
		style: {
			fg: themeHelper.getText(),
			focus: {
				border: {
					fg: themeHelper.getFocus()
				}
			},
			border: {
				fg: themeHelper.getPrimary()
			}
		}
	});

	const utilityBox = blessed.textbox({
		parent: settingsBox,
		label: " Utility: ",
		top: 7,
		left: "66%+1",
		height: 3,
		width: "33%-1",
		value: hexCodes[6],
		border: "line",
		keys: true,
		style: {
			fg: themeHelper.getText(),
			focus: {
				border: {
					fg: themeHelper.getFocus()
				}
			},
			border: {
				fg: themeHelper.getPrimary()
			}
		}
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
		label: " Hide Playlists: ",
		top: 11,
		left: 1,
		width: `100%-4`,
		height: "100%-14",
		items: playlists.map(playlist =>
			playlist.visible ? `[x] ${playlist.name}` : `[ ] ${playlist.name}`
		),
		keys: true,
		border: "line",
		style: {
			selected: {
				bg: themeHelper.getPrimary(),
				fg: "black",
				bold: true
			},
			border: {
				fg: themeHelper.getPrimary()
			},
			focus: {
				border: {
					fg: themeHelper.getFocus()
				}
			}
		}
	});

	const saveBox = blessed.box({
		parent: settingsBox,
		content: "Save",
		bottom: -2,
		left: "center",
		height: 3,
		width: 6,
		tags: true,
		align: "center",
		valign: "middle",
		border: "line",
		keys: true,
		style: {
			fg: themeHelper.getText(),
			bg: "default",
			border: {
				fg: themeHelper.getConfirmation()
			},
			focus: {
				fg: "white",
				bg: themeHelper.getConfirmation(),
				border: {
					fg: "white"
				}
			}
		}
	});

	setTextboxKeypress(
		primaryBox,
		null,
		() => focusText(secondaryBox),
		null,
		() => focusText(confirmationBox)
	);
	setTextboxKeypress(
		secondaryBox,
		() => focusText(primaryBox),
		null,
		null,
		() => focusText(declineBox)
	);
	setTextboxKeypress(
		confirmationBox,
		null,
		() => focusText(declineBox),
		() => focusText(primaryBox),
		() => focusText(focusBox)
	);
	setTextboxKeypress(
		declineBox,
		() => focusText(confirmationBox),
		null,
		() => focusText(secondaryBox),
		() => focusText(utilityBox)
	);
	setTextboxKeypress(
		focusBox,
		null,
		() => focusText(textBox),
		() => focusText(confirmationBox),
		focusFunction(playlistList)
	);
	setTextboxKeypress(
		textBox,
		() => focusText(focusBox),
		() => focusText(utilityBox),
		() => focusText(confirmationBox),
		focusFunction(playlistList)
	);
	setTextboxKeypress(
		utilityBox,
		() => focusText(textBox),
		null,
		() => focusText(declineBox),
		focusFunction(playlistList)
	);

	toolbarKeypress(
		saveBox,
		() => {},
		() => {},
		focusFunction(playlistList),
		() => {},
		() => {
			readAndSaveColors([
				primaryBox,
				secondaryBox,
				confirmationBox,
				declineBox,
				focusBox,
				textBox,
				utilityBox
			]);
			mainScreen.setColors();

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
			saveBox.focus();
			return;
		} else {
			prevSelected = playlistList.selected;
		}
	});
	playlistList.key("up", () => {
		if (!prevSelected || prevSelected === 0) {
			focusText(focusBox);
			return;
		} else {
			prevSelected = playlistList.selected;
		}
	});

	escapeKeypress(
		[primaryBox, secondaryBox, focusBox, confirmationBox, declineBox, utilityBox, playlistList],
		saveBox
	);

	mainScreen.setFocus(false);
	focusText(primaryBox);
	screen.render();

	return settingsBox;
};

function setTextboxKeypress(textbox, leftFocus, rightFocus, upFocus, downFocus) {
	textbox.on("keypress", (char, key) => {
		if (key.name === "left" && leftFocus) {
			leftFocus();
		} else if (key.name === "right" && rightFocus) {
			rightFocus();
		} else if (key.name === "up" && upFocus) {
			upFocus();
		} else if ((key.name === "enter" || key.name === "down") && downFocus) {
			downFocus();
		}
	});
}

function readAndSaveColors(colorTextboxes) {
	colorTextboxes.forEach((colorTextbox, index) => {
		const currVal = colorTextbox.getValue();
		if (hexRegex.test(currVal)) {
			themeHelper.saveHexCode(currVal, index);
		}
	});
}
