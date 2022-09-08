/**
 * It takes a string, and returns a string with the first letter lowercase.
 * @param string - The string to be normalized.
 * @returns The first letter of the string is being returned in lowercase, and the rest of the string
 * is being returned in its original case.
 */
function normalizeFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

/**
 * It takes a string, capitalizes the first letter, and returns the new string.
 * @param string - The string to capitalize.
 * @returns The first letter of the string is being capitalized and the rest of the string is being
 * returned.
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
    normalizeFirstLetter,
    capitalizeFirstLetter,
};
