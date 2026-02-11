const blessed = require("blessed");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const focusText = require("../../utilities/focusText.js");
const escapeKeypress = require("../../utilities/escapeKeypress.js");
const algorithmHelper = require("../../backend/algorithmHelper.js");
const songHelper = require("../../backend/songHelper.js");
const settingsHelper = require("../../backend/settingsHelper.js");

module.exports = function createQueuePopover(mainScreen, algorithmsTable, algorithm) {
	const screen = mainScreen.screen;
	const queueBox = blessed.box({
		parent: screen,
		border: "line",
		height: 9,
		width: 60,
		top: "center",
		left: "center",
		label: ` {bold}${algorithm.name}{/bold} `,
		tags: true,
		hidden: false,
		style: {
			fg: settingsHelper.getText(),
			border: {
				fg: settingsHelper.getFocus()
			}
		}
	});

	const songCountInput = blessed.textbox({
		parent: queueBox,
		label: " Number of Songs: ",
		top: 1,
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
		parent: queueBox,
		label: " * Empty input queues 50 songs, which is also the maximum supported value * ",
		top: 4,
		left: "center",
		height: 1,
		width: "85%",
		content: "",
		style: {
			fg: settingsHelper.getText()
		}
	});

	const cancelBox = blessed.box({
		parent: queueBox,
		content: "Cancel",
		top: 6,
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
		parent: queueBox,
		content: "Queue",
		top: 6,
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
		songCountInput,
		() => {},
		() => {},
		() => {},
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
			queueBox.destroy();
			algorithmsTable.focus();
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
			const input = songCountInput.getValue() === "" ? "50" : songCountInput.getValue();
			let queueValue = Number(input);
			if (Number.isInteger(queueValue)) {
				queueValue = queueValue > 50 ? 50 : queueValue;
				await algorithmHelper.runAlgorithm(
					algorithm,
					songHelper.readSongs(algorithm.playlistId),
					queueValue
				);
			}

			mainScreen.setFocus(true);
			queueBox.destroy();
			algorithmsTable.focus();
			screen.render();
		}
	);

	escapeKeypress([songCountInput, queueSongsBox], cancelBox);

	focusText(songCountInput);
	mainScreen.setFocus(false);
	screen.render();

	return queueBox;
};
