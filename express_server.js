const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { generateRandomString, fetchUserId, passwordMatch } = require('./helpers/userHelpers');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "random-password"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "another-random-password"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = req.cookies.user_id;
  const userObject = users[user];
  const templateVars = {
    urls: urlDatabase,
    userObject
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = req.cookies.user_id;
  const userObject = users[user];
  const templateVars = { userObject };
  if (!userObject) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const emailInput = req.body.email;
  const passwordInput = req.body.password;
  if (fetchUserId(users, emailInput)) {
    if (passwordMatch(users, emailInput, passwordInput)) {
      const userCookie = fetchUserId(users, emailInput);
      res.cookie('user_id', userCookie);
      res.redirect('/urls');
    } else {
      res.status(403).send('Incorrect Password');
    }
  } else {
    res.status(403).send("Please register for an account");
  }
});

app.get("/login", (req, res) => {
  const user = req.cookies.user_id;
  const userObject = users[user];
  const templateVars = { userObject };
  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  const emailInput = req.body.email;
  if (emailInput === "" || req.body.password === "") {
    return res.status(400).send('Pleaser enter a valid email/password');
  } else if (fetchUserId(users, emailInput)) {
    return res.status(400).send('Email already registered');
  } else {
    const newUserId = generateRandomString();
    users[`${newUserId}`] = {
      id: newUserId,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', newUserId);
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const user = req.cookies.user_id;
  const userObject = users[user];
  const templateVars = { userObject };
  res.render("registration_page", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = req.cookies.user_id;
  const userObject = users[user];
  const templateVars = {
    userObject,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


