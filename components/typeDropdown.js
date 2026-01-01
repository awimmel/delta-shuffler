const Dropdown = require("./dropdown.js");

class TypeDropdown extends Dropdown {
	constructor(screen, options, parent, top, left, width, siblings, operatorDropdown) {
		super(screen, options, parent, top, left, width, siblings);
		handleDropdownSelect(this, operatorDropdown);
	}
}

function handleDropdownSelect(dropdown, operatorDropdown) {
	dropdown.list.on("select", (_, index) => {
		dropdown.setSelectedIndex(index);
		dropdown.siblings.forEach(dropdownSibling => dropdownSibling.setSelectedIndex(index));
		dropdown.close();

		if (dropdown.getSelectedItem() === "Year") {
			operatorDropdown.setOptions(["<", "<=", "=", ">=", ">"]);
		} else {
			operatorDropdown.setOptions(["IN", "NOT IN"]);
		}

	});
}

module.exports = TypeDropdown;
