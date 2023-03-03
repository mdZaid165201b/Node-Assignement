const mongoose = require('mongoose');
const ContactSchema = mongoose.Schema({
  contactName: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true } );

module.exports = mongoose.model("Contact", ContactSchema);
