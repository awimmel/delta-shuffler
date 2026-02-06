const blessed = require("blessed");
const themeHelper = require("../backend/themeHelper.js");

class Dropdown {
	constructor(screen, options, parent, top, left, width, siblings) {
		this.screen = screen;
		this.options = options;
		this.parent = parent;
		this.top = top;
		this.left = left;
		this.width = width;
		this.siblings = siblings;
		this.selectedIndex = this.siblings.length !== 0 ? this.siblings[0].getSelectedIndex() : 0;
		this.isOpen = false;

		this.button = blessed.box({
			parent: parent,
			content: options[this.selectedIndex],
			top: top,
			left: left,
			height: 3,
			width: width,
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

		this.list = createList(this.parent, this.top, this.left, this.width, this.options);
		this.list.setIndex(9999);

		handleDropdownSelect(this);
	}

	open() {
		if (!this.isOpen) {
			this.isOpen = true;
			this.list.show();
			this.list.focus();
			this.list.select(this.selectedIndex);
			this.screen.render();
		}
	}

	close() {
		if (this.isOpen) {
			this.isOpen = false;
			this.list.hide();
			this.button.focus();
			this.screen.render();
		}
	}

	setSelectedIndex(index) {
		if (index >= 0 && index < this.options.length) {
			this.selectedIndex = index;
			this.button.setContent(this.options[index]);
			this.screen.render();
		}
	}

	getSelectedIndex() {
		return this.selectedIndex;
	}

	getSelectedItem() {
		return this.options[this.selectedIndex];
	}

	focus() {
		this.button.focus();
	}

	bringListToFront() {
		this.list.setFront();
	}

	destroy() {
		this.button.destroy();
		this.list.destroy();
	}

	addSibling(otherDropdown) {
		this.siblings.push(otherDropdown);
	}

	setOptions(options) {
		this.options = options;
		this.list.setItems(options);
		this.list.height = options.length + 2;
		this.button.content = options[0];
		this.screen.render();
	}
}

function handleDropdownSelect(dropdown) {
	dropdown.list.on("select", (_, index) => {
		dropdown.setSelectedIndex(index);
		dropdown.siblings.forEach(dropdownSibling => dropdownSibling.setSelectedIndex(index));
		dropdown.close();
	});
}

function createList(parent, top, left, width, options) {
	return blessed.list({
		parent: parent,
		top: top,
		left: left,
		width: width,
		height: options.length + 2,
		items: options,
		hidden: true,
		keys: true,
		border: "line",
		style: {
			selected: {
				bg: themeHelper.getPrimary(),
				fg: "black",
				bold: true
			},
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
}

module.exports = Dropdown;
