module.exports = function joinOperator(join) {
	switch (join) {
		case "AND":
			return " && ";
		case "OR":
			return " || ";
	}
};
