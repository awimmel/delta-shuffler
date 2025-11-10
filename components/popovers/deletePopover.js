const blessed = require('blessed')
const toolbarKeypress = require('../../utilities/toolbarKeypress.js')
const focusFunction = require('../../utilities/focusElement.js')

const variables = require('../../database/variables.json')
const primaryColor = variables.primaryColor

module.exports = function createDeletePopover(screen, algorithmsTable, algorithm) {

    const deleteBox = blessed.box({
        parent: screen,
        border: 'line',
        height: 5,
        width: 60,
        top: 'center',
        left: 'center',
        label: ` {bold}${algorithm.name}{/bold} `,
        tags: true,
        hidden: false
    })

    blessed.text({
        parent: deleteBox,
        content: `Delete ${algorithm.name}?`,
        top: 1,
        left: 2,
        width: '100%-4',
        height: 1
    })
    
    const noBox = blessed.box({
        parent: deleteBox,
        content: 'No',
        top: 2,
        left: 15,
        height: 3,
        width: 4,
        tags: true,
        align: 'center',
        valign: 'middle',
        border: 'line',
        keys: true,
        style: {
            fg: 'white',
            bg: 'default',
            border: {
                fg: primaryColor
            },
            focus: {
                fg: 'black',
                bg: primaryColor,
                border: {
                    fg: 'white'
                }
            }
        }
    })
    
    const yesBox = blessed.box({
        parent: deleteBox,
        content: 'Yes',
        top: 2,
        left: 35,
        height: 3,
        width: 5,
        tags: true,
        align: 'center',
        valign: 'middle',
        border: 'line',
        keys: true,
        style: {
            fg: 'white',
            bg: 'default',
            border: {
                fg: primaryColor
            },
            focus: {
                fg: 'black',
                bg: primaryColor,
                border: {
                    fg: 'white'
                }
            }
        }
    })    

    
    toolbarKeypress(noBox, () => {}, focusFunction(yesBox), () => {}, () => {}, () => {
        deleteBox.destroy()
        algorithmsTable.focus()
        screen.render()
    })
    toolbarKeypress(yesBox, focusFunction(noBox), () => {}, () => {}, () => {}, () => {
        deleteBox.destroy()
        algorithmsTable.focus()
        screen.render()
    })    

    noBox.focus()
    screen.render()

    return deleteBox
}