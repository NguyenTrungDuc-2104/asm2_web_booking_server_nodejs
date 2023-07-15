const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hotelSchema = new Schema({
  address: {
    type: String,
    required: true,
  },
  cheapestPrice: {
    type: Number,
  },
  city: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  distance: {
    type: String,
    required: true,
  },
  featured: {
    type: Boolean,
    required: true,
  },
  rating: {
    type: Number,
    require: true,
  },
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  photos: {
    type: Array,
    required: true,
  },
  rooms: [
    {
      type: String,
      ref: "Room",
      required: true,
    },
  ],
});

//-------------------------------------------kiểm tra room còn trống không khi chọn ngày trên lịch-------------------------------
hotelSchema.statics.getRoomWithDate = function (transaction, roomAll, date) {
  const dateStartSelect = new Date(date.dateStart);
  const dateEndSelect = new Date(date.dateEnd);
  //---check với ngày đã chọn---
  const roomExists = transaction.filter(
    (item) =>
      new Date(item.dateEnd).getTime() >= dateStartSelect.getTime() &&
      new Date(item.dateStart).getTime() <= dateEndSelect.getTime()
  );
  //-----ngày đã chọn tất cả các phòng đều trống---
  if (roomExists.length === 0) {
    return roomAll;
  }
  //-----trường hợp có đơn trong khoảng ngà đã chọn thì kiểm tra tới status-----
  const roomExistsNotCheckout = roomExists.filter(
    (item) => item.status !== "Checkout"
  );
  //----trường hợp tất cả các đơn đã checkout => tất cả room đểu trống-----
  if (roomExistsNotCheckout.length === 0) {
    return roomAll;
  }
  //-------------trường hợp có đơn và chưa checkout----------------------
  //------lấy ra các kiểu phòng và số phòng chưa checkout------
  let roomEx = [];
  //---tạo mảng gồm _id và số phòng của tất cả các đơn---
  roomExistsNotCheckout.map((item) => {
    roomEx = [...roomEx, ...item.room];
  });
  //---- gộp các _id trùng ----
  const roomIsSelect = Object.values(
    roomEx.reduce((acc, { _id, roomNumber }) => {
      // Nếu chưa tồn tại key là `_id` trong đối tượng `acc`, tạo mới đối tượng với `_id` là key và `roomNumber` là value
      if (!acc[_id]) {
        acc[_id] = { _id, roomNumber: [...new Set(roomNumber)] };
      } else {
        // Nếu đã tồn tại key là `_id` trong đối tượng `acc`, thêm các giá trị duy nhất của `roomNumber` vào mảng `roomNumber`
        acc[_id].roomNumber = [
          ...new Set([...acc[_id].roomNumber, ...roomNumber]),
        ];
      }
      return acc;
    }, {})
  );
  //---cập nhập lại số phòng---
  const updateRoom = roomAll.rooms.map((roomItem) => {
    const bookedRoom = roomIsSelect.find(
      (bookedItem) => bookedItem._id.toString() === roomItem._id.toString()
    );
    if (bookedRoom) {
      const updateRoomNumber = roomItem.roomNumbers.filter(
        (roomNum) => !bookedRoom.roomNumber.includes(roomNum)
      );
      return { ...roomItem, roomNumbers: updateRoomNumber };
    } else {
      return roomItem;
    }
  });
  return { _id: roomAll._id, rooms: updateRoom };
};

//----------------------------------------------------search hotel------------------------------------------------------
hotelSchema.statics.searchHotel = function (transactions, hotels, dataSearch) {
  //----coi như trẻ con cũng bằng người lớn---
  const numberOfPeople = dataSearch.ault + dataSearch.children;
  const numberOfRoom = dataSearch.room;

  const date = {
    dateStart: dataSearch.dateStart,
    dateEnd: dataSearch.dateEnd,
  };
  //---lọc ra danh sách các phòng trống của các khách sạn---
  const hotelRoomArr = hotels.map((hotel) => {
    return this.getRoomWithDate(transactions, hotel, date);
  });
  //----cập nhập lại danh sách các phòng của khách sạn----
  const hotelUpdateRoomArr = hotels.map((hotelItem) => {
    const hotel = hotelRoomArr.find(
      (item) => item._id.toString() === hotelItem._id.toString()
    );
    if (hotel) {
      return { ...hotelItem, rooms: hotel.rooms };
    } else {
      return hotelItem;
    }
  });

  //----------lọc ra khách sạc có room thỏa mãn số người và số phòng---------
  const hotelArr = hotelUpdateRoomArr.reduce((accumulator, currentValue) => {
    console.log(currentValue);

    const hotelFind = currentValue.rooms.find(
      (room) =>
        room.maxPeople >= numberOfPeople &&
        room.roomNumbers.length >= numberOfRoom
    );
    if (hotelFind) {
      accumulator.push(currentValue);
    }
    return accumulator;
  }, []);
  //---------trả data-----------
  return hotelArr;
};
//-----------------------------------------xóa id room trong danh sách khi xóa room-------------------------------------
hotelSchema.statics.deleteRoomNumberInHotel = function (idRoom) {
  this.find({ rooms: { $elemMatch: { $in: [idRoom] } } }).then((hotelArr) => {
    if (hotelArr.length > 0) {
      hotelArr.forEach((hotel) => {
        const roomsUpdate = hotel.rooms.filter(
          (item) => item.toString() !== idRoom
        );
        hotel.rooms = [...roomsUpdate];
        return hotel.save();
      });
    }
    return;
  });
};

module.exports = mongoose.model("Hotel", hotelSchema);
