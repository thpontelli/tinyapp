const express = require("express");
const app = express();
//const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const PORT = 8080; // default port 8080
const { 
  generateRandomString, 
  getUserByEmail, 
  getUserFromCookie, 
  getURLbyShortener } = require("./helpers");


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW",
  },
  "b6UTxQ": {
    longURL: "https://www.tsn.ca",
    userID: "f5htYs",
  },
  "i3BoGr": {
    longURL: "https://www.google.ca",
    userID: "f5htYs",
  },
};

const users = {
  "aJ48lW": {
    id: "thiago",
    email: "thiagoteste@gmail.com",
    password: "$2a$10$DItIrAQ43gtVVlxQ4G01me6Arr8OV1AEZQxIhYHSBOsY.jn7TFvmK"
  },
  "f5htYs": {
    id: "robson",
    email: "robsonteste@gmail.com",
    password: "$2a$10$1tsRBMQDeGZNG/kzpZyvw.NSIzdjzzm4oshgAq3YUqgm2O/2Z.Grq"
  }
};

const urlsForUser = function(id) {
  let urlTempDB = {};

  for (item in urlDatabase) {
    if (id === urlDatabase[item].userID) {
      //console.log(item);
      urlTempDB[item] = urlDatabase[item]
    }
  }
  return urlTempDB
};

console.log(urlsForUser("aJ48lW"));

//middleware
app.use(express.urlencoded({ extended: true }));
//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['tinyApp'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

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
  if (getUserFromCookie(req, users)) {
    if (urlsForUser(req.session.user_id)) {
      const templateVars = {
        urls: urlsForUser(req.session.user_id),
        user: getUserFromCookie(req, users)
      };
      res.render("urls_index", templateVars);        
    }
  } else {
    res.status(403).send('User is not logged in!');
  }
});

app.post("/urls", (req, res) => {
  if (getUserFromCookie(req, users)) {
    let key = generateRandomString(6);
    urlDatabase[key] = {};
    urlDatabase[key].longURL = req.body.longURL;
    urlDatabase[key].userID = req.session.user_id;
    console.log(urlDatabase);
    res.redirect(`/urls/${key}`);
  } else {
    res.status(403).send('User is not logged in!');
  }
});


app.get("/urls/new", (req, res) => {
  if (getUserFromCookie(req, users)) {
    const templateVars = {
      user: getUserFromCookie(req, users)
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  if (getUserFromCookie(req, users)) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      urls: urlDatabase,
      user: getUserFromCookie(req, users)
    };
    res.render("urls_register", templateVars);
  }
});

app.post("/register", (req, res) => {
  // Check if the email and password have been entered.
  if (req.body.email && req.body.password) {
    let user = getUserByEmail(req.body.email, users);
    // check if the user exists in database.
    if (user !== null) {
      res.status(400).send("Email is already used!");
    // All checks passed, user can be created.
    } else {
      let randomId = generateRandomString(6);
      users[randomId] = {
        id: randomId,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
      };
      console.log(users);
      //res.cookie("user_id", randomId);
      req.session.user_id = randomId;
      res.redirect("/urls");
    }
  // Email or password is blank.
  } else {
    res.status(400).send('Email or password is blank!');
  }
});

app.get("/urls/:id", (req, res) => {
  if (req.params.id in urlDatabase) { 
    if (getUserFromCookie(req, users)) {
      // console.log(req.params.id)
      // console.log(getUserFromCookie(req));
      // console.log(urlsForUser(req.cookies["user_id"]));
      // console.log(urlDatabase[req.params.id].longURL);
      if (req.params.id in urlsForUser(req.session.user_id)) {
        const templateVars = {
          id: req.params.id,
          longURL: urlDatabase[req.params.id].longURL,
          user: getUserFromCookie(req, users)
        };
        res.render("urls_show", templateVars);    
      } else {
        res.status(403).send("This URL doens't belong to you!")
      }
    } else {
      res.status(403).send('User is not logged in!');
    }
  } else {
    res.status(404).send("This page doesn't exist");
  }
});

app.post("/urls/:id", (req, res) => {
  console.log(req.params.id);
  console.log(urlDatabase);
  if (req.params.id in urlDatabase) {
    if (getUserFromCookie(req, users)) {
      if (req.params.id in urlsForUser(req.session.user_id)) {
        urlDatabase[req.params.id].longURL = req.body.longURL;
        res.redirect("/urls");
      } else {
        res.status(403).send("This URL doesn't belong to you!")
      }
    } else {
      res.status(403).send('User is not logged in!');
    }
  } else {
   res.status(404).send("This page doesn't exist");
  }
});


app.post("/urls/:id/delete", (req, res) => {
  if (req.params.id in urlDatabase) {
    if (getUserFromCookie(req, users)) {
      if (req.params.id in urlsForUser(req.session.user_id)) {
        delete urlDatabase[req.params.id];
        res.redirect("/urls");
      } else {
        res.status(403).send("This URL doesn't belong to you!");
      }
    } else {
      res.status(403).send('User is not logged in!'); 
    }
  } else {
    res.status(404).send("This page doesn't exist");
  }
});

app.get("/u/:id", (req, res) => {
  if (getURLbyShortener(req.params.id, urlDatabase)) {
    res.redirect(urlDatabase[req.params.id].longURL);
  } else {
    res.status(400).send("This shortener doesn't exist in our database!")
  }
});

app.get("/login", (req, res) => {
  if (getUserFromCookie(req, users)) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      urls: urlDatabase,
      user: getUserFromCookie(req, users)
    };
    res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  // check if the email and password have been entered.
  if (req.body.email && req.body.password) {
    let user = getUserByEmail(req.body.email, users);
    // check if user exists.
    if (user !== null) {
      // if user exists and the password matches, proceed with login.
      if (bcrypt.compareSync(req.body.password, users[user].password)) {
        //res.cookie("user_id", user);
        req.session.user_id = user;
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
  //res.clearCookie("user_id");
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});