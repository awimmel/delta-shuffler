const createTable = require('./table.js')

module.exports = function createAlgorithmTable(parent, songs) {
    return createTable(parent, 3, ['NAME', 'ARTIST', 'ALBUM'], songs, [])
}