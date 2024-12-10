const { minify } = require("terser");
const fs = require("fs");

// terser config.js --compress --ecma 2015 --mangle --output config.min.js

const path = "config.js";
const output = "config.min.js";
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

function isUserScriptComment(commentString) {
    const trimmed = commentString.trim();
    // Either in the format of `==UserScript==`, `==/UserScript==`, or starting with `@`
    const regex = /=+\s*\/?UserScript\s*=+/;
    return trimmed.startsWith("@") || regex.test(trimmed);
}

minify(code, minifyOptions).then(minified => {
    fs.writeFileSync(output, minified.code);
}).catch(error => {
    console.error(error);
});
