const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const userRouters = require("./router/userRouter");
const hotelRouters = require("./router/hotelRouter");
const adminRouters = require("./router/adminRouter");
const User = require("./models/userModel");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(userRouters);
app.use(adminRouters);
app.use((req, res, next) => {
  const useId = req.headers.authorization.split(" ")[1];
  User.findById(useId)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log("authorization error", err));
});
app.use(hotelRouters);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.xvwm5ml.mongodb.net/${process.env.MONGODB_DEFAULT_DATABASE}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(process.env.port || 5000);
  })
  .catch((err) => console.log(err));
