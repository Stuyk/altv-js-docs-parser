/**
 * Extracts the return type from the function.
 * 
 * @param {*} fullFunctionLine
 * @return {string | undefined}
 */
function returnExtractor(fullFunctionLine) {
    if (fullFunctionLine.includes('constructor')) {
        return 'self';
    }

    if (fullFunctionLine.includes(');')) {
        return 'void';
    }

    let startPos = fullFunctionLine.length;
    let isGoingThroughCallback = false;
    for (let i = fullFunctionLine.length - 1; i >= 0; i--) {
        const letter = fullFunctionLine[i];
        if (isGoingThroughCallback) {
            if (letter !== '(' && letter !== '<') {
                continue;
            }

            isGoingThroughCallback = false;
            continue;
        }

        if (letter === '>') {
            isGoingThroughCallback = true;
            continue;
        }

        if (letter !== ':') {
            continue;
        }

        let value = fullFunctionLine.slice(i + 1, startPos);
        value = value.replace(' ', '');
        value = value.replace(/</gm, '\\<');
        value = value.replace(/>/gm, '\\>');
        value = value.replace(/\}/gm, '\\}');
        value = value.replace(/\{/gm, '\\{');
        value = value.replace(/\;/gm, '');
        return value;
    }

    return undefined;
}

module.exports = {
    returnExtractor
}