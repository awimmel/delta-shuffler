const blessed = require("blessed");
const focusText = require("../../utilities/focusText.js");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const BuildAlgorithmPopover = require("./buildAlgorithmPopover.js");

const variables = require("../../database/variables.json");
const primaryColor = variables.primaryColor;

class NameAlgorithmPopover {
	constructor(screen, backButton, searchBar, algorithmsTable) {
		this.screen = screen;
		this.nameAlgBox = blessed.box({
			parent: this.screen,
			border: "line",
			height: 7,
			width: 45,
			top: "center",
			left: "center",
			label: ` {bold}Build Algorithm:{/bold} `,
			tags: true,
			hidden: false
		});

		this.nameBox = blessed.textbox({
			parent: this.nameAlgBox,
			label: " Name:",
			top: 1,
			left: 0,
			height: 3,
			width: "100%-2",
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
			this.nameBox,
			() => {},
			() => {},
			() => {},
			focusFunction(this.closeBox),
			focusFunction(this.saveBox)
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
				this.nameAlgBox.destroy();
				// Focus on the searchBar to remove hanging blinking cursor
				focusText(searchBar);
				backButton.focus();
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
					this.screen,
					backButton,
					searchBar,
					algorithmsTable
				);
			}
		);
		focusText(this.nameBox);

		this.screen.render();
	}
}

module.exports = NameAlgorithmPopover;
