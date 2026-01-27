module.exports = function displayString(val, maxLen) {
	if (val.length < maxLen) {
		return val + " ".repeat(maxLen - val.length);
	} else {
		return val.substring(0, maxLen - 3) + "...";
	}
};
