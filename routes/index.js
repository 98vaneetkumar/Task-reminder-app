var express = require("express");
var router = express.Router();
const api = require("../controllers/api/authApi");

const authenticateJWT = require("../helper/nextHelpers").authenticateJWT;
const authenticateHeader = require("../helper/nextHelpers").authenticateHeader;

router.post("/signup", authenticateHeader, api.signup);
router.post("/login", authenticateHeader, api.login);
router.post("/socialLogin", authenticateHeader, api.socialLogin);

router.get("/getProfile", authenticateJWT, authenticateHeader, api.getProfile);
router.get("/getCmsList", authenticateHeader, api.getCmsList);
router.post("/logout", authenticateHeader, authenticateJWT, api.logOut);
router.get(
  "/deleteAccount",
  authenticateHeader,
  authenticateJWT,
  api.deleteAccount
);
router.post(
  "/changePass",
  authenticateHeader,
  authenticateJWT,
  api.changePassword
);

router.post("/forgotPassword", authenticateHeader, api.forgotPassword);
router.get("/resetPassword/:id/:ran_token", api.resetPassword);
router.post("/updateForgotPassword", api.updateForgetPassword);
router.get("/success", api.successMsg);
router.get("/linkExpired", api.linkExpired);
router.post("/otpVerify", api.otpVerify);
router.post("/resendOtp", api.resendOtp);
router.post("/contactUs", authenticateHeader, api.contactUs);
router.post(
  "/NotificationStatus",
  authenticateHeader,
  authenticateJWT,
  api.NotificationStatus
);

router.get(
  "/notificationsList",
  authenticateHeader,
  authenticateJWT,
  api.notificationsList
);
router.get(
  "/clearNotifications",
  authenticateHeader,
  authenticateJWT,
  api.clearAllNotifications
);

router.post(
  "/editProfile",
  authenticateJWT,
  authenticateHeader,
  api.editProfile
);
router.get(
  "/getVideos",
  authenticateJWT,
  authenticateHeader,
  api.getRandomVideos
);
router.get(
  "/getCategories",
  authenticateJWT,
  authenticateHeader,
  api.getCategoryList
);
router.get(
  "/getRoomCategories/:id",
  authenticateJWT,
  authenticateHeader,
  api.getRoomCat
);
router.get(
  "/taskFilter/:id",
  authenticateJWT,
  authenticateHeader,
  api.taskFilter
);
router.get(
  "/getTaskDetails/:id",
  authenticateJWT,
  authenticateHeader,
  api.getTaskDetails
);
router.post("/createTask", authenticateJWT, authenticateHeader, api.createTask);

router.post(
  "/createCustomTask",
  authenticateJWT,
  authenticateHeader,
  api.createCustomTask
);
router.post("/deleteTask", authenticateJWT, authenticateHeader, api.deleteTask);
router.post("/updateTask", authenticateJWT, authenticateHeader, api.updateTask);
router.post(
  "/isTaskCompleted",
  authenticateJWT,
  authenticateHeader,
  api.isTaskCompleted
);

router.post(
  "/updateCustomTask",
  authenticateJWT,
  authenticateHeader,
  api.updateCustomTask
);

router.get("/tasksList", authenticateJWT, authenticateHeader, api.getTasksList);
router.get(
  "/getTaskList",
  authenticateJWT,
  authenticateHeader,
  api.getTaskList
);
// router.get("/contactUs", authenticateJWT, authenticateHeader, api.contactUs);
router.get("/testFcm", authenticateJWT, authenticateHeader, api.testFcm);
router.get("/test", api.test);

module.exports = router;
