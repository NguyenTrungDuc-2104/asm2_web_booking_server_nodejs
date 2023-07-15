const TransactionModel = require("../models/transactionModel");

exports.addTransaction = (req, res, next) => {
  const userId = req.user._id;
  const user = req.user.username;
  const fullName = req.body.fullName;
  const email = req.body.email;
  const phoneNumber = req.body.phoneNumber;
  const identityCardNumber = req.body.identityCardNumber;
  const hotel = req.body.hotelId;
  const room = req.body.room;
  const dateStart = req.body.dateStart;
  const dateEnd = req.body.dateEnd;
  const price = req.body.price;
  const payment = req.body.payment;
  const status = req.body.status;

  const transactions = new TransactionModel({
    userId,
    user,
    hotel,
    fullName,
    email,
    phoneNumber,
    identityCardNumber,
    room,
    dateStart,
    dateEnd,
    price,
    payment,
    status,
  });
  transactions
    .save()
    .then(() => {
      res.send({ message: "Add transaction successful" });
    })
    .catch((err) => console.log("post transactions error", err));
};

exports.getTransactions = (req, res, next) => {
  const userId = req.headers.authorization.split(" ")[1];
  TransactionModel.find({ userId: userId })
    .select(" user room dateStart dateEnd price payment status ")
    .populate("hotel", "title")
    .then((transaction) => {
      res.send(transaction);
    })
    .catch((err) => console.log("get transactions error", err));
};
