const blessed = require("blessed");
const crypto = require("crypto");
const opener = require("opener");
const querystring = require("querystring");

const settings = require("../database/settings.example.json");
const primaryColor = settings.primaryColor;

const MainScreen = require("./mainScreen.js");

const escapeKeypress = require("../utilities/escapeKeypress.js");
const exitProgram = require("../utilities/exitProgram.js");
const focusFunction = require("../utilities/focusElement.js");
const focusText = require("../utilities/focusText.js");
const toolbarKeypress = require("../utilities/toolbarKeypress.js");

const authHelper = require("../backend/authHelper.js");

class AuthScreen {
	constructor(screen, server) {
		this.screen = screen;
		this.server = server;

		this.title = blessed.text({
			parent: this.screen,
			content: `
        /\\  
       /  \\                                    |\\
      /    \\       ⎺⎺⎺⎻-⎽_          _⎽-⎻⎺⎺⎺⎺⎺⎺⎺  \\
     /      \\            ⎺⎺⎻-⎽__⎽-⎻⎺⎺            /
    /        \\     ⎺⎺⎺⎻-⎽_     ⎺⎺⎻-⎽__⎽-⎻⎺⎺⎺⎺⎺⎺|/
   /          \\    ___⎽-⎻⎺⎺⎺⎻-⎽_      ⎺⎺⎻-⎽____|\\
  /            \\         _⎽-⎻⎺⎺⎺⎻-⎽_             \\
 /              \\  ___⎽-⎻⎺⎺          ⎺⎺⎻-⎽______ /
/________________\\                             |/ 
`,
			top: "50%-22",
			left: "50%-25",
			width: "50%",
			height: 15
		});

		this.authText = blessed.text({
			parent: this.screen,
			content:
				"After creating your app on Spotify's Developer dashboard, enter your " +
				"Client Id and Client Secret here. You will be routed to a Spotify " +
				"authorization page where you will be asked to grant a few permissions.\n\n" +
				"Granting will take you to a local web page, from which you should " +
				"return to the app to begin downloading.",
			top: "50%-7",
			left: "25%",
			width: "50%",
			height: 7
		});

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
			() => exitProgram()
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
					beginAuth(clientId, clientSecret, this);
				}
			}
		);

		escapeKeypress([this.clientIdBox, this.clientSecretBox, this.authBox], this.exitBox);

		this.screen.render();
	}

	destroy() {
		this.title.destroy();
		this.authText.destroy();
		this.clientIdBox.destroy();
		this.clientSecretBox.destroy();
		this.authBox.destroy();
		this.exitBox.destroy();
		this.server.close();

		new MainScreen(this.screen);
	}
}

async function beginAuth(clientId, clientSecret, authScreen) {
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
			redirect_uri: "http://127.0.0.1:3438/spotifyLogin",
			state: state,
			scope:
				"user-modify-playback-state user-read-currently-playing " +
				"user-read-recently-played playlist-read-collaborative " +
				"playlist-read-private user-read-playback-state " +
				"user-library-read playlist-modify-public playlist-modify-private " +
				"user-read-private user-read-email user-top-read",
			show_dialog: true
		});

	opener(reqString);

	pollForResp(authScreen);
}

async function pollForResp(authScreen) {
	if (authHelper.getRefreshToken()) {
		authScreen.destroy();
		return;
	}

	setTimeout(() => pollForResp(authScreen), 750);
}

module.exports = AuthScreen;
