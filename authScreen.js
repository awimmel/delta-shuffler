const blessed = require("blessed");
const crypto = require("crypto");
const querystring = require("querystring");
const variables = require("./database/variables.json");
const primaryColor = variables.primaryColor;

const focusFunction = require("./utilities/focusElement.js");
const focusText = require("./utilities/focusText.js");
const toolbarKeypress = require("./utilities/toolbarKeypress.js");

const authHelper = require("./backend/authHelper.js");

class AuthScreen {
	constructor(screen) {
		this.screen = screen;

		this.clientIdBox = blessed.textbox({
			parent: this.screen,
			label: " Client Id:",
			top: "50%",
			left: "25%",
			height: 3,
			width: "50%",
			content: "",
			border: "line",
			keys: true,
			style: {
				fg: "white",
				focus: {
					border: {
						fg: "white"
					}
				},
				border: {
					fg: primaryColor
				}
			}
		});
		focusText(this.clientIdBox);

		this.clientSecretBox = blessed.textbox({
			parent: this.screen,
			label: " Client Secret:",
			top: "50%+3",
			left: "25%",
			height: 3,
			width: "50%",
			content: "",
			border: "line",
			keys: true,
			style: {
				fg: "white",
				focus: {
					border: {
						fg: "white"
					}
				},
				border: {
					fg: primaryColor
				}
			}
		});

		this.exitBox = blessed.box({
			parent: this.screen,
			content: "Exit",
			top: "50%+6",
			left: "25%",
			height: 3,
			width: "25%",
			tags: true,
			align: "center",
			valign: "middle",
			border: "line",
			keys: true,
			style: {
				fg: "white",
				bg: "default",
				border: {
					fg: "red"
				},
				focus: {
					bg: "red",
					border: {
						fg: "white"
					}
				}
			}
		});

		this.authBox = blessed.box({
			parent: this.screen,
			content: "Authenticate",
			top: "50%+6",
			left: "50%",
			height: 3,
			width: "25%",
			tags: true,
			align: "center",
			valign: "middle",
			border: "line",
			keys: true,
			style: {
				fg: "white",
				bg: "default",
				border: {
					fg: "blue"
				},
				focus: {
					bg: "blue",
					border: {
						fg: "white"
					}
				}
			}
		});

		toolbarKeypress(
			this.clientIdBox,
			() => {},
			() => {},
			() => {},
			() => {
				focusText(this.clientSecretBox);
			},
			() => {}
		);
		toolbarKeypress(
			this.clientSecretBox,
			() => {},
			() => {},
			() => {
				focusText(this.clientIdBox);
			},
			focusFunction(this.exitBox),
			() => {}
		);
		toolbarKeypress(
			this.exitBox,
			() => {},
			focusFunction(this.authBox),
			() => {
				focusText(this.clientSecretBox);
			},
			() => {},
			() => process.exit(0)
		);
		toolbarKeypress(
			this.authBox,
			focusFunction(this.exitBox),
			() => {},
			() => {
				focusText(this.clientSecretBox);
			},
			() => {},
			() => {
				const clientId = this.clientIdBox.getValue();
				const clientSecret = this.clientSecretBox.getValue();
				if (clientId !== "" && clientSecret !== "") {
					beginAuth(clientId, clientSecret);
				}
			}
		);

		this.screen.render();
	}
}

async function beginAuth(clientId, clientSecret) {
	authHelper.setClientId(clientId);
	authHelper.setClientSecret(clientSecret);

	const state = crypto.randomBytes(32).toString("base64url");
	authHelper.setState(state);
	setTimeout(() => {
		authHelper.setState(null);
	}, 30000);

	const reqString =
		"https://accounts.spotify.com/authorize?" +
		querystring.stringify({
			response_type: "code",
			client_id: clientId,
			redirect_uri: "http://127.0.0.1:3438/spotifyLoginResp",
			state: state,
			scope:
				"user-modify-playback-state user-read-currently-playing " +
				"user-read-recently-played playlist-read-collaborative " +
				"playlist-read-private",
			show_dialog: true
		});

	//eventually fix import here to follow better practice
	const open = (await import("open")).default;
	await open(reqString);
}

module.exports = AuthScreen;
