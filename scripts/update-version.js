// Modify the version number at `config.js` file:
// `return "0.3.5";`
// to the new version number.
// And then `git add config.js`.

const fs = require("fs");
const { exec } = require("child_process");
const package = require("../package.json");
const paths = ["config.js", "test_config.user.js"];
const version = package.version;

for (const path of paths) {
    replace(path, version);
}
console.log(`Updated version to ${version}`);
console.log(`Adding to git...`);
exec(`git add ${paths.join(" ")}`, (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
});

function replace(path, version) {
    const code = fs.readFileSync(path, "utf8");
    // Replace: `@version      1.2.0` & `return "1.2.0";`
    const replaced = code.replace(/@version(\s+)\d+\.\d+\.\d+/, `@version$1${version}`)
        .replace(/return "\d+\.\d+\.\d+";/, `return "${version}";`);
    fs.writeFileSync(path, replaced, "utf8");
}
