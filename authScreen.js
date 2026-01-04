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
			top: "50%-20",
			left: "50%-25",
			width: "50%",
			height: 15
		});
		
		this.authText = blessed.text({
			parent: this.screen,
			content:
				"After creating your app on Spotify's Developer dashboard, enter your Client Id and Client Secret here. " +
				"You will be routed to a Spotify authorization page where you will be asked to grant a few permissions. " +
				"Granting will take you to a local web page, after which you can restart the app and begin shuffling. " +
				"If you hit any errors, the local page will describe the resolution.",
			top: "50%-6",
			left: "25%",
			width: "50%",
			height: 5
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
			redirect_uri: "http://127.0.0.1:3438/spotifyLogin",
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
