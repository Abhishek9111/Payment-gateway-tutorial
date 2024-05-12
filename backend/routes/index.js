const express = require("express");

const router = express.Router();
const userRoute = require("../routes/user");
const accountRoute = require("../routes/account");
router.use("/user", userRoute);
router.use("/account", accountRoute);

module.exports = router;
