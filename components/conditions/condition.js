const blessed = require("blessed");
const Dropdown = require("../dropdown.js");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const focusText = require("../../utilities/focusText.js");
const variables = require("../../database/variables.json");
const primaryColor = variables.primaryColor;

class Condition {
	constructor(index, screen, conditionGroup, topOffset, allowAdd, allowDelete, bottom) {
		this.index = index;
		this.screen = screen;
		this.conditionGroup = conditionGroup;
		this.topOffset = topOffset;
		this.allowAdd = allowAdd;
		this.allowDelete = allowDelete;
		this.bottom = bottom;
		this.typeDropdown = new Dropdown(
			screen,
			["Song", "Artist", "Album"],
			conditionGroup.conditionBox,
			topOffset,
			0,
			8,
			[]
		);
		this.operatorDropdown = new Dropdown(
			screen,
			["IN", "NOT IN"],
			conditionGroup.conditionBox,
			topOffset,
			9,
			8,
			[]
		);
		this.valueBox = blessed.textbox({
			parent: conditionGroup.conditionBox,
			label: " Value:",
			top: topOffset,
			left: 18,
			height: 3,
			width: "100%-27",
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

		this.addButton = null;
		if (allowAdd) {
			this.addButton = createAddButton(conditionGroup.conditionBox, topOffset);
		}

		this.deleteButton = null;
		if (allowDelete) {
			this.deleteButton = createDeleteButton(conditionGroup.conditionBox, topOffset, allowAdd);
		}
		this.joinDropdown = null;

		setTypicalKeypresses(
			this.typeDropdown,
			this.operatorDropdown,
			this.valueBox,
			this.addButton,
			this.deleteButton,
			this.joinDropdown,
			null,
			this.bottom,
			this.index,
			this.conditionGroup
		);
	}

	toString() {
		const values = this.valueBox.getValue().split(", ");
		return generateConditions(
			this.operatorDropdown.getSelectedItem(),
			this.typeDropdown.getSelectedItem(),
			values,
			this.joinDropdown != null ? this.joinDropdown.getSelectedItem() : ""
		);
	}

	bringDropdownsToFront() {
		this.typeDropdown.bringListToFront();
		this.operatorDropdown.bringListToFront();
		if (this.joinDropdown != null) {
			this.joinDropdown.bringListToFront();
		}
	}

	adjustVerticalNavigation(top, bottom) {
		this.bottom = bottom;
		setTypicalKeypresses(
			this.typeDropdown,
			this.operatorDropdown,
			this.valueBox,
			this.addButton,
			this.deleteButton,
			this.joinDropdown,
			top,
			this.bottom,
			this.index,
			this.conditionGroup
		);
	}

	destroy() {
		this.typeDropdown.destroy();
		this.operatorDropdown.destroy();
		this.valueBox.destroy();
		if (this.addButton != null) {
			this.addButton.destroy();
		}
		if (this.deleteButton != null) {
			this.deleteButton.destroy();
		}
	}

	focus() {
		this.typeDropdown.focus();
	}

	createJoinOperator(top, bottom, siblings) {
		this.joinDropdown = new Dropdown(
			this.screen,
			["AND", "OR"],
			this.conditionGroup.conditionBox,
			this.topOffset,
			"100%-8",
			5,
			siblings
		);

		this.addButton.destroy();
		this.addButton = null;
		if (this.deleteButton != null) {
			this.deleteButton.destroy();
			this.deleteButton = null;
		}
		const lastDropdown = siblings.at(-1);
		if (lastDropdown != null) {
			lastDropdown.bringListToFront();
		}
		this.adjustVerticalNavigation(top, bottom);
	}

	deleteJoinOperator(top, bottom) {
		this.addButton = createAddButton(this.conditionGroup.conditionBox, this.topOffset);
		if (this.allowDelete) {
			this.deleteButton = createDeleteButton(
				this.conditionGroup.conditionBox,
				this.topOffset,
				this.allowAdd
			);
		}

		this.joinDropdown.destroy();
		this.joinDropdown = null;
		this.adjustVerticalNavigation(top, bottom);
	}
}

const ConditionElements = Object.freeze({
	TYPE: Symbol("TYPE"),
	OPERATOR: Symbol("OPERATOR"),
	VALUE: Symbol("VALUE"),
	ADD: Symbol("ADD"),
	DELETE: Symbol("DELETE"),
	JOIN: Symbol("JOIN ")
});

function setTypicalKeypresses(
	typeDropdown,
	operatorDropdown,
	valueBox,
	addButton,
	deleteButton,
	joinDropdown,
	top,
	bottom,
	index,
	conditionGroup
) {
	toolbarKeypress(
		typeDropdown.button,
		() => {},
		focusFunction(operatorDropdown.button),
		veritcalNavigationFunction(top, ConditionElements.TYPE),
		veritcalNavigationFunction(bottom, ConditionElements.TYPE),
		() => {
			typeDropdown.open();
		}
	);
	toolbarKeypress(
		operatorDropdown.button,
		focusFunction(typeDropdown.button),
		() => {
			focusText(valueBox);
		},
		veritcalNavigationFunction(top, ConditionElements.OPERATOR),
		veritcalNavigationFunction(bottom, ConditionElements.OPERATOR),
		() => {
			operatorDropdown.open();
		}
	);
	toolbarKeypress(
		valueBox,
		focusFunction(operatorDropdown.button),
		() => {
			if (joinDropdown != null) {
				joinDropdown.focus();
			} else if (addButton != null) {
				addButton.focus();
			} else {
				deleteButton.focus();
			}
		},
		veritcalNavigationFunction(top, ConditionElements.VALUE),
		veritcalNavigationFunction(bottom, ConditionElements.VALUE),
		() => {}
	);
	if (addButton != null) {
		toolbarKeypress(
			addButton,
			() => {
				focusText(valueBox);
			},
			() => {
				if (deleteButton != null) {
					deleteButton.focus();
				}
			},
			veritcalNavigationFunction(top, ConditionElements.ADD),
			veritcalNavigationFunction(bottom, ConditionElements.ADD),
			() => {
				conditionGroup.addCondition();
			}
		);
	}

	if (deleteButton != null) {
		toolbarKeypress(
			deleteButton,
			focusFunction(addButton),
			() => {},
			veritcalNavigationFunction(top, ConditionElements.DELETE),
			veritcalNavigationFunction(bottom, ConditionElements.DELETE),
			() => {
				conditionGroup.removeCondition(index);
			}
		);
	}

	if (joinDropdown != null) {
		toolbarKeypress(
			joinDropdown.button,
			() => {
				focusText(valueBox);
			},
			() => {},
			veritcalNavigationFunction(top, ConditionElements.JOIN),
			veritcalNavigationFunction(bottom, ConditionElements.JOIN),
			() => {
				joinDropdown.open();
			}
		);
	}
}

function veritcalNavigationFunction(verticalElement, conditionElement) {
	if (verticalElement instanceof Condition) {
		switch (conditionElement) {
			case ConditionElements.TYPE:
				return focusFunction(verticalElement.typeDropdown.button);
			case ConditionElements.OPERATOR:
				return focusFunction(verticalElement.operatorDropdown.button);
			case ConditionElements.VALUE:
				return () => {
					focusText(verticalElement.valueBox);
				};
			case ConditionElements.ADD:
				return endOfRowNavigation(verticalElement);
			case ConditionElements.DELETE:
				return endOfRowNavigation(verticalElement);
			case ConditionElements.JOIN:
				return endOfRowNavigation(verticalElement);
		}
	} else if (verticalElement != null) {
		return focusFunction(verticalElement);
	} else {
		return () => {};
	}
}

function endOfRowNavigation(verticalElement) {
	if (verticalElement.joinDropdown != null) {
		return focusFunction(verticalElement.joinDropdown);
	} else if (verticalElement.addButton != null) {
		return focusFunction(verticalElement.addButton);
	} else {
		return focusFunction(verticalElement.deleteButton);
	}
}

function createAddButton(parent, topOffset) {
	return blessed.box({
		parent: parent,
		content: "+",
		top: topOffset,
		left: "100%-8",
		height: 3,
		width: 3,
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

function createDeleteButton(parent, topOffset, allowAdd) {
	return blessed.box({
		parent: parent,
		content: "X",
		top: topOffset,
		left: allowAdd ? "100%-5" : "100%-8",
		height: 3,
		width: 3,
		border: "line",
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
}

function generateConditions(operatorStr, type, values, join) {
	const operator = getOperator(operatorStr);
	var conditions;
	switch (type) {
		case "Song":
			conditions = values.map(value => `song.name ${operator} '${value}'`);
			break;
		case "Artist":
			conditions = values.map(
				value => `song.artists.some(artist => artist.name ${operator} '${value}')`
			);
			break;
		case "Album":
			conditions = values.map(value => `song.album.name ${operator} '${value}'`);
			break;
	}
	return conditions.join(join);
}

function getOperator(operator) {
	switch (operator) {
		case "IN":
			return "===";
		case "NOT IN":
			return "!==";
	}
}

module.exports = Condition;
