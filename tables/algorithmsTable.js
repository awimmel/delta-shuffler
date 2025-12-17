const createTable = require("./table.js");
const algorithmHelper = require("../backend/algorithmHelper.js");

const columns = ["NAME", "CONDITION", "SONG COUNT"];

class AlgorithmsTable {
	constructor(parent, algorithms) {
		this.parent = parent;
		this.algorithms = algorithms;
		this.table = createTable(parent, 3, columns, algorithms, []);
		this.hidden = false;
	}

	setData(algorithms) {
		this.algorithms = algorithms;
		this.table.setData([columns, ...algorithmHelper.displayAlgorithms(algorithms)]);
	}

	filterData(query) {
		const filteredAlgorithms = this.algorithms.filter(item =>
			item.name.toLowerCase().includes(query)
		);
		this.table.setData([columns, ...algorithmHelper.displayAlgorithms(filteredAlgorithms)]);
	}

	hide() {
		this.table.hide();
		this.hidden = true;
	}

	focus() {
		this.table.focus();
	}

	show() {
		this.table.show();
		this.hidden = false;
	}
}

module.exports = AlgorithmsTable;
