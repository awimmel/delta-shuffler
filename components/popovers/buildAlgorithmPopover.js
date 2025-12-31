const blessed = require("blessed");
const focusText = require("../../utilities/focusText.js");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const ConditionGroup = require("../conditions/conditionGroup.js");
const algorithmHelper = require("../../backend/algorithmHelper.js");

const variables = require("../../database/variables.json");
const primaryColor = variables.primaryColor;

class BuildAlgorithmPopover {
	constructor(name, screen, backButton, searchBar, algorithmsTable) {
		this.name = name;
		this.screen = screen;
		this.backButton = backButton;
		this.searchBar = searchBar;
		this.algorithmsTable = algorithmsTable;
		this.buildAlgBox = blessed.box({
			parent: this.screen,
			border: "line",
			height: 42,
			width: 100,
			top: "center",
			left: "center",
			label: ` {bold}Build ${this.name}:{/bold} `,
			tags: true,
			hidden: false
		});

		this.addConditionButton = createAddConditionButton(this.buildAlgBox, 1);

		this.closeBox = blessed.box({
			parent: this.buildAlgBox,
			content: "Close",
			top: 39,
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

		this.saveBox = blessed.box({
			parent: this.buildAlgBox,
			content: "Save",
			top: 39,
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

		this.conditionGroups = [
			new ConditionGroup(this.screen, this, null, this.addConditionButton, 0)
		];

		toolbarKeypress(
			this.conditionGroups[0].conditionBox,
			() => {},
			() => {},
			() => {},
			focusFunction(this.addConditionButton),
			() => {}
		);
		setAddConditionNavigation(this);
		setBottomBoxesNavigation(this);

		this.conditionGroups[0].focus();
		this.screen.render();
	}

	removeConditionGroup(topOffset) {
		const removedIndex = topOffset / 12;
		this.conditionGroups.splice(removedIndex, 1)[0].destroy();

		if (this.addConditionButton != null) {
			this.addConditionButton.top -= 13;
		} else {
			this.addConditionButton = createAddConditionButton(
				this.buildAlgBox,
				this.conditionGroups.length
			);
			setBottomBoxesNavigation(this);
		}
		setAddConditionNavigation(this);

		this.conditionGroups.forEach((conditionGroup, index, allGroups) => {
			if (index !== 0 && index >= removedIndex) {
				conditionGroup.decrementOffset();
			}

			const topElement = index === 0 ? null : allGroups[index - 1];
			const bottomElement =
				index === allGroups.length - 1
					? this.addConditionButton
					: allGroups[index + 1].joinDropdown;
			conditionGroup.setTopAndBottom(topElement, bottomElement);
		});
		this.conditionGroups.at(-1).focus();

		this.screen.render();
	}
}

function createAddConditionButton(buildAlgBox, conditionGroupCount) {
	return blessed.box({
		parent: buildAlgBox,
		content: "Add Condition Group +",
		top: 12 * conditionGroupCount,
		left: "center",
		height: 3,
		width: 23,
		border: "line",
		style: {
			border: {
				fg: primaryColor
			},
			focus: {
				border: {
					fg: "white"
				}
			}
		}
	});
}

function setAddConditionNavigation(buildAlgPopover) {
	toolbarKeypress(
		buildAlgPopover.addConditionButton,
		() => {},
		() => {},
		() => {
			buildAlgPopover.conditionGroups.at(-1).focus();
		},
		focusFunction(buildAlgPopover.closeBox),
		() => {
			var bottomElement;
			if (buildAlgPopover.conditionGroups.length === 2) {
				buildAlgPopover.addConditionButton.destroy();
				buildAlgPopover.addConditionButton = null;
				bottomElement = buildAlgPopover.closeBox;
			} else {
				buildAlgPopover.addConditionButton.top += 11;
				bottomElement = buildAlgPopover.addConditionButton;
			}

			const prevConditionGroup = buildAlgPopover.conditionGroups.at(-1);
			const offsetAdjustment = buildAlgPopover.conditionGroups.length > 1 ? 1 : 0;
			const newGroup = new ConditionGroup(
				buildAlgPopover.screen,
				buildAlgPopover,
				prevConditionGroup,
				bottomElement,
				12 * buildAlgPopover.conditionGroups.length + offsetAdjustment
			);
			newGroup.focus();
			if (prevConditionGroup?.joinDropdown != null) {
				const joinSibling = prevConditionGroup.joinDropdown;
				newGroup.joinDropdown.addSibling(joinSibling);
				joinSibling.addSibling(newGroup.joinDropdown);
			}

			prevConditionGroup.setBottom(newGroup);
			buildAlgPopover.conditionGroups.push(newGroup);

			if (buildAlgPopover.addConditionButton == null) {
				setBottomBoxesNavigation(buildAlgPopover);
			}

			buildAlgPopover.screen.render();
		}
	);
}

function setBottomBoxesNavigation(buildAlgPopover) {
	const elementAbove = buildAlgPopover.addConditionButton ?? buildAlgPopover.conditionGroups.at(-1);
	toolbarKeypress(
		buildAlgPopover.closeBox,
		() => {},
		focusFunction(buildAlgPopover.saveBox),
		focusFunction(elementAbove),
		() => {},
		() => {
			buildAlgPopover.buildAlgBox.destroy();
			// Focus on the searchBar to remove hanging blinking cursor
			focusText(buildAlgPopover.searchBar);
			buildAlgPopover.backButton.focus();
			buildAlgPopover.screen.render();
		}
	);

	toolbarKeypress(
		buildAlgPopover.saveBox,
		focusFunction(buildAlgPopover.closeBox),
		() => {},
		focusFunction(elementAbove),
		() => {},
		() => {
			const newAlg = algorithmHelper.writeAlgorithm(
				buildAlgPopover.name,
				buildAlgPopover.algorithmsTable.playlistId,
				buildAlgPopover.conditionGroups
			);
			buildAlgPopover.algorithmsTable.addAlgorithm(newAlg);

			buildAlgPopover.buildAlgBox.destroy();
			// Focus on the searchBar to remove hanging blinking cursor
			focusText(buildAlgPopover.searchBar);
			buildAlgPopover.backButton.focus();
			buildAlgPopover.screen.render();
		}
	);
}

module.exports = BuildAlgorithmPopover;
