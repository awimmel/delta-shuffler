const blessed = require("blessed");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const refreshHelper = require("../../backend/refreshHelper.js");

const variables = require("../../database/variables.json");
const primaryColor = variables.primaryColor;

module.exports = function createRefreshPopover(mainScreen, refreshButton) {
	const refreshBox = blessed.box({
		parent: mainScreen.screen,
		border: "line",
		height: 5,
		width: 60,
		top: "center",
		left: "center",
		label: ` {bold}Refresh?{/bold} `,
		tags: true,
		hidden: false
	});

	blessed.text({
		parent: refreshBox,
		content: `Refresh playlists?\n(this may take a while)`,
		top: 1,
		left: 2,
		width: "100%-4",
		height: 1
	});

	const noBox = blessed.box({
		parent: refreshBox,
		content: "No",
		top: 2,
		left: 15,
		height: 3,
		width: 4,
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

	const yesBox = blessed.box({
		parent: refreshBox,
		content: "Yes",
		top: 2,
		left: 35,
		height: 3,
		width: 5,
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
		noBox,
		() => {},
		focusFunction(yesBox),
		() => {},
		() => {},
		() => {
			refreshBox.destroy();
			refreshButton.focus();
			mainScreen.screen.render();
		}
	);
	toolbarKeypress(
		yesBox,
		focusFunction(noBox),
		() => {},
		() => {},
		() => {},
		async () => {
			mainScreen.screen.lockKeys = true;
			await refreshHelper.refresh(mainScreen);
			mainScreen.screen.lockKeys = false;

			refreshBox.destroy();
			refreshButton.focus();
			mainScreen.screen.render();
		}
	);

	noBox.focus();
	mainScreen.screen.render();

	return refreshBox;
};
