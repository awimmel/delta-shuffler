const focusText = require("./focusText.js");

module.exports = function setListKeypresses(screen, list, allItems, hiddenItems, topEl, bottomEl) {
	list.key("enter", () => {
		const index = list.selected;
		if (hiddenItems.has(index)) {
			hiddenItems.delete(index);
		} else {
			hiddenItems.add(index);
		}
		const checkbox = hiddenItems.has(index) ? "[ ]" : "[x]";
		list.setItem(index, `${checkbox} ${allItems[index].name}`);
		screen.render();
	});
	let prevSelected;
	list.key("down", () => {
		if (prevSelected === list.items.length - 1) {
			bottomEl.focus();
		} else {
			prevSelected = list.selected;
		}
	});
	list.key("up", () => {
		if (!prevSelected || prevSelected === 0) {
			if (topEl) {
				focusText(topEl);
			}
		} else {
			prevSelected = list.selected;
		}
	});
};
