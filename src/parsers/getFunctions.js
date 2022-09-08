const { argsExtractor } = require("../utility/argsExtractor");

/**
 * 
 *
 * @export
 * @param {Array<string>} contents
 * @returns { { contents: Array<string>, values: { [key: string ]: Array<string> } } }
 */
async function getFunctions(contents) {
    /** @type { { [key: string ]: Array<string> } } */
    const functions = {};
    let linesToRemove = [];
    let functionName;
    for (let i = 0; i < contents.length; i++) {
        if (!contents[i].includes('function')) {
            continue;
        }

        if (!contents[i].includes(':')) {
            continue;
        }

        let splitLines = contents[i].split(' ')
        if (splitLines.includes('export')) {
            functionName = /.+?(?=(\(|<|:))/.exec(splitLines[2])[0]
        } else {
            functionName = /.+?(?=(\(|<|:))/.exec(splitLines[1])[0]
        }

        linesToRemove.push(i);

        // console.log(contents[i]);
        const args = argsExtractor(contents[i]);
        console.log(args);

        functions[functionName] = contents[i].replace('export ', '');
    }

    for (let i = contents.length - 1; i >= 0; i--) {
        if (!linesToRemove.includes(i)) {
            continue;
        }

        contents.splice(i, 1);
    }

    return { contents, values: functions };
}

module.exports = {
    getFunctions
}