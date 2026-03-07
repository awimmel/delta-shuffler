module.exports = function readNumericInput(inputElement) {
	const input = inputElement.getValue() === "" ? "50" : inputElement.getValue();
	let numericVal = Number(input);
	if (Number.isInteger(numericVal)) {
		numericVal = numericVal > 50 ? 50 : numericVal;
		return numericVal;
	}
	return 0;
};
