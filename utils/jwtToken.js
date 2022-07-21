const createSendToken = (user, statusCode, res) => {
  const options = {
    httpOnly: true,
    expire: new Date(
      Date.now() + process.env.COOKIE_EXPIRATION * 24 * 60 * 60 * 1000
    ),
  };
  const token = user.getJWTToken();
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user,
  });
};
module.exports = createSendToken;
