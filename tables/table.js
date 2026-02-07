const blessed = require("blessed");
const themeHelper = require("../backend/themeHelper.js");

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
				fg: themeHelper.getPrimary(),
				bold: true
			},
			cell: {
				bold: true,
				selected: {
					bg: themeHelper.getPrimary(),
					fg: themeHelper.getSecondary(),
					bold: true
				}
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
};
