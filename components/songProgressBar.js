const blessed = require("blessed");
const variables = require("../database/variables.json");
const primaryColor = variables.primaryColor;

class SongProgressBar {
	constructor(menu, screen) {
		this.menu = menu;
		this.screen = screen;
		this.progressBar = blessed.progressbar({
			parent: menu,
			top: 3,
			left: 0,
			width: "100%-15",
			height: 3,
			border: "line",
			style: {
				bar: {
					bg: primaryColor
				},
				border: {
					fg: "white"
				}
			},
			filled: 50,
			hidden: true
		});

		this.durationText = blessed.text({
			parent: menu,
			content: "",
			top: 4,
			left: "100%-15",
			width: 13,
			height: 1,
			hidden: true
		});

		this.currPos = 0;
		this.duration = 0;
		this.autoUpdate = null;
	}

	setProgress(currPos, duration) {
		clearAutoUpdate(this.autoUpdate);

		if (this.progressBar.hidden) {
			this.progressBar.hidden = false;
		}
		if (this.durationText.hidden) {
			this.durationText.hidden = false;
		}
		this.currPos = currPos;
		this.duration = duration;
		calcAndUpdateProgress(this.currPos, this.duration, this.progressBar);
		parseAndSetTime(currPos, duration, this.durationText);
		this.screen.render();

		this.autoUpdate = setInterval(() => {
			const prevPos = currPos;
			this.currPos += 1000;
			if (this.currPos > this.duration) {
				this.currPos = prevPos;
				this.currPos += this.duration - this.currPos;
			}
			calcAndUpdateProgress(this.currPos, this.duration, this.progressBar);
			parseAndSetTime(this.currPos, this.duration, this.durationText);
			this.screen.render();
		}, 1000);
	}

	pause() {
		clearAutoUpdate(this.autoUpdate);
	}

	hide() {
		this.currPos = 0;
		this.duration = 0;
		this.progressBar.filled = 0;
		this.progressBar.hidden = true;
		this.durationText.hidden = true;
		clearAutoUpdate(this.autoUpdate);
	}
}

function clearAutoUpdate(autoUpdate) {
	if (autoUpdate) {
		clearInterval(autoUpdate);
	}
}

function calcAndUpdateProgress(currPos, duration, progressBar) {
	const progress = (currPos / duration) * 100;
	progressBar.filled = progress;
}

function parseAndSetTime(progTime, durationTime, durationText) {
	const timeStr = `${parseTime(progTime)} / ${parseTime(durationTime)}`;
	durationText.setContent(timeStr);
}

function parseTime(msTime) {
	const mins = Math.floor(msTime / 60000);
	const minStr = (mins > 99 ? 99 : mins).toString().padStart(2, "0");
	const secStr = Math.floor((msTime % 60000) / 1000)
		.toString()
		.padStart(2, "0");
	return `${minStr}:${secStr}`;
}

module.exports = SongProgressBar;
