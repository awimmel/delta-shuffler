const createTable = require('./table.js')
const focusText = require('../utilities/focusText.js')
const setTableKeypress = require('../utilities/setTableKeypress')

const playlistHelper = require('../backend/playlistHelper.js');
const songHelper = require('../backend/songHelper.js');

class PlaylistTable {
    constructor(mainScreen, playlists, search, playlistDetailsView) {
        this.playlists = playlists
        this.playlistsToDisplay = playlistHelper.displayPlaylists(this.playlists)
        this.playlistTable = createTable(mainScreen, 11, ['PLAYLIST', 'SONG COUNT'], this.playlistsToDisplay, this.playlists)

        setTableKeypress(this.playlistTable, (index) => {
            search.setValue('')
            this.playlistTable.setData([
                ['PLAYLIST', 'SONG COUNT'],
                ...this.playlistsToDisplay
            ])

            const algorithmsTable = playlistDetailsView.children[0]
            algorithmsTable.setData([['NAME'], ['First'], ['Second'], ['Third']])
            algorithmsTable._rawData = [['First'], ['Second'], ['Third']]
            
            const songsTable = playlistDetailsView.children[1]
            const songs = songHelper.readSongs(this.playlists[index].id)
            songsTable.setData([
                ['SONG', 'ARTIST', 'ALBUM'],
                ...songHelper.displaySongs(songs)
            ])
            songsTable.rawData = songs
            
            this.playlistTable.hide()
            playlistDetailsView.show()
            algorithmsTable.show()
            algorithmsTable.focus()
        }, () => {
            focusText(search)
        })
    }

    setData(playlists) {
        this.playlists = playlists
        this.playlistsToDisplay = playlistHelper.displayPlaylists(this.playlists)
        this.playlistTable.setData([
            ['PLAYLIST', 'SONG COUNT'],
            ...this.playlistsToDisplay
        ])
    }

    focus() {
        this.playlistTable.focus()
    }

    show() {
        this.playlistTable.show()
    }
}

module.exports = PlaylistTable