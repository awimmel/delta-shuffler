const blessed = require("blessed");
const variables = require("../database/variables.json");
const primaryColor = variables.primaryColor;

const createPlaylistToolbar = require("../components/playlistToolbar");
const createSongPopover = require("../components/popovers/songPopover");
const createAlgorithmPopover = require("../components/popovers/algorithmPopover");
const createAlgorithmsTable = require("../tables/algorithmsTable");
const createSongsTable = require("../tables/songsTable");

const setTableKeypress = require("../utilities/setTableKeypress");

module.exports = function createPlaylistDetailsView(parent, searchBar) {
	const playlistDetailsView = blessed.box({
		parent: parent,
		top: 8,
		left: 0,
		height: "100%-8",
		width: "100%",
		keys: true,
		style: {
			header: {
				fg: primaryColor,
				bold: true
			},
			cell: {
				bold: true,
				selected: {
					bg: primaryColor,
					// fg: '#D3D3D3',
					fg: "black",
					bold: true
				}
			}
		}
	});

	const algorithms = [["First"], ["Second"], ["Third"]];
	const algorithmsTable = createAlgorithmsTable(playlistDetailsView, []);
	algorithmsTable.hide();

	const songs = [
		["When I'm Sixty Four", "The Beatles", "Sgt. Pepper's Lonely Hearts Club Band"],
		["The Moment", "Tame Impala", "Currents"],
		["Wish You Were Here", "Pink Floyd", "Wish You Were Here"]
	];
	const songsTable = createSongsTable(playlistDetailsView, []);
	songsTable.hide();

	const playlistToolbar = createPlaylistToolbar(
		playlistDetailsView,
		searchBar,
		algorithmsTable,
		songsTable
	);
	const createAlgorithmButton = playlistToolbar.children[0];

	playlistToolbar.on("keypress", (char, key) => {
		if (key.name === "up") {
			searchBar.focus();
		} else if (key.name === "down") {
			if (!algorithmsTable.hidden) {
				algorithmsTable.focus();
			} else {
				songsTable.focus();
			}
		}
	});

	setTableKeypress(
		algorithmsTable,
		index => {
			const algorithm = {
				name: algorithmsTable.rows[index]
			};
			createAlgorithmPopover(parent, algorithmsTable, algorithm, searchBar);
			// logger.log(index)
			// logger.log(algorithmsTable.rows[index])
		},
		() => createAlgorithmButton.focus()
	);
	setTableKeypress(
		songsTable,
		index => {
			const song = {
				title: songsTable.rows[index][0],
				artist: songsTable.rows[index][1],
				album: songsTable.rows[index][2]
			};
			createSongPopover(parent, songsTable, song);
			// logger.log(index)
			// logger.log(songsTable.rows[index])
		},
		() => createAlgorithmButton.focus()
	);

	return playlistDetailsView;
};
