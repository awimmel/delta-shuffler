const path = require("path");
const fs = require("fs");

const getAppDataDir = require("../utilities/getAppDataDir.js");

const filePath = path.join(getAppDataDir(), "settings.json");

exports.getShowAlbumArt = function () {
	return JSON.parse(fs.readFileSync(filePath, "utf8")).showAlbumArt;
};

exports.saveShowAlbumArt = function (showAlbumArt) {
	const settings = JSON.parse(fs.readFileSync(filePath, "utf8"));
	settings.showAlbumArt = showAlbumArt;

	fs.writeFileSync(filePath, JSON.stringify(settings), err => {});
};

exports.getShowFooter = function () {
	return JSON.parse(fs.readFileSync(filePath, "utf8")).showFooter;
};

exports.saveShowFooter = function (showFooter) {
	const settings = JSON.parse(fs.readFileSync(filePath, "utf8"));
	settings.showFooter = showFooter;

	fs.writeFileSync(filePath, JSON.stringify(settings), err => {});
};

exports.getHexCodes = function () {
	const settings = JSON.parse(fs.readFileSync(filePath, "utf8"));
	return [
		settings.primaryColor,
		settings.secondaryColor,
		settings.confirmationColor,
		settings.declineColor,
		settings.focusColor,
		settings.textColor,
		settings.utilityColor
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

	const settings = JSON.parse(fs.readFileSync(filePath, "utf8"));
	settings[property] = val;

	fs.writeFileSync(filePath, JSON.stringify(settings), err => {});
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
