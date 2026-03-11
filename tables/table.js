const blessed = require("blessed");
const settingsHelper = require("../backend/settingsHelper.js");

module.exports = function createTable(parent, top, headers, displayItems) {
	return blessed.listtable({
		parent: parent,
		top: top,
		left: 0,
		height: `100%-${top + 1}`,
		width: "100%",
		border: "line",
		keys: true,
		align: "left",
		data: [headers, ...displayItems],
		style: {
			header: {
				fg: settingsHelper.getPrimary(),
				bold: true
			},
			cell: {
				bold: true,
				fg: settingsHelper.getText(),
				selected: {
					bg: settingsHelper.getPrimary(),
					fg: settingsHelper.getSecondary(),
					bold: true
				}
			},
			border: {
				fg: settingsHelper.getPrimary()
			},
			focus: {
				border: {
					fg: settingsHelper.getFocus()
				}
			}
		}
	});
};
