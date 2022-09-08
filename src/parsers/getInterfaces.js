/**
 * Gets all interfaces from a file line array.
 * 
 * Exports Like: `{ "Explosion": ['Big', 'Small'] }`
 *
 * @export
 * @param {Array<string>} contents
 * @returns { { contents: Array<string>, values: { [key: string ]: Array<string> } } }
 */
async function getInterfaces(contents) {
    /** @type { { [key: string ]: Array<string> } } */
    const interfaces = {};
    let linesToRemove = [];
    let isParsing = false;
    let interfaceName;

    for (let i = 0; i < contents.length; i++) {
        if (!isParsing) {
            if (!contents[i].includes('interface')) {
                continue;
            }

            if (!contents[i].includes('{')) {
                continue;
            }

            if (contents[i].includes('{}')) {
                linesToRemove.push(i);
                continue;
            }

            const splitLines = contents[i].split(' ')
            interfaceName = splitLines[splitLines.length - 2];
            interfaces[interfaceName] = [];
            linesToRemove.push(i);
            isParsing = true;
            continue;
        }

        if (contents[i].includes('}')) {
            interfaceName = undefined;
            isParsing = false;
            linesToRemove.push(i);
            continue;
        }

        const cleanedLine = contents[i].replace(/\/\/.*/gm, '');
        interfaces[interfaceName].push(cleanedLine);
        linesToRemove.push(i);
    }

    for (let i = contents.length - 1; i >= 0; i--) {
        if (!linesToRemove.includes(i)) {
            continue;
        }

        contents.splice(i, 1);
    }

    return { contents, values: interfaces };
}

module.exports = {
    getInterfaces
}