const fs = require("fs");

const dirPath = "./data";
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
}

const dataPath = `${dirPath}/extensions.json`;
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, "[]", "utf-8");
}

const loadExtensions = () => {
    const extensions = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(extensions);
};

const saveExtensions = (extensions) => {
    fs.writeFileSync(dataPath, JSON.stringify(extensions, null, 4));
};

const addExtension = (extension) => {
    const extensions = loadExtensions();
    // let id = extensions.length + 1;
    // id = { id };
    // extension = { ...id, ...extension };
    extensions.push(extension);
    saveExtensions(extensions);
};

const checkDuplicate = (name) => {
    const extensions = loadExtensions();
    return extensions.find(
        (extension) => extension.name.toLowerCase() === name.toLowerCase()
    );
};

const deleteExtension = (name) => {
    const extensions = loadExtensions();
    const index = extensions.findIndex(
        (extension) => extension.name === decodeURI(name)
    );
    extensions.splice(index, 1);
    if (index != -1) {
        saveExtensions(extensions);
    }
    return index;
};

const findExtension = (name) => {
    const extensions = loadExtensions();
    return extensions.find((extension) => extension.name === decodeURI(name));
};

const updateExtension = (newExtension) => {
    const extensions = loadExtensions();
    const index = extensions.findIndex(
        (extension) => extension.name === newExtension.oldName
    );
    delete newExtension.oldName;
    extensions.splice(index, 1, newExtension);
    saveExtensions(extensions);
};

module.exports = {
    loadExtensions,
    addExtension,
    checkDuplicate,
    deleteExtension,
    findExtension,
    updateExtension,
};
