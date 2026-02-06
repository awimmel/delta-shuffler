const blessed = require("blessed");
const themeHelper = require("../backend/themeHelper.js");

class SongProgressBar {
	constructor(menu, screen) {
		this.menu = menu;
		this.screen = screen;
		this.progressBar = blessed.box({
			parent: menu,
			top: 3,
			left: 14,
			width: "100%-29",
			height: 3,
			border: "line",
			hidden: true
		});

		this.interiorBars = Array.from(
			{ length: Math.floor(this.progressBar.width / 2) - 1 },
			(_, index) => {
				return blessed.box({
					parent: this.progressBar,
					top: 0,
					left: 2 * index,
					width: 1,
					height: 1,
					hidden: true
				});
			}
		);

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

		this.setColors();
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
		this.interiorBars = calcAndUpdateProgress(this.currPos, this.duration, this.interiorBars);
		parseAndSetTime(currPos, duration, this.durationText);
		this.screen.render();

		this.setAutoUpdate();
	}

	pause() {
		clearAutoUpdate(this.autoUpdate);
	}

	pauseWithOverride(currPos, duration) {
		this.setProgress(currPos, duration);
		clearAutoUpdate(this.autoUpdate);
	}

	setAutoUpdate() {
		this.autoUpdate = setInterval(() => {
			const prevPos = this.currPos;
			this.currPos += 1000;
			if (this.currPos > this.duration) {
				this.currPos = prevPos;
				this.currPos += this.duration - this.currPos;
			}
			this.interiorBars = calcAndUpdateProgress(this.currPos, this.duration, this.interiorBars);
			parseAndSetTime(this.currPos, this.duration, this.durationText);
			this.screen.render();
		}, 1000);
	}

	hide() {
		this.currPos = 0;
		this.duration = 0;
		this.progressBar.filled = 0;
		this.progressBar.hidden = true;
		this.durationText.hidden = true;
		clearAutoUpdate(this.autoUpdate);
	}

	setColors() {
		this.progressBar.style = {
			bar: {
				bg: themeHelper.getPrimary()
			},
			border: {
				fg: themeHelper.getFocus()
			}
		};

		for (const interiorBar of this.interiorBars) {
			interiorBar.style = {
				bg: themeHelper.getPrimary()
			};
		}

		this.durationText.style = {
			fg: themeHelper.getText()
		};

		this.screen.render();
	}
}

function clearAutoUpdate(autoUpdate) {
	if (autoUpdate) {
		clearInterval(autoUpdate);
	}
}

function calcAndUpdateProgress(currPos, duration, interiorBars) {
	const percent = currPos / duration;
	const expectedBars = Math.round(percent * interiorBars.length);
	return interiorBars.map((bar, index) => {
		if (index < expectedBars) {
			bar.hidden = false;
		} else {
			bar.hidden = true;
		}
		return bar;
	});
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
