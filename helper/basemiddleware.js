module.exports = async (req, res, next) => {
  if (req.session.hasOwnProperty("user")) {
    // console.log(
    //   req.session.user,
    //   ">>>>>>>>>>>> data from middleware>>>>>>>>.OOOOOOOOOOOOKKKKKKKKKKK"
    // );
    global.adminData = req.session.user;
  }

  return next();
};
