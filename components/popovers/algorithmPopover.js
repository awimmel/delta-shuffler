const blessed = require("blessed");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const createQueuePopover = require("./queuePopover.js");
const createDeletePopover = require("./deletePopover");
const NamePlaylistPopover = require("./namePlaylistPopover.js");
const playlistHelper = require("../../backend/playlistHelper.js");

module.exports = function createAlgorithmPopover(
	mainScreen,
	algorithmsTable,
	algorithm,
	searchBar
) {
	const screen = mainScreen.screen;
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
		content: `Condition: ${algorithm.condition}\n\nMatching Songs: ${algorithm.matchingSongs}`,
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
	let createPlaylistBox;
	let prevSelected = runAlgorithmBox;
	if (!algorithm.id.includes("trueRandom")) {
		const shouldAddPlaylistBox =
			!playlistHelper.algorithmPlaylistPresent(algorithm.id) &&
			!playlistHelper.isAlgorithmPlaylist(algorithm.playlistId);

		deleteBox = blessed.box({
			parent: algorithmBox,
			content: "Delete",
			top: -2,
			left: shouldAddPlaylistBox ? 34 : 42,
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
			() => {
				if (createPlaylistBox) {
					createPlaylistBox.focus();
				}
			},
			() => {},
			() => {
				if (shouldAddPlaylistBox) {
					closeBox.focus();
				} else {
					prevSelected.focus();
				}
			},
			() => {
				algorithmBox.destroy();
				createDeletePopover(mainScreen, algorithmsTable, algorithm);
				screen.render();
			}
		);

		if (shouldAddPlaylistBox) {
			createPlaylistBox = blessed.box({
				parent: algorithmBox,
				content: "Create Playlist",
				top: -2,
				left: 43,
				height: 3,
				width: 17,
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
				createPlaylistBox,
				focusFunction(deleteBox),
				() => {},
				() => {},
				focusFunction(runAlgorithmBox),
				() => {
					algorithmBox.destroy();
					new NamePlaylistPopover(mainScreen, algorithmsTable, "Create Playlist", algorithm);
					screen.render();
				}
			);
		}
	}

	toolbarKeypress(
		closeBox,
		() => {},
		() => {
			prevSelected = runAlgorithmBox;
			runAlgorithmBox.focus();
		},
		() => {
			if (deleteBox != null) {
				deleteBox.focus();
			}
		},
		() => {},
		() => {
			mainScreen.setFocus(true);

			algorithmBox.destroy();
			algorithmsTable.focus();
			screen.render();
		}
	);
	toolbarKeypress(
		runAlgorithmBox,
		() => {
			prevSelected = closeBox;
			closeBox.focus();
		},
		() => {},
		() => {
			if (createPlaylistBox != null) {
				createPlaylistBox.focus();
			} else if (deleteBox != null) {
				deleteBox.focus();
			}
		},
		() => {},
		() => {
			algorithmBox.destroy();
			createQueuePopover(mainScreen, algorithmsTable, algorithm, searchBar);
			screen.render();
		}
	);

	mainScreen.setFocus(false);

	runAlgorithmBox.focus();
	screen.render();

	return algorithmBox;
};
