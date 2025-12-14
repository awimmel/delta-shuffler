module.exports = function focusElement(el) {
	return () => {
		el.focus();
	};
};
