const createTable = require("./table.js");
const algorithmHelper = require("../backend/algorithmHelper.js");

const columns = ["NAME", "CONDITION", "SONG COUNT"];

class AlgorithmsTable {
	constructor(parent) {
		this.parent = parent;
		this.algorithms = [];
		this.playlistId = "";
		this.table = createTable(parent, 3, columns, [], []);
		this.hidden = false;
	}

	setData(playlistId) {
		this.playlistId = playlistId;
		this.algorithms = algorithmHelper.readAlgorithms(playlistId);
		this.table.setData([columns, ...algorithmHelper.displayAlgorithms(this.algorithms)]);
	}

	filterData(query) {
		const filteredAlgorithms = this.algorithms.filter(item =>
			item.name.toLowerCase().includes(query)
		);
		this.table.setData([columns, ...algorithmHelper.displayAlgorithms(filteredAlgorithms)]);
	}

	addAlgorithm(newAlg) {
		this.algorithms = [...this.algorithms, newAlg];
		this.table.setData([columns, ...algorithmHelper.displayAlgorithms(this.algorithms)]);
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
