const focusElement = require("./focusElement.js");

module.exports = function escapeKeypress(elements, closeElement) {
	for (const element of elements) {
		element.key("escape", focusElement(closeElement));
	}
};
