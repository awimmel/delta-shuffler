const blessed = require("blessed");
const variables = require("../database/variables.json");
const primaryColor = variables.primaryColor;

module.exports = function createSearchBar(parent) {
	return blessed.textbox({
		parent: parent,
		top: 5,
		left: 0,
		height: 3,
		width: "100%",
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
};
