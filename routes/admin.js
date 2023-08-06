var express = require("express");
var router = express.Router();
const admin = require("../controllers/adminControllers");
const user = require("../controllers/userControllers");
const category = require("../controllers/categoryControllers");
const task = require("../controllers/taskController");
const video = require("../controllers/videoControllers");
const feedbackController = require("../controllers/feedbackController");
router.get("/login", admin.login);
router.post("/login", admin.loginPost);
router.get("/logout", admin.logout);
router.get("/dashboard", admin.dashboard);
router.get("/profile", admin.profilePage);
router.get("/profileUpdate", admin.profileUpdate);
// router.post("/profileUpdate", admin.updateProfile);
router.post("/updateProfile", admin.updateProfile);

router.get("/changePassword", admin.changePass);
router.post("/checkpass", admin.checkpass);
router.post("/changePassword", admin.changePassUpdate);
router.get("/termsAndConditions", admin.termsAndConditions);
router.post("/termsAndConditions", admin.termsAndConditionsUpdate);

router.get("/privacyPolicy", admin.privacyPolicy);
router.post("/privacyPolicy", admin.privacyPolicyUpdate);

router.get("/aboutUs", admin.aboutUs);
router.post("/aboutUs", admin.aboutUsUpdate);

// ===========================================================================================

router.get("/userList", user.userList);
router.get("/userDetails/:id", user.userDetails);
router.post("/status", user.userStatus);
router.post("/deleteUser", user.userDelete);

// ===========================================================================================

router.get("/category_list", category.categoryList);
router.post("/categoryStatus", category.categoryStatus);
router.get("/add_category", category.addCategoryPage);
router.post("/add_category", category.addCategory);
router.post("/get_category", category.editCategory);
router.post("/edit_category", category.updateCategory);
router.post("/delete_category", category.deleteCategory);
// ===========================================================================================
router.get("/plans_list", category.SubscriptionList);
router.get("/subscription", category.addSubscription);
router.post("/subscription", category.addPlan); 
router.post("/subscriptionStatus", category.subscriptionStatus);
router.get("/subscription/:id", category.editSubscription);
router.post("/edit_plan", category.editPlan);
router.post("/delete_plan", category.deletePlan);
// ===========================================================================================
router.get("/room_category_list", task.roomCategoryList);
router.get("/room_category_status", task.roomCategoryStatus);
router.get("/add_room_category", task.addRoomCategory);
router.post("/add_room_category", task.addRoomCategoryPost);
router.get("/edit_room_category/:id", task.editRoomCat);
router.post("/edit_room_category", task.editRoomCatPost);
router.post("/deleteRoomCat", task.deleteRoomCat);

router.get("/room_subcategory_list", task.roomSubCategoryList)
router.post("/room_subcategory_status", task.roomSubCategoryStatus);;
router.get("/add_room_sub_category", task.addRoomSubCategory);
router.post("/add_room_sub_category", task.addRoomSubCategoryPost);
router.get("/edit_room_sub_category/:id", task.editRoomSubCat);
router.post("/edit_room_sub_category", task.editRoomSubCatPost);
router.post("/deleteRoomSubCat", task.deleteRoomSubCat);

// ===========================================================================================

router.get("/create_task", task.createTaskPage);
router.post("/create_task", task.createTask);
router.get("/tasks_list", task.taskList);
router.get("/tasks_list2", task.taskList2);
router.get("/edit_task/:id", task.editTask);
router.post("/edit_task", task.updateTask);
router.post("/delete_pre_task", task.deletePreTask);
router.post("/delete_User_task", task.deleteUserTask);
router.get("/view_task/:id", task.viewTask);

// ===========================================================================================
router.get("/videos_list", video.videosList);
router.get("/add_video", video.addVideo);
router.post("/add_video", video.addVideos);
router.get("/edit_video/:id", video.editVideo);
router.post("/editVideo", video.updateVideo);
router.post("/deleteVideo", video.deleteVideo);
// ===========================================================================================

router.get("/feedList", feedbackController.list);
router.get("/feedbackView/:id", feedbackController.feedbackView);
router.post("/deleteFeed", feedbackController.deleteFeed);
router.post("/sendFeed", feedbackController.sendFeed);

module.exports = router;
