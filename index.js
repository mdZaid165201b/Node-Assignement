const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const session = require("express-session");
const verifyUser = require("./middleware/token");
const User = require("./model/User");
const Contact = require("./model/Contact");

const PORT = process.env.port || 4000;


const userRoute = require("./routes/user"); // import routes

const app = express();
dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "mySecretKey", // replace with a secret key for production use
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set this to true if using HTTPS
  })
);

app.set("view engine", "ejs"); // set views engine I used EJS for frontend

// -------------------------------------these routes for different views---------------------------------
app.get("/register", (req, res, next) => {
  res.render("register");
});
app.get("/login", (req, res, next) => {
  res.render("login");
});

app.get("/home", async (req, res, next) => {
  try {
    if (req.session.token) {
      const user = await verifyUser(req.session.token);
      const { contactList } = await User.findById(user.id)
        .populate({
          path: "contactList",
          options: { sort: { contactName: "asc" } },
        })
        .exec();

      res.render("home", { token: req.session.token, contacts: contactList });
    } else {
      res.render("login");
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.get("/add-contact", (req, res, next) => {
  res.render("addContact");
});

app.get("/edit/:id", async (req, res, next) => {
  const id = req.params.id;
  const fetchedContact = await Contact.findById(id);
  if (!fetchedContact) {
    res.redirect("/home");
  } else {
    res.render("editContact", { contact: fetchedContact });
  }
});


app.get("/delete/:id", async (req, res, next) => {

  const id = req.params.id;
  const fetchedContact = await Contact.findById(id);
  if (!fetchedContact) {
    res.redirect("/home");
  } else {
    res.render("deleteContact", { contact: fetchedContact });
  }
});

app.get("/", (req, res) => {
  res.redirect("/login")
})
// ---------------------------------------End of frontend routes----------------------------------

app.use("/api/user", userRoute);

// --------------------Function for mongodb connection with Nodejs--------------------------------
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_CONNECTION_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("listening for requests");
    })
})
