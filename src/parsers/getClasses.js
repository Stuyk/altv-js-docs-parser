/**
 * Gets all classes from a file line array.
 * 
 * Exports Like: `{ "Explosion": ['Big', 'Small'] }`
 *
 * @export
 * @param {Array<string>} contents
 * @returns { { contents: Array<string>, values: { [key: string ]: Array<string> } } }
 */
async function getClasses(contents) {
    /** @type { { [key: string ]: Array<string> } } */
    const classes = {};
    let linesToRemove = [];
    let isParsing = false;
    let className;

    for (let i = 0; i < contents.length; i++) {
        if (!isParsing) {
            if (!contents[i].includes('class')) {
                continue;
            }

            if (!contents[i].includes('{')) {
                continue;
            }

            if (contents[i].includes('{}')) {
                continue;
            }

            if (contents[i].includes('*')) {
                continue;
            }

            const splitLines = contents[i].split(' ')

            if (splitLines.includes('export')) {
                className = splitLines[2];
            } else {
                className = splitLines[1];
            }

            if (!classes[className]) {
                classes[className] = [];
            }

            linesToRemove.push(i);
            isParsing = true;
            continue;
        }

        if (contents[i].includes('}') && contents[i].length <= 2) {
            className = undefined;
            isParsing = false;
            linesToRemove.push(i);
            continue;
        }

        const cleanedLine = contents[i].replace(/\/\/.*/gm, '');
        if (cleanedLine.length <= 4 || cleanedLine === "") {
            linesToRemove.push(i);
            continue;
        }

        classes[className].push(cleanedLine);
        linesToRemove.push(i);
    }

    for (let i = contents.length - 1; i >= 0; i--) {
        if (!linesToRemove.includes(i)) {
            continue;
        }

        contents.splice(i, 1);
    }

    return { contents, values: classes };
}

module.exports = {
    getClasses
}