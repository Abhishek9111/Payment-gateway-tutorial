const { JWT_SECRET } = require("./config");
const jwt = require("jsonwebtoken");

const authorizeUserAccess = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    res.status(403).json({
      message: "Unauthorized",
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    let verified = jwt.verify(token, JWT_SECRET);
    req.userId = verified.userId;
    next();
  } catch (err) {
    console.log("error", err);
    res.status(403).json({});
  }
};

module.exports = {
  authorizeUserAccess,
};
