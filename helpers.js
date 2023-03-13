const generateRandomString = function(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const getUserByEmail = function(email, userDB) {
  for (let user in userDB) {
    if (email === userDB[user].email) {
      return user;
    }
  }
  return null;
};

// If a cookie exists return the user object, otherwise return undefined.
const getUserFromCookie = function(req, userDB) {
  if (req.session) {
    return userDB[req.session.user_id];
  }
};

// If a shortener exists in urlDatabase return the object, otherwise
// return undefined.
const getURLbyShortener = function(shortener, urlDB) {
  return urlDB[shortener];
};




module.exports = {
  generateRandomString,
  getUserByEmail,
  getUserFromCookie,
  getURLbyShortener
};