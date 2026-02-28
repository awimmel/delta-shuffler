const blessed = require("blessed");
const toolbarKeypress = require("../../utilities/toolbarKeypress.js");
const focusFunction = require("../../utilities/focusElement.js");
const escapeKeypress = require("../../utilities/escapeKeypress.js");
const playlistHelper = require("../../backend/playlistHelper.js");
const refreshHelper = require("../../backend/refreshHelper.js");
const settingsHelper = require("../../backend/settingsHelper.js");
const setListKeypresses = require("../../utilities/setListKeypresses.js");

module.exports = async function createRefreshPopover(mainScreen, elOnExit, showCancel) {
	const screen = mainScreen.screen;
	const refreshPopover = blessed.box({
		parent: screen,
		border: "line",
		height: "60%",
		width: 60,
		top: "center",
		left: "center",
		label: ` {bold}Refresh?{/bold} `,
		tags: true,
		hidden: false,
		style: {
			fg: settingsHelper.getText(),
			border: {
				fg: settingsHelper.getFocus()
			}
		}
	});

	const playlists = await refreshHelper.getPlaylists();
	const downloadedPlaylistIds = playlistHelper.readPlaylists().map(playlist => playlist.id);
	const hiddenIndexes = new Set(
		playlists
			.map((playlist, index) => (!downloadedPlaylistIds.includes(playlist.id) ? index : -1))
			.filter(index => index !== -1)
	);
	const playlistList = blessed.list({
		parent: refreshPopover,
		label: " Refresh Playlists: ",
		top: 1,
		left: 1,
		width: `100%-4`,
		height: "100%-4",
		items: playlists.map((playlist, index) =>
			!hiddenIndexes.has(index) ? `[x] ${playlist.name}` : `[ ] ${playlist.name}`
		),
		keys: true,
		border: "line",
		style: {
			selected: {
				bg: settingsHelper.getPrimary(),
				fg: settingsHelper.getSecondary(),
				bold: true
			},
			border: {
				fg: settingsHelper.getPrimary()
			},
			focus: {
				border: {
					fg: settingsHelper.getFocus()
				}
			}
		}
	});

	const refreshBox = blessed.box({
		parent: refreshPopover,
		content: "Refresh",
		bottom: -2,
		left: showCancel ? 35 : "center",
		height: 3,
		width: 9,
		tags: true,
		align: "center",
		valign: "middle",
		border: "line",
		keys: true,
		style: {
			fg: settingsHelper.getText(),
			border: {
				fg: settingsHelper.getConfirmation()
			},
			focus: {
				bg: settingsHelper.getConfirmation(),
				border: {
					fg: settingsHelper.getFocus()
				}
			}
		}
	});

	let cancelBox;
	if (showCancel) {
		cancelBox = blessed.box({
			parent: refreshPopover,
			content: "Cancel",
			bottom: -2,
			left: 15,
			height: 3,
			width: 8,
			tags: true,
			align: "center",
			valign: "middle",
			border: "line",
			keys: true,
			style: {
				fg: settingsHelper.getText(),
				border: {
					fg: settingsHelper.getDecline()
				},
				focus: {
					bg: settingsHelper.getDecline(),
					border: {
						fg: settingsHelper.getFocus()
					}
				}
			}
		});
		toolbarKeypress(
			cancelBox,
			() => {},
			focusFunction(refreshBox),
			focusFunction(playlistList),
			() => {},
			() => {
				mainScreen.setFocus(true);
				refreshPopover.destroy();
				elOnExit.focus();
				mainScreen.screen.render();
			}
		);
	}

	toolbarKeypress(
		refreshBox,
		showCancel ? focusFunction(cancelBox) : () => {},
		() => {},
		focusFunction(playlistList),
		() => {},
		() => {
			const playlistsToDownload = playlists.filter((playlist, index) => !hiddenIndexes.has(index));
			refreshHelper.refresh(mainScreen, playlistsToDownload);
			mainScreen.createWaitingPopover();

			refreshPopover.destroy();
			elOnExit.focus();
			mainScreen.screen.render();
		}
	);

	setListKeypresses(
		screen,
		playlistList,
		playlists,
		hiddenIndexes,
		null,
		showCancel ? cancelBox : refreshBox
	);

	escapeKeypress([playlistList, refreshBox], showCancel ? cancelBox : refreshBox);

	playlistList.focus();
	mainScreen.setFocus(false);
	mainScreen.screen.render();

	return refreshPopover;
};
