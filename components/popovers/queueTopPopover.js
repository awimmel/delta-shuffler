const blessed = require("blessed");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const focusText = require("../../utilities/focusText.js");
const escapeKeypress = require("../../utilities/escapeKeypress.js");
const settingsHelper = require("../../backend/settingsHelper.js");
const playerHelper = require("../../backend/playerHelper.js");

const Dropdown = require("../dropdown.js");

module.exports = function createQueueTopPopover(mainScreen, queueTopButton) {
	const screen = mainScreen.screen;
	const queueTopBox = blessed.box({
		parent: screen,
		border: "line",
		height: 21,
		width: 60,
		top: "center",
		left: "center",
		label: ` {bold}Queue Top Items:{/bold} `,
		tags: true,
		hidden: false,
		style: {
			fg: settingsHelper.getText(),
			border: {
				fg: settingsHelper.getFocus()
			}
		}
	});

	blessed.text({
		parent: queueTopBox,
		label: "Items to queue:",
		top: 1,
		left: 0,
		height: 1,
		width: 17,
		style: {
			fg: settingsHelper.getText()
		}
	});
	const itemDropdown = new Dropdown(screen, ["Artists", "Songs"], queueTopBox, 0, "center", 8, []);

	blessed.text({
		parent: queueTopBox,
		label: "Time range:",
		top: 5,
		left: 0,
		height: 1,
		width: 13,
		style: {
			fg: settingsHelper.getText()
		}
	});
	const timeDropdown = new Dropdown(
		screen,
		["Last Month", "Last 6 Months", "Last Year"],
		queueTopBox,
		4,
		"center",
		15,
		[]
	);

	const topItemsInput = blessed.textbox({
		parent: queueTopBox,
		label: " Top X Items: ",
		top: 9,
		left: "center",
		height: 3,
		width: "85%",
		content: "",
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

	const songCountInput = blessed.textbox({
		parent: queueTopBox,
		label: " Number of Songs: ",
		top: 12,
		left: "center",
		height: 3,
		width: "85%",
		content: "",
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

	blessed.text({
		parent: queueTopBox,
		label:
			" * Empty input defaults to 50, which is also the maximum supported value for both inputs * ",
		top: 15,
		left: "center",
		height: 1,
		width: "85%",
		style: {
			fg: settingsHelper.getText()
		}
	});

	const cancelBox = blessed.box({
		parent: queueTopBox,
		content: "Cancel",
		bottom: -2,
		left: 11,
		height: 3,
		width: 8,
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

	const queueSongsBox = blessed.box({
		parent: queueTopBox,
		content: "Queue",
		bottom: -2,
		left: 41,
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
		itemDropdown.button,
		() => {},
		() => {},
		() => {},
		focusFunction(timeDropdown.button),
		() => {
			itemDropdown.open();
		}
	);
	toolbarKeypress(
		timeDropdown.button,
		() => {},
		() => {},
		focusFunction(itemDropdown.button),
		() => {
			focusText(topItemsInput);
		},
		() => {
			timeDropdown.open();
		}
	);
	toolbarKeypress(
		topItemsInput,
		() => {},
		() => {},
		focusFunction(timeDropdown.button),
		() => {
			focusText(songCountInput);
		},
		() => {}
	);
	toolbarKeypress(
		songCountInput,
		() => {},
		() => {},
		() => {
			focusText(topItemsInput);
		},
		() => {
			cancelBox.focus();
		},
		() => {}
	);
	toolbarKeypress(
		cancelBox,
		() => {},
		focusFunction(queueSongsBox),
		() => {
			focusText(songCountInput);
		},
		() => {},
		() => {
			mainScreen.setFocus(true);
			queueTopButton.focus();
			queueTopBox.destroy();
			screen.render();
		}
	);
	toolbarKeypress(
		queueSongsBox,
		focusFunction(cancelBox),
		() => {},
		() => {
			focusText(songCountInput);
		},
		() => {},
		async () => {
			const topItemsValue = readNumericInput(topItemsInput);
			const queueValue = readNumericInput(songCountInput);

			playerHelper.queueTopItems(
				itemDropdown.getSelectedItem(),
				timeDropdown.getSelectedItem(),
				topItemsValue,
				queueValue
			);

			mainScreen.setFocus(true);
			queueTopButton.focus();
			queueTopBox.destroy();
			screen.render();
		}
	);

	escapeKeypress(
		[itemDropdown.button, timeDropdown.button, topItemsInput, songCountInput, queueSongsBox],
		cancelBox
	);

	itemDropdown.button.focus();
	mainScreen.setFocus(false);
	screen.render();

	return queueTopBox;
};

function readNumericInput(element) {
	const input = element.getValue() === "" ? "50" : element.getValue();
	let numericVal = Number(input);
	if (Number.isInteger(numericVal)) {
		numericVal = numericVal > 50 ? 50 : numericVal;
		return numericVal;
	}
	return 0;
}
