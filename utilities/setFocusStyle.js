const settingsHelper = require("../backend/settingsHelper.js");

module.exports = function setFocusStyle(el, setFg, focusColor) {
	el.on("focus", function () {
		if (setFg) {
			this.style.fg = settingsHelper.getSecondary();
		}
		this.style.bg = focusColor;
		this.style.border.fg = settingsHelper.getFocus();
		this.screen.render();
	});

	el.on("blur", function () {
		if (setFg) {
			this.style.fg = settingsHelper.getText();
		}
		this.style.bg = "none";
		this.style.border.fg = focusColor;
		this.screen.render();
	});
}