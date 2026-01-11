const blessed = require("blessed");
const focusText = require("../../utilities/focusText.js");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const playlistHelper = require("../../backend/playlistHelper.js");

const variables = require("../../database/variables.json");
const primaryColor = variables.primaryColor;

class NamePlaylistPopover {
	constructor(mainScreen, closeElement, title, algorithm) {
		this.mainScreen = mainScreen;
		this.screen = mainScreen.screen;
		this.closeElement = closeElement;
		this.algorithm = algorithm;
		this.popover = blessed.box({
			parent: this.screen,
			border: "line",
			height: 7,
			width: 45,
			top: "center",
			left: "center",
			label: ` {bold}${title}:{/bold} `,
			tags: true,
			hidden: false
		});

		this.nameBox = blessed.textbox({
			parent: this.popover,
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
			parent: this.popover,
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
			parent: this.popover,
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
				this.popover.destroy();
				this.closeElement.focus();
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
				this.popover.destroy();
				const playlists = playlistHelper.createAlgorithmPlaylist(
					this.nameBox.getValue(),
					this.algorithm
				);
				this.mainScreen.setPlaylists(playlists);
				this.mainScreen.screen.render();
			}
		);
		focusText(this.nameBox);

		this.screen.render();
	}
}

module.exports = NamePlaylistPopover;
