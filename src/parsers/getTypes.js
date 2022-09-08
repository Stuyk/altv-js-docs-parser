/**
 * 
 *
 * @export
 * @param {Array<string>} contents
 * @returns { { contents: Array<string>, values: { [key: string ]: Array<string> } } }
 */
async function getTypes(contents) {
    /** @type { { [key: string ]: Array<string> } } */
    const types = {};
    let linesToRemove = [];
    let typeName;
    for (let i = 0; i < contents.length; i++) {
        if (!contents[i].includes(' type ')) {
            continue;
        }

        if (!contents[i].includes('=')) {
            continue;
        }

        let splitLines = contents[i].split(' ')
        if (splitLines.includes('export')) {
            typeName = splitLines[2];
            splitLines.splice(0, 4);
        } else {
            typeName = splitLines[1];
            splitLines.splice(0, 4);
        }

        if (splitLines.includes('|')) {
            splitLines = splitLines.filter(x => x !== '|');
            splitLines[splitLines.length - 1] = splitLines[splitLines.length - 1].replace(/\;/gm, '');

            // Convert to Numbers
            if (!isNaN(parseFloat(splitLines[0]))) {
                splitLines = splitLines.map(num => {
                    return parseFloat(num);
                })
            }
        }

        linesToRemove.push(i);
        types[typeName] = splitLines;
    }

    for (let i = contents.length - 1; i >= 0; i--) {
        if (!linesToRemove.includes(i)) {
            continue;
        }

        contents.splice(i, 1);
    }

    return { contents, values: types };
}

module.exports = {
    getTypes
}