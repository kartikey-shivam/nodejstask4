const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');
const AppError = require('../utils/appError');
const User = require('../model/userModel');
const createSendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');

//Register User
exports.registerUser = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password,
  });
  createSendToken(user, 201, res);
});

//Login User
exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email or password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  const isPasswordValid = user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError('Invalid email or password', 401));
  }
  createSendToken(user, 200, res);
});

//Forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('User not found'), 404);
  }
  const resetToken = user.createResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your reset password token is \n\n ${resetURL} \n\n. If you have not requested this email, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset Password Email',
      message,
    });

    res.status(200).json({
      success: true,
      message: 'Reset Password Email sent successfully',
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new AppError(err.message, 500));
  }
});

//Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('The reset token is invalid or expired.'), 400);
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new AppError('Password does not match'), 400);
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});
