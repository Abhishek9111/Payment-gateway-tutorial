const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://abhishek9111:0000@cluster0.z8ruxdq.mongodb.net/"
);

//checking for mongoose connected
// setTimeout(() => {
//   console.log(mongoose.connection.readyState);
// }, 5000);
const userSchema = mongoose.Schema({
  // username: {
  //   type: String,
  //   required: true,
  //   unique: true,
  //   lowercase: true,
  //   minLength: 8,
  // },
  username: String,
  password: String,
  firstName: String,
  lastName: String,
});

const User = mongoose.model("User", userSchema);

const accountSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, //Referencing user table to join
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});

const Account = mongoose.model("Account", accountSchema);
module.exports = {
  User,
  Account,
};
