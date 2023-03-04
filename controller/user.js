const User = require("../model/User");
const cryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { capitalCase } = require("capital-case");
const Contact = require("../model/Contact");
const verifyUser = require("../middleware/token");

const register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const fetchedUser = await User.findOne({ email });
    if (fetchedUser) {
      res.status(409).json({
        message: "user already exist!!!",
      });
    } else {
      const user = new User({
        email,
        password: cryptoJS.AES.encrypt(
          password,
          process.env.SECRET_MASTER_PASSWORD
        ),
        username,
      });
      await user.save();

      res.redirect("/login");
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const fetchedUser = await User.findOne({ username });
    if (fetchedUser) {
      let decreptedPassword = cryptoJS.AES.decrypt(
        fetchedUser.password,
        process.env.SECRET_MASTER_PASSWORD
      );
      decreptedPassword = decreptedPassword.toString(cryptoJS.enc.Utf8);
      if (decreptedPassword === password) {
        const accessToken = jwt.sign(
          { id: fetchedUser._id, email: fetchedUser.email },
          process.env.JWT_TOKEN,
          {
            expiresIn: "2d",
          }
        );
        const { password, ...other } = fetchedUser._doc;

        req.session.token = accessToken;
        res.redirect("/home");
      } else {
        res
          .status(404)
          .json({ success: false, message: "password not matched!!!" });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "user not found!!!",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const addContact = async (req, res, next) => {
  try {
    const { contactName, contactNumber, email } = req.body;
    const contact = new Contact({
      contactName: capitalCase(contactName),
      contactNumber,
      email,
    });
    const userFromToken = await verifyUser(req.session.token);
    const fetchedUser = await User.findOne({ email: userFromToken.email });
    await User.findByIdAndUpdate(
      { _id: fetchedUser._id },
      {
        $push: { contactList: contact },
      }
    );
    await contact.save();

    //res.redirect("home");
    res.redirect('back');
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const updateContact = async (req, res, next) => {
  console.log(req.params.id);
  try {
    const { id } = req.params;
    const fetchedContact = await Contact.findById(id);
    console.log(fetchedContact);
    console.log(id);
    if (fetchedContact) {
      const updatedContact = {
        contactName:
          req.body.contactName === undefined
            ? fetchedContact.contactName
            : capitalCase(req.body.contactName),
        contactNumber:
          req.body.contactNumber === undefined
            ? fetchedContact.contactNumber
            : req.body.contactNumber,
        email:
          req.body.email === undefined ? fetchedContact.email : req.body.email,
      };
      await Contact.findByIdAndUpdate(id, updatedContact, {
        new: true,
      });

      res.redirect("/home");
    } else {
      res.status(404).json("not found!!!");
    }
  } catch (err) {
    res.status(err.message);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userFromToken = await verifyUser(req.session.token);
    const fetchContact = await Contact.findById(id);
    console.log(fetchContact);
    if (fetchContact) {
      await User.findByIdAndUpdate(
        { _id: userFromToken.id },
        { $pull: { contactList: fetchContact._id } }
      );

      await Contact.findByIdAndDelete(id);
      res.redirect("/home");
    } else {
      res.status(404).json({
        msessage: "Invalid ID",
        success: false,
      });
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const logout = async (req, res, next) => {
  if (req.session.token) {
    req.session.token = null;
    res.status(200).json({ success: true });
  }
};

module.exports = {
  register,
  login,
  addContact,
  updateContact,
  deleteContact,
  logout,
};
