const Hotel = require("../models/hotelModel");
const Transaction = require("../models/transactionModel");
//---------------------------lấy thông tin toàn bộ khách sạn-----------------------------
exports.getHotel = (req, res, next) => {
  Hotel.find()
    .then((hotels) => {
      if (hotels.length > 0) {
        return res.send({ isHotel: true, hotels: hotels });
      } else {
        return res.send({ isHotel: false, hotels: hotels });
      }
    })
    .catch((err) => console.log("getHotel err", err));
};
//-----------------------------------search khách sạn------------------------------------
exports.postSearchHotel = (req, res, next) => {
  const dataSearch = req.body;
  //---biểu thức chính quy để tìm kiếm dựa vào chuỗi người dùng nhập vào ' i ' là để không phân biệt chứ hoa chữ thường---
  const queryDestination = {
    city: { $regex: new RegExp(`^${dataSearch.destination}$`, "i") },
  };
  Hotel.find(queryDestination)
    .populate("rooms", "maxPeople roomNumbers")
    .lean()
    .then((hotels) => {
      const promises = hotels.map((item) => {
        const hotelId = item._id.toString();
        return Transaction.find({ hotel: hotelId })
          .select("room dateStart dateEnd status")
          .lean();
      });
      return Promise.all(promises).then((transaction) => {
        const transactionArr = transaction.flat();
        return Hotel.searchHotel(transactionArr, hotels, dataSearch);
      });
    })
    .then((hotelAffterSearch) => {
      res.send(hotelAffterSearch);
    })
    .catch((err) => console.log("search error", err));
};
//---lấy thông tin 1 khách sạn---
exports.getDetailHotel = (req, res, next) => {
  const detailId = req.params.detailId;
  Hotel.findById(detailId.toString())
    .populate("rooms")
    .then((hotel) => {
      res.send(hotel);
    })
    .catch((err) => console.log("get detail hotel error", err));
};

//---check room with date---
exports.getRoomWitDate = (req, res, next) => {
  const detailId = req.params.detailId;
  const date = req.body;
  Transaction.find({ hotel: detailId })
    .select("room dateStart dateEnd status")
    .lean()
    .then((transaction) => {
      Hotel.findById(detailId.toString())
        .select("rooms")
        .populate("rooms")
        .lean()
        .then((room) => {
          return Hotel.getRoomWithDate(transaction, room, date);
        })
        .then((roomFilter) => {
          res.send(roomFilter);
        })
        .catch((err) => console.log("get hotel in check room error", err));
    })
    .catch((err) => console.log("get room with date error", err));
};
