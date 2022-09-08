/**
 * 
 * @param {*} fullFunctionLine
 * @return { Array<{ key: string, value: string }> } 
 */
function argsExtractor(fullFunctionLine) {
    const args = /(?<=\()(.*)(?=\))/gm.exec(fullFunctionLine);
    if (!args || args.length <= 0) {
        return [];
    }

    if (args[0] === '') {
        return [];
    }

    let argsReversed = [];
    const arguments = args[0]

    let startPos = arguments.length;
    let isFindingComma = false;
    let isGoingThroughCallback = false;
    for (let i = arguments.length - 1; i >= 0; i--) {
        const letter = arguments[i];
        if (i === 0) {
            const extract = arguments.slice(0, startPos);
            argsReversed.push(extract);
            continue;
        }

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

        ;
        if (letter === ':' && !isFindingComma) {
            isFindingComma = true;
            continue;
        }

        if (!isFindingComma) {
            continue;
        }

        if (letter !== ',') {
            continue;
        }

        const extract = arguments.slice(i, startPos);
        startPos = i;
        argsReversed.push(extract.replace(', ', ''));
        isFindingComma = false;
    }

    return argsReversed.reverse().map(argument => {
        const split = argument.split(':');
        const key = split[0];
        let value = split[1];
        if (split.length > 2) {
            split.shift();
            split.shift();
            value += ':' + split.join(':');
        }

        value = value.replace(' ', '');
        value = value.replace(/</gm, '\\<')
        value = value.replace(/>/gm, '\\>')
        value = value.replace(/\}/gm, '\\}')
        value = value.replace(/\{/gm, '\\{')

        return { key, value };
    })
}

module.exports = {
    argsExtractor
}