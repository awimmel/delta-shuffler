module.exports = function setTableKeypress(element, enterFunction, focusAbove) {
	var prevSelected = 0;
	element.on("keypress", function (char, key) {
		if (key.name === "enter") {
			enterFunction(this.selected);
		} else if (
			key.name === "up" &&
			this.selected === 1 &&
			(this.selected === prevSelected || prevSelected === 0)
		) {
			focusAbove();
			prevSelected = 0;
		} else {
			prevSelected = this.selected;
		}
	});
};
