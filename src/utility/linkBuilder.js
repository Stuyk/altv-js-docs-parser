const glob = require('glob');
const path = require('path');
const { normalizePath } = require('./pathHelper');
const { normalizeFirstLetter } = require('./textUtilities');

// This can probably be way more programattic but I can't be arsed to do that.
const typesToIgnore = [
    'string',
    'boolean',
    'number',
    'void',
    'bigint',
    'unknown',
    'any',
    '{}',
    'object',
    'Promise<string>',
    'Promise<number>',
    'Promise<any>',
    'Promise<void>',
    'ReadonlyArray<string>',
    'ReadonlyArray<number>',
    'Record<string,string>',
    'Record<number,number>',
    'Record<string,number>',
    'Record<string,any>',
    'Record<any,string>',
    'Record<number,any>',
    'Record<any,number>',
    'Record<number,string>',
    '[number,number]',
    '[number,number,number]',
    '[string,string]',
    'string[]',
    'number[]',
    'object[]',
    '{}[]',
    'number|string',
    'Array<number>',
    'Array<boolean>',
    'Array<string>',
    'Array<any>',
    'Array<object>'
]

/**
 * Attempts to find a matching 'link' for a return type.
 * 
 * This function is pretty bad, don't expect it to be perfect.
 *
 * @export
 * @param {string} returnType
 * @returns {string | undefined}
 */
function getLinkForType(returnType, folderPath) {
    let cleanReturn = returnType.replace(/\\/gm, '');
    cleanReturn = cleanReturn.replace(/\s/g, '');

    // Skip Callbacks
    if (cleanReturn.includes('=>')) {
        return undefined;
    }

    if (cleanReturn.charAt(0) !== '(' && cleanReturn.charAt(cleanReturn.length - 1) === ')') {
        cleanReturn = cleanReturn.slice(0, cleanReturn.length - 1)
    }

    if (cleanReturn.charAt(0) !== '[' && cleanReturn.charAt(cleanReturn.length - 1) === ']') {
        // string[]
        if (cleanReturn.charAt(cleanReturn.length - 2) !== '[' && cleanReturn.charAt(cleanReturn.length - 1) !== ']') {
            cleanReturn = cleanReturn.slice(0, cleanReturn.length - 1)
        }
    }

    if (cleanReturn.charAt(0) !== '{' && cleanReturn.charAt(cleanReturn.length - 1) === '}') {
        cleanReturn = cleanReturn.slice(0, cleanReturn.length - 1)
    }

    if (cleanReturn.includes('.')) {
        const split = returnType.split('.');
        cleanReturn = split[split.length - 1];
    }

    if ((cleanReturn.charAt(0) !== '[' && cleanReturn.charAt(cleanReturn.length - 2) !== '[') && cleanReturn.charAt(cleanReturn.length - 1) === ']') {
        cleanReturn = cleanReturn.slice(0, cleanReturn.length - 1)
    }

    if (typesToIgnore.includes(cleanReturn)) {
        return undefined;
    }

    if (cleanReturn.includes('`')) {
        return undefined;
    }

    cleanReturn = cleanReturn.replace('|undefined', '').replace(' | undefined', '')
    cleanReturn = cleanReturn.replace('|null', '').replace(' | null', '');
    if (cleanReturn.length <= 1) {
        return undefined;
    }

    cleanReturn = cleanReturn.replace('typeof', '');
    if (cleanReturn.charAt(0) !== '(' && cleanReturn.charAt(cleanReturn.length - 1) === ')') {
        cleanReturn = cleanReturn.slice(0, cleanReturn.length - 1)
    }

    cleanReturn = cleanReturn.replace(/\[.*\]/gm, '');
    cleanReturn = cleanReturn.replace('|number', '');
    cleanReturn = cleanReturn.replace('|string', '');
    cleanReturn = cleanReturn.replace('|any', '');
    cleanReturn = cleanReturn.replace('\\>', '');

    // Start Pathway Extractions...
    // Generics...
    if (cleanReturn.includes('<') && cleanReturn.includes('>')) {
        const result = /(?<=<).*(?=>)/gm.exec(cleanReturn);
        if (!result || !result[0]) {
            return undefined;
        }

        cleanReturn = result[0];
    }

    // Just extract the one. I'm lazy.
    const types = cleanReturn.split(/\|/gm).filter(x => !typesToIgnore.includes(x));
    if (types.length >= 2) {
        cleanReturn = types[0];
    } else {
        cleanReturn = types[0];
    }

    const lowerCaseFileName = normalizeFirstLetter(cleanReturn);
    const files = glob.sync(normalizePath(path.join('dist', `**/${lowerCaseFileName}.*`)));
    if (files.length <= 0) {
        return undefined;
    }

    let linkToFolder;
    if (files.length >= 2) {
        const potentialFolder = folderPath.replace(normalizePath(path.join(process.cwd(), 'dist')), '');
        const folderMatches = potentialFolder.split('/').filter(x => x !== '');

        for (let match of folderMatches) {
            if (linkToFolder) {
                break;
            }

            for (let file of files) {
                if (file.includes(match)) {
                    linkToFolder = file;
                    break;
                }
            }
        }
    } else {
        linkToFolder = files[0];
    }

    return linkToFolder ? linkToFolder.replace('dist', '') : linkToFolder;
}

module.exports = {
    getLinkForType
}