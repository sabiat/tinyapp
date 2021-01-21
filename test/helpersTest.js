const { assert } = require('chai');

const bcrypt = require('bcrypt');

const { fetchUserId, passwordMatch, urlsForUser } = require('../helpers/userHelpers');


const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },

  "hashedUser": {
    id: "randomID",
    email: "abc@test.com",
    password: bcrypt.hashSync('testing', 10)
  }
};

const testUrlDatabase = {
  "4ry7M6": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "0Mnik3": { longURL: "http://www.google.com", userID: "user2RandomID"}
};

describe('fetchUserId', function() {
  it('should return a user with valid email', function() {
    const userId = fetchUserId(testUsers, "user@example.com");
    const expectedOutput = testUsers["userRandomID"];
    assert.equal(userId, expectedOutput);
  });

  it('should return false if given email not in database', function() {
    const userId = fetchUserId(testUsers, "test@test.com");
    assert.isFalse(userId);
  });
});

describe('passwordMatch', function() {
  it('should return true for matching password', function() {
    const result = passwordMatch(testUsers, 'abc@test.com', 'testing');
    assert.isTrue(result);
  });

  it('should return false for incorrect password', function() {
    const result = passwordMatch(testUsers, 'abc@test.com', '123456');
    assert.isFalse(result);
  });
});

describe('urlsForUser', function() {
  it('should return urls that match given users id', function() {
    const result = urlsForUser(testUrlDatabase,"userRandomID");
    const checkForMatch = function() {
      for (const urls in result) {
        if (urls === "4ry7M6") {
          return true;
        }
      }
      return false;
    };
    assert.isTrue(checkForMatch());
  });

  it('should not return urls that do not belong to user', function() {
    const result = urlsForUser(testUrlDatabase,"userRandomID");
    const checkForMatch = function() {
      for (const urls in result) {
        if (urls === "0Mnik3") {
          return true;
        }
      }
      return false;
    };
    assert.isFalse(checkForMatch());
  });
});

