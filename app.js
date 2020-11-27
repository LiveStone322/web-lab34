const express = require("express");
const parser = require("body-parser")
const cookie = require("cookie-parser");
const sqlite = require("sqlite3").verbose();
const crypto = require("crypto");
const hbs = require("hbs");
const cookieParser = require("cookie-parser");
const { resolve } = require("path");

const app = express();

const PORT = 3000;

function hash(string) {
    return crypto.createHash('sha256').update(string).digest('hex');
}
function randomString() {
    return crypto.randomBytes(20).toString('hex');
}

let db = new sqlite.Database('db/toDo.sqlite', (err) => {
    if (err) console.log(err);
    else console.log('connected to db');
});

app.use(parser.json());
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");
hbs.registerHelper('isEqual', function (var1, var2) {
    return var1 == var2;
});
app.use(express.static(__dirname + "/public"));
app.use(cookie('web_lab3'));
 
app.get("/login", (req, res) => {
    res.render("login", {
        title: "Войти",
        login: true,
        css: ["styles_login.css", "styles_form.css"],
        js: ["js_login.js", "js_form.js"]
    });
});

app.post("/login", (req, res) => {
    const login = req.body.login;
    const pass = req.body.password;
    new Promise((resolve, reject) => {
        db.get(`SELECT salt FROM users WHERE login=?`, [login], (err, row) => {
            if (err || !row) {
                console.log(err);
                reject()
            }
            else {
                resolve(row.salt);
            }
        });
    }).then((salt) => {
            db.get(`SELECT pass FROM users WHERE login=?`, [login], (err, row) => {
                if (err || !row) {
                    res.json({success: false});
                }
                else {
                    if (row.pass == hash(pass + salt)) {
                        const sql = `UPDATE users
                                        SET token = ?
                                        WHERE login = ?`;
                        const token = randomString();                            
                        db.run(sql, [token, login], (err) => {
                            if (err || !row) {
                                console.log(err);
                                res.json({success: false});
                            }
                            else {
                                res.cookie('token', token, { 
                                    maxAge: 900000, 
                                    signed: 'web_lab3' 
                                });
                                res.json({success: true, token: randomString});
                            }
                        });                        
                    }
                    else res.json({success: false});
                }
            })
        })
      .catch(() => {
          res.json({success: false});
      });
});

app.get("/reg", (req, res) => {
    res.render("reg", {
        title: "Регистрация",
        registration: true,
        css: ["styles_reg.css", "styles_form.css"],
        js: ["js_reg.js", "js_form.js"]
    });
});

app.post("/addtodo", async (req, res) => {
    const title = req.body.title;
    const text = req.body.text;
    const c = req.signedCookies.token;
    const id = await (new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE token=?', [c], (err, row) => {
            if (err) {
                console.log(err);
                reject();
            }
            else {
                resolve(row.id);
            }
        })
    }));
    const sql = `INSERT INTO todo(title, text, user_id) VALUES(?, ?, ?)`
    db.run(sql, [title, text, id], err => {
        if (err) {
            console.log(err);
            res.json({success: false});
        }
        else {
            res.json({success: true});
        }
    });
});


app.post("/do", (req, res) => {
    const id = req.body.id;
    const sql = `UPDATE todo SET status=1 WHERE id=?`
    db.run(sql, [id], err => {
        if (err) {
            console.log(err);
            res.json({success: false});
        }
        else {
            res.json({success: true});
        }
    });
});

app.post("/addcomment", (req, res) => {

    const todo = req.body.todo;
    const comment = req.body.comment;
    const sql = `INSERT INTO comments(comment, todoId) VALUES(?, ?)`
    db.run(sql, [todo, comment], err => {
        if (err) {
            console.log(err);
            res.json({success: false});
        }
        else {
            res.json({success: true});
        }
    });
});

app.post("/reg", (req, res) => {
    const login = req.body.login;
    const pass = req.body.password;
    const salt = randomString();
    const sql = `INSERT INTO users(login, pass, salt) VALUES(?, ?, ?)`
    db.run(sql, [login, hash(pass + salt), salt], err => {
        if (err) {
            console.log(err);
            res.json({success: false});
        }
        else {
            res.json({success: true});
        }
    });
});

app.get("/users", (req, res) => {
    const login = new URLSearchParams(req.query).get('login');
    const sql = `SELECT count() as count FROM users WHERE login = ?`
    db.get(sql, [login], (err, row) => {
        if (err) res.sendStatus(500);
        else if (row) res.json({exists: !!row.count > 0});
        else res.sendStatus(500);
    })
});

app.use("/home", async (req, res) => {
    const c = req.signedCookies.token;
    let authed = false;
    let id = -1
    let todo = [];
    let comments = {};
    if (c) {
        id = await (new Promise((resolve, reject) => {
                db.get(`SELECT id FROM users WHERE token=?`, [c], (err, row) => {
                if (err || !row) {
                    res.json({success: false});
                    reject(-1);
                }
                else {
                    authed = true;
                    resolve(row.id);
                }
            });
        }));
    }
    if (id !== -1) {
        todo = await (new Promise((resolve, reject) => {
            db.all(`SELECT id, title, text, status FROM todo WHERE user_id=?`, [id], (err, rows) => {
                if (err || !rows) {
                    console.log(err);
                    reject([err]);
                }
                else {
                    resolve(rows);
                }
            })
        }))
        console.log(todo);
        todo.forEach(async (td) => {
            comments[td.id] = await (new Promise((resolve, reject) => {
                db.all(`SELECT comment FROM comments WHERE todoId=?`, [td.id], (err, rows) => {
                    if (err || !rows) {
                        console.log(err);
                        reject([err]);
                    }
                    else {
                        resolve(rows);
                    }
                })
            }))
        });
    }
    console.log(comments);
    res.render("home", {
        title: "Главная",
        home: true,
        css: ["styles_home.css", "styles.css"],
        js: ["js_home.js"],
        todo: [todo],
        authed,
    });
});

app.use("/signout", (req, res) => {
    res.clearCookie('token');
    res.redirect("/home");
})

app.use("/", (req, res) => {
    res.redirect("/home");
});

app.listen(PORT || 3000);
console.log(`listening on port ${PORT}`);