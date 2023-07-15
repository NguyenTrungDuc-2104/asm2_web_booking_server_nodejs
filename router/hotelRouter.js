const express = require("express");
const hotelControllers = require("../controller/hotelController");
const transactionsController = require("../controller/transactionController");
const router = express.Router();

//---lấy thông tin toàn bộ khách sạn---
router.get("/get_hotel", hotelControllers.getHotel);
//---search khách sạn---
router.post("/search_hotel", hotelControllers.postSearchHotel);
//---lấy thông tin 1 khách sạn---
router.get("/detail/:detailId", hotelControllers.getDetailHotel);
//---check room with date---
router.post(
  "/detail/:detailId/check_room_with_date",
  hotelControllers.getRoomWitDate
);
//---add transactions hotel---
router.post("/detail/:detailId/booking", transactionsController.addTransaction);
//---get transactions---
router.get("/get_transactions", transactionsController.getTransactions);

module.exports = router;
