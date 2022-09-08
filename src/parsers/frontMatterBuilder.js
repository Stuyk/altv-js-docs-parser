const { normalizeFirstLetter } = require("../utility/textUtilities");
const { argsExtractor } = require('../utility/argsExtractor');

function append(value) {
    return `${value}\r\n`;
}


/**
 * A Front Matter Markdown Builder
 *
 * @param {string} title
 * @param {any} contentValue
 * @param { 'type' | 'enum' | 'interface' | 'function' } type
 */
function frontMatterBuilder(title, contentValue, type) {
    let documentText = append('---');
    documentText += append(`title: ${title}`);
    documentText += append(`order: 0`);
    documentText += append(`---`);
    documentText += append('');
    documentText += append('# {{ $frontmatter.title }}');
    documentText += append('');

    if (type === 'enum') {
        documentText += append('## Enum Definition');
        documentText += append('');
        documentText += append('```ts');
        documentText += append(`enum ${title} {`)
        for (let i = 0; i < contentValue.length; i++) {
            documentText += append(`    ${contentValue[i]},`);
        }
        documentText += append('};')
        documentText += append('```');
    }

    if (type === 'type') {
        documentText += append('## Type Definition');
        documentText += append('');
        documentText += append('```ts');

        if (typeof contentValue === 'object' && Array.isArray(contentValue)) {
            for (let i = 0; i < contentValue.length; i++) {
                if (i === 0) {
                    documentText += append(`type ${title} = ${contentValue[i]} |`);
                    continue;
                }

                if (i === contentValue.length - 1) {
                    documentText += append(`    ${contentValue[i]};`);
                    continue;
                }

                documentText += append(`    ${contentValue[i]} |`);
            }
        } else if (typeof contentValue === 'object' && !Array.isArray(contentValue)) {
            documentText += append(`type ${title} = ${JSON.stringify(contentValue)}`);
        } else {
            documentText += append(`type ${title} = ${contentValue}`);
        }

        documentText += append('```');
    }

    if (type === 'interface') {
        documentText += append('## Interface Definition');
        documentText += append('');
        documentText += append('```ts');
        documentText += append(`interface ${title} {`);
        for (let i = 0; i < contentValue.length; i++) {
            documentText += append(`    ${contentValue[i]}`);
        }
        documentText += append(`};`);
        documentText += append('```');
    }

    if (type === 'function') {
        documentText += append('## Function Definition');
        documentText += append('');
        documentText += append('```ts');
        documentText += append(contentValue);
        documentText += append('```');

        const args = argsExtractor(contentValue);
        if (args.length >= 1) {
            documentText += append('');
            documentText += append('### Arguments');
            documentText += append('');
            for (let arg of args) {
                documentText += append(`* ${arg.key}: ${arg.value}`);
            }
        }
    }

    documentText += append('');
    documentText += append('## Documentation');
    documentText += append('');
    documentText += append(`<!--@include: ./parts/${normalizeFirstLetter(title)}.md-->`)
    return documentText;
}

module.exports = {
    frontMatterBuilder
}