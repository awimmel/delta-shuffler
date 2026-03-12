const os = require("os");
const path = require("path");

module.exports = function getAppDataDir() {
	return path.join(process.env.APPDATA || path.join(os.homedir(), ".config"), "delta-shuffler");
};
