// Modify the version number at `config.js` file:
// `return "0.3.5";`
// to the new version number.
// And then `git add config.js`.

const fs = require("fs");
const { exec } = require("child_process");
const package = require("../package.json");
const path = "config.js";

const version = package.version;
const data = fs.readFileSync(path, "utf8");
const result = replace(data, version);
fs.writeFileSync(path, result, "utf8");
console.log(`Updated version to ${version}`);

console.log(`Adding ${path} to git...`);
exec(`git add ${path}`, (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
});

function replace(code, version) {
    // Replace: `@version      1.2.0` & `return "1.2.0";`
    return code.replace(/@version(\s+)\d+\.\d+\.\d+/, `@version$1${version}`)
        .replace(/return "\d+\.\d+\.\d+";/, `return "${version}";`);
}
