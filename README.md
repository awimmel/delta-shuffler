# Delta Shuffler

#### A local, terminal-based Spotify wrapper

Delta Shuffler is a text-based user interface (TUI) that gives users greater control over their Spotify libraries. I'm constantly listening to music and I've found myself frustrated with Spotify's default algorithm. While the company has [claimed recent improvements](https://engineering.atspotify.com/2025/11/shuffle-making-random-feel-more-human), I still find myself unsatisfied with the product. Random shuffling tools are pretty common ([I](https://stevenaleong.com/tools/spotifyplaylistrandomizer) [found](https://trackify.am/tools/playlist-randomizer-spotify) [three](https://shuffle.virock.org) in about 10 seconds of searching), though, and Spotify [maintains](https://engineering.atspotify.com/2025/11/shuffle-making-random-feel-more-human#:~:text=Standard%20Shuffle%3A%20still%20pure%20randomness) that its Standard Shuffle is entirely random. A few features differentiate this tool from alternatives:
- Delta Shuffler is run locally and completely isolated to the user's machine. This keeps users in control of their API tokens without outsourcing them to any third-party servers
- Most alternatives only offer random shuffling, but this project expands on that functionality by allowing users to create custom algorithms and relational playlists
- Other services remove and add tracks to users' playlists when shuffling, modifying the playlist's original order. Delta Shuffler avoids this by queuing songs rather than modifying users' playlists

The overall goal of this project was to create Spotify functionality similar to [iTunes' Smart Playlists](https://support.apple.com/guide/itunes/create-delete-and-use-smart-playlists-itns3001/windows). Given their focus on AI, Spotify seems reluctant to grant users any greater control over their playlists and algorithms.

---

## User Guide

### Setup

To begin, you'll need to navigate to https://developer.spotify.com and sign in. From there, navigate to your Dashboard and create an app. Set the following information:

- App name/description: whatever works best for you. "Delta Shuffler" is recommended, but anything should work
- Redirect URIs: http://127.0.0.1:3438/spotifyLogin
  - This redirects Spotify's authorization response to your local application, preventing the need for any external servers
- API/SDKs: Web API

Once your app is created, boot up Delta Shuffler. Enter your Client ID and Client Secret and authenticate. Successful authentication should route you to a local web page, after which the app will begin downloading your playlists and Liked Songs.

![refresh screen](assets/refresh.png)

From here, you can view any playlist, its songs, and its default "Completely Random" algorithm. While Spotify maintains that it provides a completely random option, I figured it was worth adding for anyone distrusting of them.

Refresh the application whenever you make changes on Spotify that you would like to be reflected in Delta Shuffler. Refreshing can take a bit of time, so be careful to not do it too frequently.

### Queueing Songs

Users can queue songs directly via the Songs view. Navigate to the Show Songs button (or hit `s`), filter by whatever song you're looking for, and select it to see more information:

![queue song](assets/queueSong.png)

Note that you must be listening to a song on Spotify for this to work properly. A good rule to follow is that if you see a song title in the top left corner, you should be good to queue.

### Creating and Running Algorithms

Algorithms are at the heart of Delta Shuffler's functionality. With an algorithm, you can randomly shuffle any of a playlist's songs that meet user-defined conditions. Algorithms can filter on something simple, like a playlist's songs being on _Abbey Road_:

![Abbey Road algorithm](assets/abbeyRd.png)

Algorithms can also filter in more complex ways, like a playlist's songs that were performed by a few British groups or released in the 80s:

![British or 80s algorithm](assets/britishOr80s.png)

After creating an algorithm, you can randomly queue songs that match its criteria. Up to 50 matching songs can be added to your queue at once. Again, to queue a song, you must be already listening to any song on Spotify.

Values for Album, Artist, and Song must match their target **exactly**. For example, use "Stairway to Heaven - Remaster" and not "Stairway to Heaven". `IN`/`NOT IN` operators support multiple elements, but they must be separated by a `, `. Ideally a multi-select, searchable dropdown would be used here, but that proved to be too difficult to create in Blessed (the project's TUI library). The Added condition corresponds to how recently a song was added to your playlist. Values begin at 1 and lower values correspond to more recent songs, so a song with a value of 1 was your playlist's most recent addition.

### Dependent Playlists

If you really like an algorithm, you can create a dependent playlist from it. Select an algorithm and the "Create Playlist" option, give your playlist a name, and your new dependent playlist will be visible in your Spotify library. Dependent playlists are updated on Refresh both locally and in Spotify according to their source playlists.

As an example, you can use the "Added" condition to create a dependent playlist with your source's 30 most recently added songs. Songs will be added/removed as your source playlist changes, giving you a trimmed-down version of a longer playlist.

Note: If you're interested in a Spotify-native solution, Spotify's new [AI playlist feature](https://support.spotify.com/us/article/ai-playlist/) seems to work pretty well and can accomplish similar playlist filtering.  

### Keyboard shortcuts

A few keyboard shortcuts are available to highlight buttons and improve navigation throughout the app:

| Key | Destination |
| --- | --------- |
|  /  | Search |
|  ?  | Current table |
|  s  | Show Songs table (if viewing playlist)|
|  a  | Show Algorithms table (if viewing playlist)|
|  <  | Rewind |
|  ,  | Pause/Play |
|  >  | Skip |
|  .  | Queue |
|  '  | Reshuffle |
| esc | Close |

---
## Design Decisions

### Why a TUI?

A TUI best aligned with my goals for this project to be lightweight and entirely local. A local web application or an Electorn app both felt like overkill for the application's needs. Selfishly, I also wanted to learn more about TUIs through this project. Using programs like Vim and [k9s](https://github.com/derailed/k9s) made me more interested in these applications.

One downside of making a TUI is a limited audience; web-based and Electron applications are rightly popular for their greater reach with less savvy audiences. Given the nature of the application, however, I was willing to accept this downside. I figured that most users nerdy enough to want custom shuffling algorithms would be fine with running a program through their terminal :smile:.

### No local database?

I opted against running a local database to keep the application particularly lightweight. User data is stored in JSON files instead. Given a typical user's data volume and the low number of JOINs, this seemed to be the best option. To handle the M:N relationship between Songs and Playlists, I created the `playlistSongs.json` file, which stores `playlistId`, `songId`, `addedAt`, and `addedRank` attributes.

Still, I should optimize data read/write operations. Much of the current logic is undoubtedly inefficient, and I'm sure I can find more optimal routes to perform our database operations.

### No mouse support?

I opted against adding mouse support because I imagined it would interfere with the "retro vibe" I was looking to create. I'm aware this is a pretty weak argument, but I never imagined using a mouse to interact with the application :man_shrugging:.

I added keyboard shortcuts to make navigation easier. I recommend leveraging those if you find yourself frustrated with the application.

---

## Future improvements

While currently in a working state, there are many things I hope to improve about this application:

- Genre filtering
  - Genre filtering was previously supported, but was removed after being deprecated by Spotify's recent API changes. Running algorithms based on certain genres would be a helpful feature, and I hope to find a suitable method for retrieving genres soon. 
- Quicker refreshes
  - Refershing your local database can take a minute or two. While much of this is dependent on Spotify's API response times, there are surely opportunities to act more efficiently on our end.
- Code quality
  - Given the non-reactive nature of Blessed, I resorted to some bad practices to get everything working properly. I could really stand to implement a few design patterns to reduce coupling throughout the code base.
