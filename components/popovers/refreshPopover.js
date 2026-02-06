const blessed = require("blessed");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const escapeKeypress = require("../../utilities/escapeKeypress.js");
const refreshHelper = require("../../backend/refreshHelper.js");
const themeHelper = require("../../backend/themeHelper.js");

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
		hidden: false,
		style: {
			fg: themeHelper.getText(),
			border: {
				fg: themeHelper.getFocus()
			}
		}
	});

	blessed.text({
		parent: refreshBox,
		content: `Refresh playlists?\n(this may take a while)`,
		top: 1,
		left: 2,
		width: "100%-4",
		height: 1,
		style: {
			fg: themeHelper.getText()
		}
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
			fg: themeHelper.getText(),
			border: {
				fg: themeHelper.getDecline()
			},
			focus: {
				bg: themeHelper.getDecline(),
				border: {
					fg: themeHelper.getFocus()
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
			fg: themeHelper.getText(),
			border: {
				fg: themeHelper.getConfirmation()
			},
			focus: {
				bg: themeHelper.getConfirmation(),
				border: {
					fg: themeHelper.getFocus()
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
			mainScreen.setFocus(true);
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
			refreshHelper.refresh(mainScreen);
			mainScreen.createWaitingPopover();

			refreshBox.destroy();
			refreshButton.focus();
			mainScreen.screen.render();
		}
	);

	escapeKeypress([yesBox], noBox);

	noBox.focus();
	mainScreen.setFocus(false);
	mainScreen.screen.render();

	return refreshBox;
};
