const express = require("express")
const path = require("path")
const session = require("express-session")
const UsersComponent = require("./UsersComponent")
const app = new express()
const PORT = 8080

const usersComponent = new UsersComponent("./state.json")

// Per abilitare il parsing delle form in formato urlencoded
app.use(express.urlencoded({ extended: true }))

// Middleware per servire i file statici
app.use(express.static("public"))

app.use(session({
  secret: "brawlstars123",
  resave: false,
  saveUninitialized: true
}))

app.get("/", (req, res) => {
  res.redirect("/login") //TODO
})

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/login.html"))
})

app.post("/login", (req, res) => {
  console.log(req.body)
  const verify = usersComponent.login(req.body.email, req.body.password)
  if (verify){
    req.session.email = req.body.email
    res.redirect("/dashboard")
  }else{
    res.redirect("/login?error=1")
  }
})

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/signup.html"))
})

app.post("/signup", (req, res) => {
  console.log(req.body)
  let email=req.body.email
  var usersList = JSON.parse(usersComponent.read())
  console.log(email)
  console.log(email in usersList)
  if(email in usersList){
    res.redirect("/signup?error=1")
  }else{
    usersComponent.create(req.body)
    res.redirect("/login?signup=1")
  }
})

app.get("/dashboard", (req, res) => {
  if (!req.session.email) {
    return res.redirect("/login");
  }
  res.sendFile(path.join(__dirname, "./public/dashboard.html"));
});

app.get("/api/username", (req, res) => {
  if (!req.session.email) {
    return res.status(401).json({ error: "Non autorizzato" });
  }
  const username = req.session.email.split("@")[0];
  res.json({ username });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.listen(PORT, () => console.log("server listening on port", PORT))
