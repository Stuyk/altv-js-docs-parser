/**
 * Gets all const enums from a file line array.
 * 
 * Exports Like: `{ "Explosion": ['Big', 'Small'] }`
 *
 * @export
 * @param {Array<string>} contents
 * @returns { { contents: Array<string>, values: { [key: string ]: Array<string> } } }
 */
async function getEnums(contents) {
    /** @type { { [key: string ]: Array<string> } } */
    const enums = {};
    let linesToRemove = [];
    let isParsing = false;
    let enumName;

    for (let i = 0; i < contents.length; i++) {
        if (!isParsing) {
            if (!contents[i].includes('const enum') && !contents[i].includes('enum')) {
                continue;
            }

            if (!contents[i].includes('{')) {
                continue;
            }

            const splitLines = contents[i].split(' ')
            enumName = splitLines[splitLines.length - 2];
            enums[enumName] = [];
            linesToRemove.push(i);
            isParsing = true;
            continue;
        }

        if (contents[i].includes('}')) {
            enumName = undefined;
            isParsing = false;
            linesToRemove.push(i);
            continue;
        }

        const cleanedLine = contents[i].replace(',', '').replace(/\/\/.*/gm, '');
        enums[enumName].push(cleanedLine);
        linesToRemove.push(i);
    }

    for (let i = contents.length - 1; i >= 0; i--) {
        if (!linesToRemove.includes(i)) {
            continue;
        }

        contents.splice(i, 1);
    }

    return { contents, values: enums };
}

module.exports = {
    getEnums
}