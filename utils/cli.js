const fs = require("fs");
const chalk = require("chalk");

const dirPath = "./data";
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
}

const dataPath = `${dirPath}/extensions.json`;
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, "[]");
}

const listExtensions = () => {
    const extensions = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    const header1 = chalk.red.bold.bgWhiteBright("Extension Name");
    const header2 = chalk.red.bold.bgWhiteBright("Author");
    let view = `
            +----------------------------------------------------+----------------------------------------------------+
            | ${header1}                                     | ${header2}                                             |
            +----------------------------------------------------+----------------------------------------------------+`;

    extensions.forEach((extension) => {
        let name = extension.name;
        let author = extension.author;

        nameSpaces = 50 - name.length;
        authorSpaces = 50 - author.length;

        for (let i = 0; i <= nameSpaces; i++) {
            name += ` `;
        }
        name += "|";

        for (let i = 0; i <= authorSpaces; i++) {
            author += ` `;
        }
        author += "|";

        view += `
            | ${name} ${author}
            +----------------------------------------------------+----------------------------------------------------+`;
    });
    console.log(view);
};

const cloneExtensions = (path, filename) => {
    let regex = /\/$/i;
    path = path.replace(regex, "");

    regex = /.json$/i;
    filename = filename.match(regex) ? filename : filename + ".json";

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }

    fs.copyFileSync(dataPath, `${path}/${filename}`);
    console.log(`Cloned to ${path}/${filename}`);
};

module.exports = {
    listExtensions,
    cloneExtensions,
};
