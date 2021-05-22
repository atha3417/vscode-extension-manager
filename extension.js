const { listExtensions, cloneExtensions } = require("./utils/cli");
const yargs = require("yargs");

yargs
    .command({
        command: "list",
        describe: "list all extensions",
        handler(argv) {
            listExtensions();
        },
    })
    .demandCommand();

yargs.command({
    command: "clone",
    describe: "clone extensions.json to custom path",
    builder: {
        path: {
            describe: "destination path",
            demandOption: true,
            type: "string",
        },
        filename: {
            describe: "file name",
            demandOption: false,
            type: "string",
        },
    },
    handler(argv) {
        cloneExtensions(argv.path, argv.filename || "extensions.json");
    },
});

yargs.parse();
