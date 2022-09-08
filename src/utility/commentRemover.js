const readline = require('readline');

const commentLines = [
    '///',
    '// ',
    '/**',
    '/*',
    '*/',
    '* ',
    '*',
    '\r\n'
]

/**
 * Removes all comments from a file reader.
 *
 * @export
 * @param {Array<string>} contents
 */
async function removeComments(contents) {
    for (let i = contents.length - 1; i >= 0; i--) {
        const line = contents[i];
        for (const commentLine of commentLines) {
            if (line.includes(commentLine)) {
                contents.splice(i, 1);
                break;
            }
        }
    }

    return contents;
}

module.exports = {
    removeComments
}