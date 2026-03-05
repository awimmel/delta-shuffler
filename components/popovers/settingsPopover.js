const blessed = require("blessed");
const playlistHelper = require("../../backend/playlistHelper.js");
const settingsHelper = require("../../backend/settingsHelper.js");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const escapeKeypress = require("../../utilities/escapeKeypress.js");
const focusText = require("../../utilities/focusText.js");
const setListKeypresses = require("../../utilities/setListKeypresses.js");

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

	const albumArtCheckbox = blessed.checkbox({
		parent: settingsBox,
		content: "Display album art?",
		checked: settingsHelper.getShowAlbumArt(),
		top: 0,
		left: 0,
		width: "50%-1",
		height: 3,
		border: "line",
		style: {
			fg: settingsHelper.getText(),
			focus: {
				border: {
					fg: settingsHelper.getFocus()
				}
			},
			border: {
				fg: settingsHelper.getPrimary()
			}
		}
	});

	const footerCheckbox = blessed.checkbox({
		parent: settingsBox,
		content: "Display footer?",
		checked: settingsHelper.getShowFooter(),
		top: 0,
		left: "50%-1",
		width: "50%-1",
		height: 3,
		border: "line",
		style: {
			fg: settingsHelper.getText(),
			focus: {
				border: {
					fg: settingsHelper.getFocus()
				}
			},
			border: {
				fg: settingsHelper.getPrimary()
			}
		}
	});

	const hexCodes = settingsHelper.getHexCodes();
	const primaryBox = blessed.textbox({
		parent: settingsBox,
		label: " Primary: ",
		top: 3,
		left: 0,
		height: 3,
		width: "50%-1",
		value: hexCodes[0],
		border: "line",
		keys: true,
		style: {
			fg: settingsHelper.getText(),
			focus: {
				border: {
					fg: settingsHelper.getFocus()
				}
			},
			border: {
				fg: settingsHelper.getPrimary()
			}
		}
	});

	const secondaryBox = blessed.textbox({
		parent: settingsBox,
		label: " Secondary: ",
		top: 3,
		left: "50%-1",
		height: 3,
		width: "50%-1",
		value: hexCodes[1],
		border: "line",
		keys: true,
		style: {
			fg: settingsHelper.getText(),
			focus: {
				border: {
					fg: settingsHelper.getFocus()
				}
			},
			border: {
				fg: settingsHelper.getPrimary()
			}
		}
	});

	const confirmationBox = blessed.textbox({
		parent: settingsBox,
		label: " Confirmation: ",
		top: 6,
		left: 0,
		height: 3,
		width: "50%-1",
		value: hexCodes[2],
		border: "line",
		keys: true,
		style: {
			fg: settingsHelper.getText(),
			focus: {
				border: {
					fg: settingsHelper.getFocus()
				}
			},
			border: {
				fg: settingsHelper.getPrimary()
			}
		}
	});

	const declineBox = blessed.textbox({
		parent: settingsBox,
		label: " Decline: ",
		top: 6,
		left: "50%-1",
		height: 3,
		width: "50%-1",
		value: hexCodes[3],
		border: "line",
		keys: true,
		style: {
			fg: settingsHelper.getText(),
			focus: {
				border: {
					fg: settingsHelper.getFocus()
				}
			},
			border: {
				fg: settingsHelper.getPrimary()
			}
		}
	});

	const focusBox = blessed.textbox({
		parent: settingsBox,
		label: " Focus: ",
		top: 9,
		left: 0,
		height: 3,
		width: "33%",
		value: hexCodes[4],
		border: "line",
		keys: true,
		style: {
			fg: settingsHelper.getText(),
			focus: {
				border: {
					fg: settingsHelper.getFocus()
				}
			},
			border: {
				fg: settingsHelper.getPrimary()
			}
		}
	});

	const textBox = blessed.textbox({
		parent: settingsBox,
		label: " Text: ",
		top: 9,
		left: "33%",
		height: 3,
		width: "34%",
		value: hexCodes[5],
		border: "line",
		keys: true,
		style: {
			fg: settingsHelper.getText(),
			focus: {
				border: {
					fg: settingsHelper.getFocus()
				}
			},
			border: {
				fg: settingsHelper.getPrimary()
			}
		}
	});

	const utilityBox = blessed.textbox({
		parent: settingsBox,
		label: " Utility: ",
		top: 9,
		left: "66%",
		height: 3,
		width: "33%-1",
		value: hexCodes[6],
		border: "line",
		keys: true,
		style: {
			fg: settingsHelper.getText(),
			focus: {
				border: {
					fg: settingsHelper.getFocus()
				}
			},
			border: {
				fg: settingsHelper.getPrimary()
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
		top: 12,
		left: 1,
		width: `100%-4`,
		height: "100%-15",
		items: playlists.map(playlist =>
			playlist.visible ? `[x] ${playlist.name}` : `[ ] ${playlist.name}`
		),
		keys: true,
		border: "line",
		style: {
			selected: {
				bg: settingsHelper.getPrimary(),
				fg: settingsHelper.getSecondary(),
				bold: true
			},
			border: {
				fg: settingsHelper.getPrimary()
			},
			focus: {
				border: {
					fg: settingsHelper.getFocus()
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
			fg: settingsHelper.getText(),
			bg: "default",
			border: {
				fg: settingsHelper.getConfirmation()
			},
			focus: {
				fg: "white",
				bg: settingsHelper.getConfirmation(),
				border: {
					fg: "white"
				}
			}
		}
	});

	toolbarKeypress(
		albumArtCheckbox,
		() => {},
		focusFunction(footerCheckbox),
		() => {},
		() => focusText(primaryBox),
		() => {
			albumArtCheckbox.toggle();
			screen.render();
		}
	);

	toolbarKeypress(
		footerCheckbox,
		focusFunction(albumArtCheckbox),
		() => {},
		() => {},
		() => focusText(secondaryBox),
		() => {
			footerCheckbox.toggle();
			screen.render();
		}
	);

	setTextboxKeypress(
		primaryBox,
		null,
		() => focusText(secondaryBox),
		focusFunction(albumArtCheckbox),
		() => focusText(confirmationBox)
	);
	setTextboxKeypress(
		secondaryBox,
		() => focusText(primaryBox),
		null,
		focusFunction(albumArtCheckbox),
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
			settingsHelper.saveShowAlbumArt(albumArtCheckbox.checked);
			settingsHelper.saveShowFooter(footerCheckbox.checked);

			readAndSaveColors([
				primaryBox,
				secondaryBox,
				confirmationBox,
				declineBox,
				focusBox,
				textBox,
				utilityBox
			]);
			mainScreen.resizeAndSetColors();

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

	setListKeypresses(screen, playlistList, playlists, hidden, focusBox, saveBox);

	escapeKeypress(
		[
			albumArtCheckbox,
			footerCheckbox,
			primaryBox,
			secondaryBox,
			focusBox,
			confirmationBox,
			declineBox,
			utilityBox,
			playlistList
		],
		saveBox
	);

	mainScreen.setFocus(false);
	albumArtCheckbox.focus();
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
			settingsHelper.saveHexCode(currVal, index);
		}
	});
}
