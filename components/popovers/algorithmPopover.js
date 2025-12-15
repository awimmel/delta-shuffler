const blessed = require("blessed");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const createQueuePopover = require("./queuePopover.js");
const createDeletePopover = require("./deletePopover");

module.exports = function createAlgorithmPopover(screen, algorithmsTable, algorithm, searchBar) {
	const algorithmBox = blessed.box({
		parent: screen,
		border: "line",
		height: 10,
		width: 60,
		top: "center",
		left: "center",
		label: ` {bold}${algorithm.name}{/bold} `,
		tags: true,
		hidden: false
	});

	blessed.text({
		parent: algorithmBox,
		content: `Matching Songs: 23\n\nCreated Date: 10/15/2025\n\nModified Date: 10/19/2025`,
		top: 1,
		left: 2,
		width: "100%-4",
		height: 5
	});

	const closeBox = blessed.box({
		parent: algorithmBox,
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

	const runAlgorithmBox = blessed.box({
		parent: algorithmBox,
		content: "Run Algorithm",
		top: 7,
		left: 35,
		height: 3,
		width: 15,
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

	let deleteBox;
	if (!algorithm.id.includes("trueRandom")) {
		deleteBox = blessed.box({
			parent: algorithmBox,
			content: "Delete",
			top: -2,
			left: 42,
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

		toolbarKeypress(
			deleteBox,
			() => {},
			() => {},
			() => {},
			() => {
				closeBox.focus();
			},
			() => {
				algorithmBox.destroy();
				createDeletePopover(screen, algorithmsTable, algorithm);
				screen.render();
			}
		);
	}

	toolbarKeypress(
		closeBox,
		() => {},
		focusFunction(runAlgorithmBox),
		() => {
			if (deleteBox != null) {
				deleteBox.focus();
			}
		},
		() => {},
		() => {
			algorithmBox.destroy();
			algorithmsTable.focus();
			screen.render();
		}
	);
	toolbarKeypress(
		runAlgorithmBox,
		focusFunction(closeBox),
		() => {},
		() => {
			if (deleteBox != null) {
				deleteBox.focus();
			}
		},
		() => {},
		() => {
			algorithmBox.destroy();
			createQueuePopover(screen, algorithmsTable, algorithm, searchBar);
			screen.render();
		}
	);

	closeBox.focus();
	screen.render();

	return algorithmBox;
};
