const path = require("path");
const fs = require("fs");

const filePath = path.join(__dirname, "../database", "variables.json");

exports.getHexCodes = function () {
	const variables = JSON.parse(fs.readFileSync(filePath, "utf8"));
	return [
		variables.primaryColor,
		variables.secondaryColor,
		variables.confirmationColor,
		variables.declineColor,
		variables.focusColor,
		variables.textColor,
		variables.utilityColor
	];
};

exports.saveHexCode = function (val, index) {
	const property = (() => {
		switch (index) {
			case 0:
				return "primaryColor";
			case 1:
				return "secondaryColor";
			case 2:
				return "confirmationColor";
			case 3:
				return "declineColor";
			case 4:
				return "focusColor";
			case 5:
				return "textColor";
			case 6:
				return "utilityColor";
		}
	})();

	const variables = JSON.parse(fs.readFileSync(filePath, "utf8"));
	variables[property] = val;

	fs.writeFileSync(filePath, JSON.stringify(variables), err => {});
};

exports.getPrimary = function () {
	return JSON.parse(fs.readFileSync(filePath, "utf8")).primaryColor;
};

exports.getSecondary = function () {
	return JSON.parse(fs.readFileSync(filePath, "utf8")).secondaryColor;
};

exports.getConfirmation = function () {
	return JSON.parse(fs.readFileSync(filePath, "utf8")).confirmationColor;
};

exports.getDecline = function () {
	return JSON.parse(fs.readFileSync(filePath, "utf8")).declineColor;
};

exports.getFocus = function () {
	return JSON.parse(fs.readFileSync(filePath, "utf8")).focusColor;
};

exports.getText = function () {
	return JSON.parse(fs.readFileSync(filePath, "utf8")).textColor;
};

exports.getUtility = function () {
	return JSON.parse(fs.readFileSync(filePath, "utf8")).utilityColor;
};
