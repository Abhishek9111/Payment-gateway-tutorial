const express = require("express");
const zod = require("zod");
const router = express.Router();
const { User, Account } = require("../db");
const { JWT_SECRET } = require("../config");
const { authorizeUserAccess } = require("../middleware");

const jwt = require("jsonwebtoken");

const signUpBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
});

const signInBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

const updateUserBody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});

router.post("/signup", async (req, res) => {
  const responseData = signUpBody.safeParse(req.body);
  if (responseData.success == false) {
    res.status(401).json({
      message: "Incorrect inputs please fill all the fields properly",
    });
  }
  const existingUser = await User.findOne({
    username: req.body.username,
  });

  if (existingUser) {
    res.status(401).json({
      message: "User already exists",
    });
  }
  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });
  //   console.log("created user", user);

  let userId = user._id;
  Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  });
  const token = jwt.sign(
    {
      userId,
    },
    JWT_SECRET
  );
  res.json({
    message: "User created successfully",
    token: token,
  });
});

router.post("/signin", async (req, res) => {
  const { success } = signInBody.safeParse(req.body);
  if (!success) {
    res.status(403).json({
      message: "Please fill all the fields properly",
    });
  }
  let checkSignIn = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });
  if (checkSignIn) {
    const userId = checkSignIn._id;
    const token = jwt.sign(
      {
        userId,
      },
      JWT_SECRET
    );
    res.status(200).json({
      message: "Success signin",
      token: token,
    });
  } else {
    res.status(201).json({
      message: "User doesn't exist",
    });
  }
  //   console.log("this is checkSignIn function", checkSignIn);
});

router.put("/", authorizeUserAccess, async (req, res) => {
  const success = updateUserBody.safeParse(req.body);
  if (!success) {
    res.status(403).json({
      message: "Please fill all the fields properly",
    });
  }
  console.log("user id", req.userId, req.body);
  await User.updateOne(
    {
      _id: req.userId,
    },
    req.body
  );

  res.json({
    msg: "Updated successfully",
  });
});

router.get("/bulk", authorizeUserAccess, async (req, res) => {
  const filter = req.query.filter || "";

  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  });

  res.json({
    user: users.map((user) => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});
module.exports = router;
