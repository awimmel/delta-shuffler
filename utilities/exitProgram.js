module.exports = function exitProgram() {
	process.stdout.write("\x1Bc");
	process.exit(0);
};
