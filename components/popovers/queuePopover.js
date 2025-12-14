const blessed = require("blessed");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const focusText = require("../../utilities/focusText.js");

const variables = require("../../database/variables.json");
const primaryColor = variables.primaryColor;

module.exports = function createQueuePopover(screen, algorithmsTable, algorithm, searchBar) {
	const queueBox = blessed.box({
		parent: screen,
		border: "line",
		height: 7,
		width: 60,
		top: "center",
		left: "center",
		label: ` {bold}${algorithm.name}{/bold} `,
		tags: true,
		hidden: false
	});

	const songCountInput = blessed.textbox({
		parent: queueBox,
		label: " Number of Songs (empty queues all songs): ",
		top: 1,
		left: "center",
		height: 3,
		width: "85%",
		content: "",
		border: "line",
		keys: true,
		style: {
			fg: "white",
			focus: {
				border: {
					fg: "white"
				}
			},
			border: {
				fg: primaryColor
			}
		}
	});

	const cancelBox = blessed.box({
		parent: queueBox,
		content: "Cancel",
		top: 4,
		left: 15,
		height: 3,
		width: 8,
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

	const queueSongsBox = blessed.box({
		parent: queueBox,
		content: "Queue",
		top: 4,
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
			queueBox.destroy();
			focusText(searchBar);
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
		() => {
			queueBox.destroy();
			focusText(searchBar);
			algorithmsTable.focus();
			screen.render();
		}
	);

	focusText(songCountInput);
	screen.render();

	return queueBox;
};
