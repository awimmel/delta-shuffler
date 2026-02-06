const blessed = require("blessed");
const Condition = require("./condition.js");
const Dropdown = require("../dropdown.js");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const joinOperator = require("../../utilities/joinOperator.js");
const escapeKeypress = require("../../utilities/escapeKeypress.js");
const themeHelper = require("../../backend/themeHelper.js");

class ConditionGroup {
	constructor(screen, buildAlgorithmPopover, top, bottom, topOffset, closeBox) {
		this.screen = screen;
		this.buildAlgorithmPopover = buildAlgorithmPopover;
		this.bottom = bottom;
		this.topOffset = topOffset;
		this.closeBox = closeBox;
		this.heightAdjustment = this.topOffset !== 0 ? 1 : 0;
		this.conditionBox = blessed.box({
			parent: this.buildAlgorithmPopover.buildAlgBox,
			top: this.topOffset,
			left: 0,
			height: 11 + this.heightAdjustment,
			width: "100%-2",
			border: "line",
			style: {
				border: {
					fg: themeHelper.getPrimary()
				},
				focus: {
					border: {
						fg: themeHelper.getFocus()
					}
				}
			}
		});

		this.conditions = [
			new Condition(0, this.screen, this, this.heightAdjustment, true, false, this.bottom, closeBox)
		];
		this.closeButton = null;
		this.joinDropdown = null;
		if (top != null) {
			this.closeButton = blessed.box({
				parent: this.conditionBox,
				content: "X",
				top: -2,
				left: "100%-5",
				height: 3,
				width: 3,
				border: "line",
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

			this.joinDropdown = new Dropdown(
				this.screen,
				["AND", "OR"],
				this.conditionBox,
				-2,
				"100%-10",
				5,
				[]
			);

			this.conditions[0].adjustVerticalNavigation(this.joinDropdown.button, this.bottom);
			toolbarKeypress(
				this.closeButton,
				focusFunction(this.joinDropdown.button),
				() => {},
				focusFunction(top),
				focusFunction(this.conditions[0]),
				() => {
					this.buildAlgorithmPopover.removeConditionGroup(this.topOffset);
				}
			);
			toolbarKeypress(
				this.joinDropdown.button,
				() => {},
				focusFunction(this.closeButton),
				focusFunction(top),
				focusFunction(this.conditions[0]),
				() => {
					this.joinDropdown.open();
				}
			);

			escapeKeypress([this.closeButton, this.joinDropdown.button], closeBox);
		}
	}

	focus() {
		this.conditions.at(-1).focus();
	}

	addCondition() {
		const newCondition = new Condition(
			this.conditions.length,
			this.screen,
			this,
			this.conditions.length * 3 + this.heightAdjustment,
			this.conditions.length !== 2,
			true,
			this.bottom,
			this.closeBox
		);

		const secondLastCondition = this.conditions.at(-2) ?? null;
		var joinSiblings = secondLastCondition != null ? [secondLastCondition.joinDropdown] : [];
		const lastCondition = this.conditions.at(-1);
		lastCondition.createJoinOperator(
			secondLastCondition ?? this.joinDropdown,
			newCondition,
			joinSiblings
		);
		lastCondition.bringDropdownsToFront();
		joinSiblings.forEach(joinSibling => joinSibling.addSibling(lastCondition.joinDropdown));
		if (secondLastCondition != null) {
			secondLastCondition.adjustVerticalNavigation(
				this.conditions.at(-3) ?? this.joinDropdown,
				lastCondition
			);
		}

		newCondition.adjustVerticalNavigation(lastCondition, this.bottom);

		this.conditions.push(newCondition);
		newCondition.focus();

		this.joinDropdown?.bringListToFront();

		this.screen.render();
	}

	removeCondition(index) {
		this.conditions.splice(index, 1)[0].destroy();

		const lastCondition = this.conditions[index - 1];
		const secondLastCondition = this.conditions.at(-2) ?? null;
		lastCondition.deleteJoinOperator(secondLastCondition ?? this.joinDropdown, this.bottom);
		if (secondLastCondition != null) {
			secondLastCondition.bringDropdownsToFront();
		}
		lastCondition.focus();

		this.screen.render();
	}

	setBottom(bottomElement) {
		this.bottom = bottomElement;
		let topElement = this.conditions.at(-2);
		if (topElement == null) {
			topElement = this.joinDropdown?.button ?? this.closeButton;
		}
		this.conditions.at(-1).adjustVerticalNavigation(topElement, bottomElement.joinDropdown.button);
	}

	setTopAndBottom(topElement, bottomElement) {
		if (this.joinDropdown != null && this.closeButton != null) {
			toolbarKeypress(
				this.joinDropdown.button,
				() => {},
				focusFunction(this.closeButton),
				focusFunction(topElement),
				focusFunction(this.conditions[0]),
				() => {
					this.buildAlgorithmPopover.removeConditionGroup(this.topOffset);
				}
			);
		}

		this.bottom = bottomElement;
		this.conditions
			.at(-1)
			.adjustVerticalNavigation(this.conditions.at(-2) ?? this.joinDropdown?.button, bottomElement);
	}

	destroy() {
		this.conditionBox.destroy();
		this.conditions.forEach(condition => condition.destroy());
		if (this.closeButton != null) {
			this.closeButton.destroy();
		}
	}

	decrementOffset() {
		this.topOffset -= 13;
		this.conditionBox.top = this.topOffset;
	}

	addJoinSibling(joinSibling) {
		this.joinDropdown.addSibling(joinSibling);
	}

	toString() {
		const join = this.conditions.length > 1 ? this.conditions[0].joinDropdown.getSelectedItem() : "";
		return this.conditions.map(condition => `(${condition.toString()})`).join(joinOperator(join));
	}
}

module.exports = ConditionGroup;
