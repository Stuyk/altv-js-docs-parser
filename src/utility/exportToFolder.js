const fs = require('fs');
const path = require('path');
const { normalizePath } = require('./pathHelper');
const { normalizeFirstLetter } = require('./textUtilities');
const { frontMatterBuilder } = require('../parsers/frontMatterBuilder');

const removeUntilName = [
    'public',
    'private',
    'protected',
    'get',
    'set',
    'readonly',
    'static'
]

/**
 * Export values to folder.
 * @param { string } folder
 * @param {{ [key: string]: Array<any> }} values
 * @param { 'type' | 'enum' | 'interface' | 'function' | 'property' } type
 */
function exportToFolder(folder, values, type) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    if (typeof values === 'object' && Array.isArray(values)) {
        if (values.length <= 0) {
            return;
        }

        for (let i = 0; i < values.length; i++) {
            let fileName = '';
            if (values[i].includes('constructor')) {
                fileName = 'constructor'
            } else {
                const splitValues = values[i].split(' ');
                while (removeUntilName.includes(splitValues[0])) {
                    splitValues.shift();
                }

                if (splitValues.length <= 0) {
                    continue;
                }

                const potentialFileName = /.+?(?=(\(|<|:))/.exec(splitValues[0]);
                if (!potentialFileName || potentialFileName.length <= 0) {
                    continue;
                }

                fileName = potentialFileName[0]
            }

            const title = fileName;
            fileName = normalizeFirstLetter(fileName) + '.md';
            const document = frontMatterBuilder(title, values[i], type, folder)
            fs.writeFileSync(normalizePath(path.join(folder, fileName)), document);
        }
        return;
    }

    const keys = Object.keys(values);
    for (let i = 0; i < keys.length; i++) {
        let title = keys[i];
        let fileName = normalizeFirstLetter(keys[i]) + '.md';
        const document = frontMatterBuilder(title, values[title], type, folder)
        fs.writeFileSync(normalizePath(path.join(folder, fileName)), document);
    }
}


module.exports = {
    exportToFolder
}