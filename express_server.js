const express = require("express");
const app = express();
const cookieParser = require("cookie-parser")
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
//console.log(generateRandomString(6));


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
}

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
  let usernameTemp = undefined;
  if (req.cookies) {
    usernameTemp = req.cookies["username"];
  }
  const templateVars = {
    urls: urlDatabase,
    username: usernameTemp
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  let key = generateRandomString(6);
  urlDatabase[key] = req.body.longURL;
  res.redirect(`/urls/${key}`)
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
})

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/register", (req, res)=>{
  let usernameTemp = undefined;
  if (req.cookies) {
    usernameTemp = req.cookies["username"];
  }
  const templateVars = {
    urls: urlDatabase,
    username: usernameTemp
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  let randomId = generateRandomString(8);
  users[randomId] = {
    id: randomId,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie("user_id", randomId);
  console.log(users);
  res.redirect("/urls");
})

app.post("/login", (req, res) => {
  console.log(req.body);
  res.cookie("username", req.body.Username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});