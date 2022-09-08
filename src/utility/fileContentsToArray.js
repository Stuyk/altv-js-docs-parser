
function contentsToArray(dataString) {
    return dataString.split('\r\n').map(content => content.replace(/\s+\s/, '')).filter(content => content.length >= 1);
}

module.exports = {
    contentsToArray
}