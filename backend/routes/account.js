const express = require("express");
const { authorizeUserAccess } = require("../middleware");
const { Account } = require("../db");
const mongoose = require("mongoose");
const router = express.Router();

router.get("/balance", authorizeUserAccess, async (req, res) => {
  console.log("test", req.userId);
  const userBalance = await Account.findOne({
    userId: req.userId,
  });
  // console.log("userBalance", userBalance,userBalance.u);
  res.status(200).json({
    message: userBalance.balance,
  });
});

router.post("/transfer", authorizeUserAccess, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const { amount, to } = req.body;
  const senderAccount = await Account.findOne({ userId: req.userId }).session(
    session
  );
  if (!senderAccount || senderAccount.balance < amount) {
    await session.abortTransaction();
    res.status(400).json({
      msg: "insufficient funds",
    });
  }
  const recieverAccount = await Account.findOne({ userId: to }).session(
    session
  );
  if (!recieverAccount) {
    await session.abortTransaction();
    res.status(400).json({
      msg: "Invalid account",
    });
  }

  await Account.updateOne(
    { userId: req.userId },
    { $inc: { balance: -amount } }
  ).session(session);
  await Account.updateOne(
    { userId: to },
    { $inc: { balance: amount } }
  ).session(session);

  await session.commitTransaction();

  res.json({
    message: "Transfer successful",
  });
});

module.exports = router;
