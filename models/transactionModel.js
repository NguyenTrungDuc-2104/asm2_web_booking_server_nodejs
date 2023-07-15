const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  user: {
    type: String,
    require: true,
  },
  hotel: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Hotel",
  },

  fullName: { type: String },

  email: { type: String },

  phoneNumber: { type: Number },

  identityCardNumber: {
    type: Number,
    require: true,
  },

  room: {
    type: Array,
    required: true,
  },
  dateStart: {
    type: String,
    required: true,
  },
  dateEnd: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  payment: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
