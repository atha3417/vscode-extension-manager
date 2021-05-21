const express = require("express");
const {
    loadExtensions,
    addExtension,
    checkDuplicate,
    deleteExtension,
    findExtension,
    updateExtension,
} = require("./utils/codeext");
const expressLayouts = require("express-ejs-layouts");
const { body, validationResult, check } = require("express-validator");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const algoliaSearch = require("algoliasearch");
const axios = require("axios");
const client = algoliaSearch("4BQRY8MQ2Q", "7b2b6941425069abf4581289ca31b99f");
const index = client.initIndex("extensions");
require("dotenv").config();
const app = express();
const port = process.env.PORT;
const baseUrl = "https://vscode-ext-manager.herokuapp.com";

// Config
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.set("layout", "layouts/main-layout");
app.use(methodOverride("_method"));
// Flash config
app.use(cookieParser("secret"));
app.use(
    session({
        cookie: { maxAge: 6000 },
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);
app.use(flash());

app.get("/", (req, res) => {
    const extensions = loadExtensions();
    res.render("index", {
        title: "VSCode manage extensions in JSON",
        message: req.flash("message"),
        baseUrl: "https://vscode-ext-manager.herokuapp.com",
        extensions,
    });
});

app.get("/add", (req, res) => {
    res.render("add", {
        title: "Add VSCode extension to JSON",
        extension: {
            name: "",
            author: "",
        },
    });
});

app.post(
    "/",
    [
        body("name").custom((value) => {
            const duplicate = checkDuplicate(value);
            if (value) {
                if (duplicate) {
                    throw new Error("Extension name already used!");
                }
                return true;
            } else {
                throw new Error("Name field is required!");
            }
        }),
        body("author").custom((value) => {
            if (!value) {
                throw new Error("Author field is required!");
            }
            return true;
        }),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render("add", {
                title: "Add VSCode extension to JSON",
                errors: errors.array(),
                extension: req.body,
            });
        } else {
            index
                .saveObject(req.body, {
                    autoGenerateObjectIDIfNotExist: true,
                })
                .then(() => {
                    addExtension(req.body);
                })
                .catch((err) => console.log(err));
            req.flash("message", "Extension successfully added!");
            res.redirect("/");
        }
    }
);

app.delete("/:name", (req, res) => {
    const extension = findExtension(req.params.name);
    if (!extension) {
        req.flash("message", "Extension not found!");
        res.redirect("/");
    } else {
        axios
            .get(`${baseUrl}/search/${req.params.name}`)
            .then((response) => {
                index
                    .deleteObject(response.data[0].objectID)
                    .then((taskID) => {
                        deleteExtension(req.params.name);
                        req.flash("message", "Extension successfully deleted!");
                        res.redirect("/");
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            })
            .catch((error) => console.log(error));
    }
});

app.get("/edit/:name", (req, res) => {
    const extension = findExtension(req.params.name);
    res.render("edit", {
        title: "Edit VSCode extension in JSON",
        extension,
    });
});

app.put(
    "/",
    [
        body("name").custom((value, { req }) => {
            const duplicate = checkDuplicate(value);
            if (value) {
                if (value !== req.body.oldName && duplicate) {
                    throw new Error("Extension name already used!");
                }
                return true;
            } else {
                throw new Error("Name field is required!");
            }
        }),
        body("author").custom((value) => {
            if (!value) {
                throw new Error("Author field is required!");
            }
            return true;
        }),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render("edit", {
                title: "Edit VSCode extension in JSON",
                errors: errors.array(),
                extension: req.body,
            });
        } else {
            const oldName = req.body.oldName;
            axios
                .get(`${baseUrl}/search`)
                .then((response) => {
                    response.data.forEach((data) => {
                        delete data.objectID;
                    });
                    const extensionIndex = response.data.findIndex(
                        (data) => data.name === req.body.oldName
                    );
                    delete req.body.oldName;
                    response.data.splice(extensionIndex, 1, req.body);

                    index
                        .clearObjects()
                        .then((taskID) => {
                            index
                                .saveObjects(response.data, {
                                    autoGenerateObjectIDIfNotExist: true,
                                })
                                .then((taskID) => {
                                    req.body.oldName = oldName;
                                    updateExtension(req.body);
                                    req.flash(
                                        "message",
                                        "Extension successfully updated!"
                                    );
                                    res.redirect("/");
                                })
                                .catch((error) => console.log(error));
                        })
                        .catch((err) => console.log(err));
                })
                .catch((error) => console.log(error));
        }
    }
);

app.get("/search/:q?", (req, res) => {
    const query = req.params.q ? req.params.q : "";
    index.search(query).then((result) => {
        const extensions = loadExtensions();
        let searchResult = [];
        result.hits.forEach((data) => {
            searchResult.push({
                objectID: data.objectID,
                name: data.name,
                author: data.author,
            });
        });
        res.json(searchResult !== [] ? searchResult : extensions);
    });
});

// Server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
