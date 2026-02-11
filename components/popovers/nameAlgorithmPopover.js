const blessed = require("blessed");
const focusText = require("../../utilities/focusText.js");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const escapeKeypress = require("../../utilities/escapeKeypress.js");
const BuildAlgorithmPopover = require("./buildAlgorithmPopover.js");
const settingsHelper = require("../../backend/settingsHelper.js");

class NameAlgorithmPopover {
	constructor(mainScreen, createAlgorithmButton, searchBar, algorithmsTable) {
		this.mainScreen = mainScreen;
		this.screen = mainScreen.screen;
		this.nameAlgBox = blessed.box({
			parent: this.screen,
			border: "line",
			height: 7,
			width: 45,
			top: "center",
			left: "center",
			label: ` {bold}Build Algorithm:{/bold} `,
			tags: true,
			hidden: false,
			style: {
				fg: settingsHelper.getText(),
				border: {
					fg: settingsHelper.getFocus()
				}
			}
		});

		this.nameBox = blessed.textbox({
			parent: this.nameAlgBox,
			label: " Name: ",
			top: 1,
			left: 0,
			height: 3,
			width: "100%-2",
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

		this.closeBox = blessed.box({
			parent: this.nameAlgBox,
			content: "Close",
			top: 4,
			left: "25%-3",
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

		this.nextBox = blessed.box({
			parent: this.nameAlgBox,
			content: "Next",
			top: 4,
			left: "75%-3",
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
			this.nameBox,
			() => {},
			() => {},
			() => {},
			focusFunction(this.closeBox),
			focusFunction(this.nextBox)
		);
		toolbarKeypress(
			this.closeBox,
			() => {},
			focusFunction(this.nextBox),
			() => {
				focusText(this.nameBox);
			},
			() => {},
			() => {
				mainScreen.setFocus(true);
				this.nameAlgBox.destroy();
				createAlgorithmButton.focus();
				this.screen.render();
			}
		);
		toolbarKeypress(
			this.nextBox,
			focusFunction(this.closeBox),
			() => {},
			() => {
				focusText(this.nameBox);
			},
			() => {},
			() => {
				this.nameAlgBox.destroy();
				new BuildAlgorithmPopover(
					this.nameBox.value,
					this.mainScreen,
					createAlgorithmButton,
					searchBar,
					algorithmsTable
				);
			}
		);
		focusText(this.nameBox);

		escapeKeypress([this.nameBox, this.nextBox], this.closeBox);

		this.mainScreen.setFocus(false);
		this.screen.render();
	}
}

module.exports = NameAlgorithmPopover;
