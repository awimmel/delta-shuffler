const blessed = require('blessed')
const variables = require('../database/variables.json')
const primaryColor = variables.primaryColor

module.exports = function createTable(parent, top, headers, displayItems, rawItems) {
    this.rawData = rawItems

    return blessed.listtable({
        parent: parent,
        top: top,
        left: 0,
        height: `100%-${top}`,
        width: '100%',
        border: 'line',
        keys: true,
        align: 'left',
        data: [
            headers,
            ...displayItems
        ],
        style: {
            header: {
                fg: primaryColor,
                bold: true
            },
            cell: {
                bold: true,
                selected: {
                    bg: primaryColor,
                    fg: 'black',
                    bold: true
                }
            },
            border: {
                fg: primaryColor
            },
            focus: {
                border: {
                    fg: 'white'
                }
            }
        }
    })
}