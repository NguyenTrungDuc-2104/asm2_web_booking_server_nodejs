const User = require("../models/userModel");

//-----login-user-----
exports.getUser = (req, res, next) => {
  const emailRequest = req.body.email ? req.body.email : null;
  const passwordRequest = req.body.password;

  User.find({ email: emailRequest, password: passwordRequest })
    .select("-password") // không lấy trường password
    .then((user) => {
      if (user.length > 0) {
        return res.send({ isLogin: true, user: user });
      } else {
        return res.send({ isLogin: false, user: [] });
      }
    })
    .catch((err) => console.log("getUser Error", err));
};
//------login-admin-------
exports.getAdmin = (req, res, next) => {
  const emailRequest = req.body.email ? req.body.email : null;
  const passwordRequest = req.body.password;

  User.find({ email: emailRequest, password: passwordRequest, isAdmin: true })
    .select("-password") // không lấy trường password
    .then((admin) => {
      if (admin.length > 0) {
        return res.send({ isLogin: true, admin: admin });
      } else {
        return res.send({ isLogin: false, admin: [] });
      }
    })
    .catch((err) => console.log("get admin error", err));
};
//-----register-----
exports.postUser = (req, res, next) => {
  const username = req.body.username;
  const fullName = req.body.fullName;
  const email = req.body.email;
  const phoneNumber = req.body.phoneNumber;
  const password = req.body.password;
  const isAdmin = req.body.isAdmin;
  //----tạo user mới---
  const user = new User({
    username: username,
    fullName: fullName,
    email: email,
    phoneNumber: phoneNumber,
    password: password,
    isAdmin: isAdmin,
  });
  //---check xem user đã tồn tại chưa---
  User.find({ username: username })
    .then((users) => {
      if (users.length === 0) {
        return user
          .save()
          .then(() => {
            return res.send({
              isRegister: true,
              message: "Account successfully created",
            });
          })
          .catch((err) => console.log("postUser Error", err));
      } else {
        return res.send({
          isRegister: false,
          message: "username already exists",
        });
      }
    })
    .catch((err) => console.log("postUser Error", err));
};
