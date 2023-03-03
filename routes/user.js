const express = require("express");
const {
  register,
  login,
  addContact,
  updateContact,
  deleteContact,
  logout
} = require("../controller/user");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/add-contact", addContact);

// router.get("/get-contact/:id", verify, getContact);

router.post("/update/:id", updateContact);

router.get("/delete/:id", deleteContact);

// router.get("/getAllContacts", verify, getAllContacts);

router.get("/logout", logout);


module.exports = router;
