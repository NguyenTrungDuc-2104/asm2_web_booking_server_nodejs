const User = require("../models/userModel");
const Hotel = require("../models/hotelModel");
const Room = require("../models/roomModel");
const Transaction = require("../models/transactionModel");

//-----------------get dashboard--------------------------
exports.getDashboard = (req, res, next) => {
  //---lấy user---
  const users = User.find({ isAdmin: false })
    .then((user) => {
      return { user };
    })
    .catch((err) => console.log("get dashboard user error", err));
  //---lấy transaction---
  const transactions = Transaction.find({})
    .populate("hotel", "name")
    .then((transactions) => {
      const earning = transactions.reduce((total, trans) => {
        return (total = total + trans.price);
      }, 0);
      //----doanh thu trung binh 1 thang---
      const balance = Math.round(earning / (new Date().getMonth() + 1));
      //------đảo ngược thứ tự trans để lấy các giao dịch gần đây nhất-----
      const trans = transactions.reverse();
      return { earning, balance, transactions: trans };
    })
    .catch((err) => console.log(" get dashboard trans error", err));
  //----trả data về client---
  Promise.all([users, transactions])
    .then((dashboard) => {
      res.send(dashboard);
    })
    .catch((err) => console.log("get dashboard error", err));
};

//------------------------------------------------get hotel-------------------------------------
exports.getHotel = (req, res, next) => {
  Hotel.find({})
    .then((hotels) => {
      res.send(hotels);
    })
    .catch((err) => {
      console.log("admin get hotel error", err);
    });
};
//-----------------------------------------delete hotel -------------------------------------------
exports.deleteHotelById = (req, res, next) => {
  const id = req.body.idHotel;
  Transaction.find({
    $and: [{ hotel: id }, { status: { $ne: "Checkout" } }],
  }).then((trans) => {
    if (trans.length === 0) {
      Hotel.findByIdAndRemove(id).then(() => {
        return res.send({ isDelete: true, message: "Delete success" });
      });
    } else {
      return res.send({
        isDelete: false,
        message: "There is an ongoing transaction with this hotel",
      });
    }
  });
};

//------------------------------------------add hotel-------------------------------------------
exports.addHotel = (req, res, next) => {
  const hotel = req.body;
  const hotelAdd = new Hotel({
    name: hotel.name,
    type: hotel.type,
    city: hotel.city,
    address: hotel.address,
    distance: hotel.distance,
    title: hotel.title,
    desc: hotel.desc,
    cheapestPrice: hotel.cheapestPrice,
    featured: hotel.featured,
    photos: hotel.photos,
    rooms: hotel.rooms,
  });
  hotelAdd
    .save()
    .then(() => {
      res.send({ addHotel: true, message: "Add hotel success" });
    })
    .catch((err) => {
      console.log("add hotel err", err);
    });
};

//-------------------------------------get room------------------------------------------

exports.getRoom = (req, res, next) => {
  Room.find({})
    .then((room) => {
      res.send(room);
    })
    .catch((err) => console.log("admin get room error", err));
};

//----------------------------------------------------delete room---------------------------------------------------------------
exports.deleteRoom = (req, res, next) => {
  const id = req.body.idRoom;
  //---------kiểm tra coi có giao dịch nào đang thực hiện với room này không rồi mới xóa-----------------
  Transaction.find({
    $and: [
      { room: { $elemMatch: { _id: id } } },
      { status: { $ne: "Checkout" } },
    ],
  })
    .then((trans) => {
      if (trans.length === 0) {
        //-------------xóa room-----------------
        const deleRoomPromise = Room.findByIdAndRemove(id);
        //---------xóa id room trong hotel---------
        const deleteRoomInHotelPromise = Hotel.deleteRoomNumberInHotel(id);

        return Promise.all([deleRoomPromise, deleteRoomInHotelPromise]).then(
          () => {
            return res.send({ isDelete: true, message: "Delete success" });
          }
        );
      } else {
        return res.send({
          isDelete: false,
          message: "There is an ongoing transaction with this room",
        });
      }
    })
    .catch((err) => console.log("detele room error", err));
};

//-----------------------------------add room-----------------------------------------
exports.addRoom = (req, res, next) => {
  const roomReq = req.body;
  const room = new Room({
    desc: roomReq.desc,
    title: roomReq.title,
    price: roomReq.price,
    maxPeople: roomReq.maxPeople,
  });

  room
    .save()
    .then((room) => {
      Hotel.findById(roomReq.idHotel)
        .then((hotel) => {
          hotel.rooms.push(room._id.toString());
          hotel.save();
        })
        .then(() => {
          res.send({ addRoom: true, message: "Add room success" });
        })
        .catch((err) => console.log("add id room in hotel error", err));
    })
    .catch((err) => console.log("add room error", err));
};

//----------------------------------------------lấy 1 hotel và toàn bộ room--------------------------------------------------------
exports.getHotelById = (req, res, next) => {
  const idHotel = req.params.hotelId;
  const hotelPromise = Hotel.findById(idHotel);
  const roomPromise = Room.find({});

  Promise.all([hotelPromise, roomPromise])
    .then((data) => {
      res.send(data);
    })
    .catch((err) => console.log("get hotel by id error", err));
};
//----------------------------------------------------post edit hotel----------------------------------------------------------
exports.postEditHotel = (req, res, next) => {
  const idHotel = req.body.idHotel;

  const updateName = req.body.name;
  const updateType = req.body.type;
  const updateCity = req.body.city;
  const updateAddress = req.body.address;
  const updateDistance = req.body.distance;
  const updateTitle = req.body.title;
  const updateDesc = req.body.desc;
  const updateCheapestPrice = req.body.cheapestPrice;
  const updateFeatured = req.body.featured;
  const updatePhotos = req.body.photos;
  const updateRooms = req.body.rooms;
  const updateRating = req.body.rating;
  Hotel.findById(idHotel)
    .then((hotel) => {
      hotel.name = updateName;
      hotel.type = updateType;
      hotel.city = updateCity;
      hotel.address = updateAddress;
      hotel.distance = updateDistance;
      hotel.title = updateTitle;
      hotel.desc = updateDesc;
      hotel.cheapestPrice = updateCheapestPrice;
      hotel.featured = updateFeatured;
      hotel.photos = updatePhotos;
      hotel.rooms = updateRooms;
      hotel.rating = updateRating;
      return hotel.save();
    })
    .then(() => {
      res.send({ isEdit: true, message: "Edit hotel success" });
    })
    .catch((err) => console.log("post edit hotel error", err));
};

//-----------------------------lấy 1 room và toàn bộ hotel--------------------------------
exports.getRoomById = (req, res, next) => {
  const idRoom = req.params.roomId;
  Room.findById(idRoom)
    .then((room) => {
      res.send(room);
    })
    .catch((err) => console.log("get room by id err", err));
};
//--------------------------------post edit room----------------------------------------------
exports.postEditRoom = (req, res, next) => {
  const idRoom = req.body.idRoom;

  const updateTitle = req.body.title;
  const updatePrice = req.body.price;
  const updateMaxPeople = req.body.maxPeople;
  const updateDesc = req.body.desc;
  const updateRoomNumbers = req.body.roomNumbers;

  Room.findById(idRoom)
    .then((room) => {
      room.title = updateTitle;
      room.price = updatePrice;
      room.desc = updateDesc;
      room.maxPeople = updateMaxPeople;
      room.roomNumbers = updateRoomNumbers;

      return room.save();
    })
    .then(() => {
      res.send({ isEdit: true, message: "Edit room success" });
    })
    .catch((err) => console.log("post edit room error", err));
};
