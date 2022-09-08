/**
 * Returns all properties in the root level of a module.
 *
 * @export
 * @param {Array<string>} contents
 * @returns { { contents: Array<string>, values: { [key: string ]: Array<string> } } }
 */
async function getProperties(contents) {
    /** @type { { [key: string ]: Array<string> } } */
    const properties = {};
    let linesToRemove = [];
    let propertyName;
    for (let i = 0; i < contents.length; i++) {
        if (!contents[i].includes('export const')) {
            continue;
        }

        if (!contents[i].includes(':')) {
            continue;
        }

        let splitLines = contents[i].split(' ')
        propertyName = splitLines[2].replace(':', '');
        linesToRemove.push(i);
        properties[propertyName] = contents[i];
    }

    for (let i = contents.length - 1; i >= 0; i--) {
        if (!linesToRemove.includes(i)) {
            continue;
        }

        contents.splice(i, 1);
    }

    return { contents, values: properties };
}

module.exports = {
    getProperties
}