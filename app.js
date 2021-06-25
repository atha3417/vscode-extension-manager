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
const axios = require("axios");
require("dotenv").config();
const app = express();
const port = 3000;
const baseUrl = "http://localhost:3000";

// Config
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.set("layout", "layouts/main-layout");
app.use(methodOverride("_method"));
// Flash config
app.use(cookieParser("secret"));
app.use(
    session({
        cookie: {
            maxAge: 6000,
        },
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);
app.use(flash());

app.get("/", (req, res) => {
    axios
        .get(`${baseUrl}/search`)
        .then((response) => {
            const extensions = response.data;
            res.render("index", {
                title: "VSCode manage extensions in JSON",
                message: req.flash("message"),
                baseUrl,
                extensions,
            });
        })
        .catch((error) => console.log(error));
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
            addExtension(req.body);
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
        deleteExtension(req.params.name);
        req.flash("message", "Extension successfully deleted!");
        res.redirect("/");
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

                    req.body.oldName = oldName;
                    updateExtension(req.body);
                    req.flash("message", "Extension successfully updated!");
                    res.redirect("/");
                })
                .catch((error) => console.log(error));
        }
    }
);

app.get("/search/:q?", (req, res) => {
    const extensions = loadExtensions();
    const extension = findExtension(req.params.q);
    res.json(extension !== undefined ? extension : extensions);
});

// Server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
