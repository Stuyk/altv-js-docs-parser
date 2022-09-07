const readline = require('readline');
const path = require('path');
const fs = require('fs');

const filesToProcess = [
    { folder: 'server', path: path.join(process.cwd(), 'files', 'server.d.ts') },
    { folder: 'client', path: path.join(process.cwd(), 'files', 'client.d.ts') }
]

function normalizePath(path) {
    return path.replace(/\\/gm, '/');
}

function normalizeFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

async function processLineByLine(folder, filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const builder = {};
    let currentInterface;
    let lastComment;
    let commentParseMode = false;

    for await (const line of rl) {
        // Skip empty line spacing
        if (line.length <= 4) {
            continue;
        }

        // Skip enums, don't care about them
        if (line.includes('enum')) {
            continue;
        }

        // Append to root 'alt'
        if (line.includes('export function') || line.includes('export const')) {
            // console.log(`Valid Function to Capture for 'alt' - ${line}`);
            continue;
        }

        // Handle 'export'  pathway. Which means a potential class we want to capture.
        if (line.includes('export')) {
            // Empty class, or interface ignore it.
            if (line.includes(`{}`) || line.includes('interface') || !line.includes('{') || !line.includes('class')) {
                // console.log(`Ignored: ${line}`);
                continue;
            }

            if (line.includes('Player')) {
                console.log(`!!!! -> Found Player! ${line}`)
            }

            const words = line.replace(/\s+\s/, '').split(' ');
            currentInterface = words[2] === 'class' ? words[3] : words[2];
            builder[currentInterface] = [];
            continue;
        }

        if (!currentInterface) {
            continue;
        }

        if (line.includes('/*') || line.includes('/**') && line.includes('*/')) {
            const finalLine = line.replace(/\s+\s/, '').replace('/* ', '').replace('*/', '');
            if (finalLine.length >= 4) {
                lastComment = finalLine.replace('/** ', '');
                commentParseMode = false;
                continue;
            }
        }

        // Start of a comment... turn on comment parse mode for next line.
        if (line.includes('/**')) {
            commentParseMode = true;
            continue;
        }

        if (commentParseMode && line.includes('*')) {
            if (line.includes('*/')) {
                commentParseMode = false;
                continue;
            }

            lastComment = line.replace(/\s+\s/, '').replace('* ', '');
            commentParseMode = false;
            continue;
        }

        if (!commentParseMode && line.includes('*')) {
            continue;
        }

        if (currentInterface && !commentParseMode && line.includes('}')) {
            currentInterface = undefined;
            lastComment = undefined
            commentParseMode = false;
            continue;
        }

        if (line.includes('//')) {
            continue;
        }

        const cleanedLine = line.replace('public', '').replace(/\s+\s/, '');
        console.log(cleanedLine);

        // Handles Constructors
        if (cleanedLine.includes('constructor') && builder[currentInterface].length <= 0) {
            builder[currentInterface].push({
                usage: cleanedLine,
                fileName: 'index.md',
                title: 'General Usage',
                comment: lastComment
            });

            lastComment = undefined;
            continue;
        }

        // Handles Constructors
        if (cleanedLine.includes('constructor') && builder[currentInterface].length >= 1) {
            continue;
        }

        const cleanerLine = cleanedLine.replace('readonly ', '').replace('static ', '');
        const functionOrPropertyName = /.+?(?=(\(|<|:))/.exec(cleanerLine);

        if (!functionOrPropertyName || functionOrPropertyName.length <= 0) {
            console.warn(`Could not parse property or function...`);
            console.warn(cleanerLine);
            continue;
        }

        let isFunction = false;
        if (cleanerLine.includes('(') && cleanerLine.includes(')')) {
            isFunction = true;
        }

        builder[currentInterface].push({
            usage: cleanedLine,
            fileName: normalizePath(path.join('dist', folder, normalizeFirstLetter(currentInterface), `${functionOrPropertyName[0]}.md`)),
            title: isFunction ? functionOrPropertyName[0] + '()' : functionOrPropertyName[0],
            comment: lastComment
        });

        lastComment = undefined;
    }

    return builder;
}

/**
 * Write parsed type definitions to individual files with gray-matter
 * 
 * @param {*} folder
 * @param {{[key: string]: Array<{ usage: string, fileName: string, title: string, comment?: string }> }} data
 */
function writeFiles(data) {
    Object.keys(data).forEach((key) => {
        const files = data[key];
        for (const file of files) {
            let dataToWrite = '---\r\n';
            dataToWrite += `title: ${file.title}\r\n`;

            if (file.title.includes('General')) {
                dataToWrite += `order: -99\r\n`;
            } else {
                dataToWrite += `order: 0\r\n`;
            }

            dataToWrite += `---\r\n`;
            dataToWrite += `\r\n`;
            dataToWrite += `# {{ $frontmatter.title }}\r\n`
            dataToWrite += file.comment ? `\r\n${file.comment}\r\n` : `\r\nNo Description\r\n`;
            dataToWrite += `\r\n`;
            dataToWrite += `## Usage\r\n`
            dataToWrite += `\r\n`;
            dataToWrite += '```ts\r\n';
            dataToWrite += `${file.usage}\r\n`
            dataToWrite += '```\r\n'

            const folderPath = path.dirname(file.fileName)
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true })
            }

            fs.writeFileSync(file.fileName, dataToWrite);
        }
    });
}

async function start() {
    for (let i = 0; i < filesToProcess.length; i++) {
        const result = await processLineByLine(filesToProcess[i].folder, filesToProcess[i].path);
        await writeFiles(result);
    }
}

start();
