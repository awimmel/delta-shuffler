const createTable = require("./table.js");
const algorithmHelper = require("../backend/algorithmHelper.js");

const columns = ["NAME", "CONDITION", "SONG COUNT"];

class AlgorithmsTable {
	constructor(parent) {
		this.parent = parent;
		this.width = this.parent.width;
		this.algorithms = [];
		this.filteredAlgorithms = this.algorithms;
		this.algorithmCount = 0;
		this.playlistId = "";
		this.table = createTable(parent, 3, columns, [], []);
		this.hidden = false;
	}

	setData(playlistId) {
		this.playlistId = playlistId;
		this.algorithms = algorithmHelper.readAlgorithms(playlistId);
		this.filteredAlgorithms = this.algorithms;
		this.algorithmCount = this.algorithms.length;
		this.table.setData([columns, ...algorithmHelper.displayAlgorithms(this.algorithms, this.width)]);
	}

	getDataCount() {
		return this.algorithmCount;
	}

	filterData(query) {
		this.filteredAlgorithms = this.algorithms.filter(item =>
			item.name.toLowerCase().includes(query)
		);
		this.algorithmCount = this.filteredAlgorithms.length;
		this.table.setData([columns, ...algorithmHelper.displayAlgorithms(this.filteredAlgorithms, this.width)]);
	}

	addAlgorithm(newAlg) {
		this.algorithms = [...this.algorithms, newAlg];
		this.filteredAlgorithms = this.algorithms;
		this.table.setData([columns, ...algorithmHelper.displayAlgorithms(this.algorithms, this.width)]);
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
