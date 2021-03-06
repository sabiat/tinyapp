const bcrypt = require('bcrypt');

const generateRandomString = function() {
  let result = '';
  let letters = 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
};

// function to look up if email already exists in database and return user object
const fetchUserId = function(userDatabase, email) {
  for (const user in userDatabase) {
    if (userDatabase[user]['email'] === email) {
      return userDatabase[user];
    }
  }
  return false;
};

const passwordMatch = function(userDatabase, email, password) {
  const user = fetchUserId(userDatabase, email);
  if (bcrypt.compareSync(password, user.password)) {
    return true;
  } else {
    return false;
  }
};

const urlsForUser = function(urlDatabase, id) {
  const urlsToDisplay = {
  };
  for (const url in urlDatabase) {
    const storedId = urlDatabase[url].userID;
    if (storedId === id) {
      urlsToDisplay[url] = urlDatabase[url];
    }
  }
  return urlsToDisplay;
};

module.exports = { generateRandomString, fetchUserId, passwordMatch, urlsForUser};