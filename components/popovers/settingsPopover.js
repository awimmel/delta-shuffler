const blessed = require("blessed");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");

const variables = require("../../database/variables.json");
const primaryColor = variables.primaryColor;

module.exports = function createSettingsPopover(screen, settingsButton) {
	const settingsBox = blessed.box({
		parent: screen,
		border: "line",
		height: 5,
		width: 60,
		top: "center",
		left: "center",
		label: ` {bold}Settings{/bold} `,
		tags: true,
		hidden: false
	});

	blessed.text({
		parent: settingsBox,
		content: `Settings content`,
		top: 1,
		left: 2,
		width: "100%-4",
		height: 1
	});

	const closeBox = blessed.box({
		parent: settingsBox,
		content: "Close",
		top: 2,
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
		() => {},
		() => {},
		() => {
			settingsBox.destroy();
			settingsButton.focus();
			screen.render();
		}
	);

	closeBox.focus();
	screen.render();

	return settingsBox;
};
