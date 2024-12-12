const { minify } = require("terser");
const fs = require("fs");
const crypto = require('crypto');

// terser config.js --compress --ecma 2015 --mangle --output config.min.js

const path = "config.js";
const output = "config.min.js";
const releaseNotes = "RELEASE-NOTES.md";
const releaseTemplate = "scripts/release-template.md";
const version = require("../package.json").version;
const code = fs.readFileSync(path, "utf8");
const minifyOptions = {
    compress: true,
    ecma: 2015,
    mangle: true,
    format: {
        comments: (node, comment) => {
            const { value, type } = comment;
            return type === "comment1" && isUserScriptComment(value);
        },
    }
};

/**
 * Check if the comment is a UserScript comment
 * @param {string} commentString The comment string
 * @returns {boolean} Whether the comment is a UserScript comment
 */
function isUserScriptComment(commentString) {
    const trimmed = commentString.trim();
    // Either in the format of `==UserScript==`, `==/UserScript==`, or starting with `@`
    const regex = /=+\s*\/?UserScript\s*=+/;
    return trimmed.startsWith("@") || regex.test(trimmed);
}

/**
 * Calculate the MD5 hash of a file
 * @param {string} path The path to the file
 * @returns {string} The MD5 hash
 */
async function md5(path) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("md5");
        const input = fs.createReadStream(path);
        input.on("error", reject);
        input.on("data", chunk => hash.update(chunk));
        input.on("end", () => resolve(hash.digest("hex")));
    });
}

/**
 * Create release notes
 */
async function createReleaseNotes() {
    const [hash1, hash2] = await Promise.all([md5(path), md5(output)]);
    const template = fs.readFileSync(releaseTemplate, "utf8");
    const notes = template
        .replaceAll("{{version}}", version)
        .replaceAll("{{hash1}}", hash1)
        .replaceAll("{{hash2}}", hash2);
    fs.writeFileSync(releaseNotes, notes);
}

async function main() {
    const minified = await minify(code, minifyOptions);
    fs.writeFileSync(output, minified.code);
    await createReleaseNotes();
}

main();
