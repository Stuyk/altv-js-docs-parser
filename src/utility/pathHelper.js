function normalizePath(path) {
    return path.replace(/\\/gm, '/');
}

module.exports = {
    normalizePath
}