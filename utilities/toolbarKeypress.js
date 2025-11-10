module.exports = function toolbarKeypress(el, leftFunction, rightFunction, upFunction, downFunction, enterCallback) {
    el.removeAllListeners('keypress')
    el.on('keypress', (char, key) => {
        if (key.name === 'enter') {
            enterCallback()
        } else if (key.name === 'left') {
            leftFunction()
        } else if (key.name === 'right') {
            rightFunction()
        } else if (key.name === 'up') {
            upFunction()
        } else if (key.name === 'down') {
            downFunction()
        }
    })
}