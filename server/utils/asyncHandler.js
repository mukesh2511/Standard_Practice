/////////////////////higher order function/////////////////////////

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    return Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      console.log(error);
      next(error);
    });
  };
};

//second method

// const asyncHandler = (requestHandler) => async (req, res, next) => {
//   try {
//     return await requestHandler(req, res, next);
//   } catch (error) {
//     res.status(err.code || 500).json({ success: false, message: error.message || "Something Went Wrong" });
//     next(error);
//   }
// };

export default asyncHandler;

///
