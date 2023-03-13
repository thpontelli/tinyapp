const { assert } = require('chai');

const {
  getUserByEmail,
  getURLbyShortener } = require('../helpers.js');

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
  }
};

const testURLs = {
  "qwe123": {
    longURL: "http://www.globo.com",
    userID: "aJ4675",
  },
  "qwe456": {
    longURL: "http://www.g1.com",
    userID: "aJ0985",
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(expectedUserID, user);
  });

  it('should return undefined for a non-existent email', function() {
    const user = getUserByEmail("user3@example.com", testUsers);
    const expectedUserID = undefined;
    assert.equal(expectedUserID, user);
  });

  it('should return the URL object for a shortener', function() {
    const URL = getURLbyShortener("qwe456", testURLs).longURL;
    const expectedLongURL = "http://www.g1.com";
    assert.equal(expectedLongURL, URL);
  });

  it('should return undefined for a shortener that doesn\'t exist', function() {
    const URL = getURLbyShortener("qwe567", testURLs);
    const expectedLongURL = undefined;
    assert.equal(expectedLongURL, URL);
  });
});
