const readline = require('readline');
const path = require('path');
const fs = require('fs');
const { removeComments } = require('./utility/commentRemover');
const { contentsToArray } = require('./utility/fileContentsToArray');
const { getEnums } = require('./parsers/getEnums');
const { getTypes } = require('./parsers/getTypes');
const { exportToFolder } = require('./utility/exportToFolder');
const { normalizePath } = require('./utility/pathHelper');
const { getInterfaces } = require('./parsers/getInterfaces');
const { getClasses } = require('./parsers/getClasses');
const { normalizeFirstLetter } = require('./utility/textUtilities');
const { getFunctions } = require('./parsers/getFunctions');
const { getProperties } = require('./parsers/getProperties');

const filesToProcess = [
    { folder: 'server', path: path.join(process.cwd(), 'files', 'server.d.ts') },
    { folder: 'client', path: path.join(process.cwd(), 'files', 'client.d.ts') },
    { folder: 'shared', path: path.join(process.cwd(), 'files', 'shared.d.ts') },
];

async function processLineByLine(folder, filePath) {
    const distPath = normalizePath(path.join(process.cwd(), 'dist'));
    const content = fs.readFileSync(filePath).toString();
    const contentArray = contentsToArray(content);
    let contents = await removeComments(contentArray);

    // Strips out enums, and returns modified contents without enums for next parse.
    const enums = await getEnums(contents);
    contents = enums.contents;
    exportToFolder(normalizePath(path.join(distPath, 'enums')), enums.values, 'enum');
    console.log(`Enums -> ${Object.keys(enums.values).length}`);

    // Strip out types, and returns modified contents without types for next parse.
    const types = await getTypes(contents);
    contents = types.contents;
    exportToFolder(normalizePath(path.join(distPath, 'types')), types.values, 'type');
    console.log(`Types -> ${Object.keys(types.values).length}`);

    // Strip out types, and returns modified contents without types for next parse.
    const interfaces = await getInterfaces(contents);
    contents = interfaces.contents;
    exportToFolder(normalizePath(path.join(distPath, 'interfaces')), interfaces.values, 'interface');
    console.log(`Interfaces -> ${Object.keys(interfaces.values).length}`);

    // Strip out classes, and return modified contents without classes for next parse
    // Classes -> Have to be parsed individually by sections.
    const classes = await getClasses(contents);
    contents = classes.contents;
    Object.keys(classes.values).forEach(key => {
        const folderKey = normalizeFirstLetter(key);
        exportToFolder(normalizePath(path.join(distPath, folder, folderKey)), classes.values[key], 'function');
    });

    const functions = await getFunctions(contents);
    contents = functions.contents;
    exportToFolder(normalizePath(path.join(distPath, folder)), functions.values, 'function');
    console.log(`Functions -> ${Object.keys(functions.values).length}`);

    const properties = await getProperties(contents);
    contents = properties.contents;
    exportToFolder(normalizePath(path.join(distPath, folder)), properties.values, 'property');
    console.log(`Properties -> ${Object.keys(properties.values).length}`);
}

async function start() {
    for (let i = 0; i < filesToProcess.length; i++) {
        console.log(`Processing Folder: ${filesToProcess[i].folder}`);
        await processLineByLine(filesToProcess[i].folder, filesToProcess[i].path);
    }
}

start();
