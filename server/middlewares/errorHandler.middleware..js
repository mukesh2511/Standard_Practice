exports.errorHandler = (err, req, res, next) => {
  let error_message = {
    code: 500,
    message: "internal server error!",
    ...(Debug_Mod = process.env.MODE && { stack: err.message }),
  };
};
