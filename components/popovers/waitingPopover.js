const blessed = require("blessed");
const authHelper = require("../../backend/authHelper.js");

const variables = require("../../database/variables.json");

module.exports = function createWaitingPopover(mainScreen) {
	const waitingPopover = blessed.box({
		parent: mainScreen.screen,
		border: "line",
		height: 5,
		width: 18,
		top: "center",
		left: "center",
		label: ` {bold}Refreshing...{/bold} `,
		tags: true,
		hidden: false
	});

	const spinner = blessed.text({
		parent: waitingPopover,
		content: "",
		top: 1,
		left: "center",
		width: 3,
		height: 1,
		style: {
			fg: variables.primaryColor
		}
	});

	updateSpinner(mainScreen, waitingPopover, spinner);

	waitingPopover.focus();
	mainScreen.screen.lockKeys = true;
	mainScreen.setFocus(false);
	mainScreen.screen.render();

	return waitingPopover;
};

async function updateSpinner(mainScreen, waitingPopover, spinner) {
	if (!authHelper.getRefreshing()) {
		waitingPopover.destroy();
		mainScreen.screen.lockKeys = false;
		mainScreen.setFocus(true);
		mainScreen.screen.render();
		return;
	}

	switch (spinner.getContent()) {
		case "⠋":
			spinner.setContent("⠙");
			break;
		case "⠙":
			spinner.setContent("⠹");
			break;
		case "⠹":
			spinner.setContent("⠸");
			break;
		case "⠸":
			spinner.setContent("⠼");
			break;
		case "⠼":
			spinner.setContent("⠴");
			break;
		case "⠴":
			spinner.setContent("⠦");
			break;
		case "⠦":
			spinner.setContent("⠧");
			break;
		case "⠧":
			spinner.setContent("⠇");
			break;
		case "⠇":
			spinner.setContent("⠏");
			break;
		case "⠏":
			spinner.setContent("⠋");
			break;
		default:
			spinner.setContent("⠙");
	}
	mainScreen.screen.render();

	setTimeout(() => updateSpinner(mainScreen, waitingPopover, spinner), 75);
}
