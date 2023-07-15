const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");

//---lấy toàn bộ transaction---
router.get("/get_dashboard", adminController.getDashboard);
//---lấy toàn bộ hotel---
router.get("/get_hotel_admin", adminController.getHotel);
//---xóa hotel với id---
router.post("/delete_hotel", adminController.deleteHotelById);
//---thêm hotel---
router.post("/add_hotel", adminController.addHotel);
//---lấy toàn bộ room---
router.get("/get_room_admin", adminController.getRoom);
//---xóa room với id---
router.post("/delete_room", adminController.deleteRoom);
//---thêm room---
router.post("/add_room", adminController.addRoom);
//---lấy hotel edit---
router.get("/edit_hotel/:hotelId", adminController.getHotelById);
//---post edit hotel---
router.post("/post_edit_hotel", adminController.postEditHotel);
//---lấy room edit---
router.get("/edit_room/:roomId", adminController.getRoomById);
//---post edit hotel---
router.post("/post_edit_room", adminController.postEditRoom);
module.exports = router;
