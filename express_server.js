const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const generateRandomString = function(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const getUserByEmail = function(email) {
  for (let user in users) {
    if (email === users[user].email) {
      return user;
    }
  }
  return null;
};

// If a cookie exists return the user object, otherwise return undefined.
const getUserFromCookie = function(req) {
  if (req.cookies) {
    return users[req.cookies["user_id"]];
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  thiago: {
    id: "thiago",
    email: "thiagoteste@gmail.com",
    password: "123"
  },
  robson: {
    id: "robson",
    email: "robsonteste@gmail.com",
    password: "456"
  }
};

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: getUserFromCookie(req)
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let key = generateRandomString(6);
  urlDatabase[key] = req.body.longURL;
  res.redirect(`/urls/${key}`);
});


app.get("/urls/new", (req, res) => {
  let user = undefined;
  if (req.cookies) {
    user = users[req.cookies["user_id"]];
  }
  const templateVars = {
    user: user
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: getUserFromCookie(req)
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  // Check if the email and password have been entered.
  if (req.body.email && req.body.password) {
    let user = getUserByEmail(req.body.email);
    // check if the user exists in database.
    if (user !== null) {
      res.status(400).send("Email is already used!");
    // All checks passed, user can be created.
    } else {
      let randomId = generateRandomString(8);
      users[randomId] = {
        id: randomId,
        email: req.body.email,
        password: req.body.password
      };
      res.cookie("user_id", randomId);
      res.redirect("/urls");
    }
  // Email or password is blank.
  } else {
    res.status(400).send('Email or password is blank!');
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: getUserFromCookie(req)
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});


app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: getUserFromCookie(req)
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  // check if the email and password have been entered.
  if (req.body.email && req.body.password) {
    let user = getUserByEmail(req.body.email);
    // check if user exists.
    if (user !== null) {
      // if user exists and the password matches, proceed with login.
      if (req.body.password === users[user].password) {
        res.cookie("user_id", user);
        res.redirect("/urls");
      } else {
        res.status(403).send('Password doesn\'t match');
      }
    } else {
      res.status(403).send('User not found!');
    }
  } else {
    res.status(400).send('Email or password is blank!');
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});