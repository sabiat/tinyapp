const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { generateRandomString, fetchUserId, passwordMatch, urlsForUser } = require('./helpers/userHelpers');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
  })
);
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID"}
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
  const isLoggedIn = req.session['user_id'] ? res.redirect("/urls") : res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = req.session['user_id'];
  const userObject = users[user];
  const urls = urlsForUser(urlDatabase, user); // filtered list of URLs to display
  const templateVars = {
    urls,
    userObject
  };
  if (userObject) {
    res.render('urls_index', templateVars);
  } else {
    res.status(403).render("403", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const user = req.session['user_id'];
  const userObject = users[user];
  const templateVars = { userObject };
  if (!userObject) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const emailInput = req.body.email;
  const passwordInput = req.body.password;
  const user = fetchUserId(users, emailInput);
  if (user) {
    if (passwordMatch(users, emailInput, passwordInput)) {
      req.session.user_id = user.id;
      res.redirect('/urls');
    } else {
      res.status(403).send('Incorrect Password');
    }
  } else {
    res.status(403).send("Please register for an account");
  }
});

app.get("/login", (req, res) => {
  const user = req.session['user_id'];
  const userObject = users[user];
  const templateVars = { userObject };
  if (user) {
    res.redirect("/urls")
  } else {
    res.render("login", templateVars);
  }
});

app.post("/register", (req, res) => {
  const emailInput = req.body.email;
  const passwordInput = req.body.password;
  if (emailInput === "" || passwordInput === "") {
    return res.status(400).send('Please enter a valid email/password');
  } else if (fetchUserId(users, emailInput)) {
    return res.status(400).send('Email already registered');
  } else {
    const newUserId = generateRandomString();
    users[`${newUserId}`] = {
      id: newUserId,
      email: emailInput,
      password: bcrypt.hashSync(passwordInput, 10)
    };
    req.session.user_id = newUserId; 
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const user = req.session['user_id'];
  const urlToShow = urlsForUser(urlDatabase, user);
  const shortURL = req.params.shortURL
  if (!user) {
    return res.status(403).send("Please log in to perform this action");
  }
  if (urlToShow[shortURL]) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    return res.status(403).send("Access denied");
  }
});

app.post("/urls", (req, res) => {
  const user = req.session['user_id'];
  if (user) {
    let newShortURL = generateRandomString();
    urlDatabase[newShortURL] = {
      longURL: req.body.longURL,
      userID: user
    };
    res.redirect(`/urls/${newShortURL}`);
  } else {
    res.status(403).send('Please log in to perform this action');
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const user = req.session['user_id'];
  const userObject = users[user];
  const urlAccess = urlsForUser(urlDatabase, user);
  if (userObject && urlAccess) {
    const urlToDelete = req.params.shortURL;
    delete urlDatabase[urlToDelete];
    res.redirect("/urls");
  } else if (userObject) {
    return res.status(403).send('Access denied');
  } else {
    res.status(403).send('Please login to perform this action');
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.sendStatus(404);
  }
});

app.get("/register", (req, res) => {
  const user = req.session['user_id'];
  const userObject = users[user];
  const templateVars = { userObject };
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("registration_page", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const user = req.session['user_id'];
  const userObject = users[user];
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) { //URL for given ID does not exist
    return res.sendStatus(404);
  }
  const longURL = urlDatabase[shortURL].longURL
  const templateVars = {
    userObject,
    shortURL,
    longURL
  };
  const urlToShow = urlsForUser(urlDatabase, user); //returns list of URLs current user can see
  if (!userObject) {
    return res.status(403).render("403", templateVars);
  }
  if (urlToShow[shortURL]) { // requested id is part of list users can see
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send('Access denied');
  } 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


