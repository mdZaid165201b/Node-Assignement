const { verify } = require("jsonwebtoken");

const verifyUser = async (token) => {
  try {
    const verifiedUser = await verify(token, process.env.JWT_TOKEN);
    return verifiedUser;
  } catch (err) {
    res.json(err.message);
  }
};
module.exports = verifyUser;
