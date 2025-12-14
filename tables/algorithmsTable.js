const createTable = require("./table.js");

module.exports = function createAlgorithmsTable(parent, algorithms) {
	return createTable(parent, 3, ["NAME"], algorithms, []);
};
