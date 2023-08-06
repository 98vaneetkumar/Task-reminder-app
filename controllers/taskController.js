const helper = require("../helper/helper");
const { Validator } = require("node-input-validator");
// var aes256 = require("aes256");
var CryptoJS = require("crypto-js");
const moment = require("moment");
const db = require("../models");
const fileUpload = require("express-fileupload");
const { Op } = require("sequelize");
const env = require("dotenv").config();

module.exports = {
  roomCategoryList: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      const roomCats = await db.roomCategories.findAll({
        include: [
          {
            model: db.category,
            as: "category",
            attributes: ["id", "name"],
          },
        ],
        order: [["id", "DESC"]],

        raw: true,
        nest: true,
      });
      console.log(
        "🚀 ~ file: taskController.js:22 ~ roomCategoryList: ~ roomCats:",
        roomCats
      );
      let title = "editCategory";

      res.render("dashboard/tasks/roomCategoryTable", { roomCats, title });
    } catch (error) {
      console.log(error);
    }
  },
  roomCategoryStatus: async (req, res) => {
    try {
      console.log(req.body, "subscriptionPlans");
      let update = await db.roomCategories.update(
        {
          status: req.body.status,
        },
        {
          where: {
            id: req.body.id,
          },
        }
      );

      if (update) {
        res.json(1);
      } else {
        res.json(0);
      }
    } catch (err) {
      throw err;
    }
  },
  addRoomCategory: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      let title = "editCategory";
      let category = await db.category.findAll({ order: [["id", "DESC"]] });
      res.render("dashboard/tasks/roomCategoryAdd", { title, category });
    } catch (error) {
      console.log(error);
    }
  },
  addRoomCategoryPost: async (req, res) => {
    try {
      await db.roomCategories.create({
        name: req.body.name,
        catId: req.body.catId,
      });
      res.redirect("/admin/room_category_list");
    } catch (error) {
      console.log(error);
    }
  },
  editRoomCat: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      let category = await db.category.findAll({ order: [["id", "DESC"]] });

      let data = await db.roomCategories.findOne({
        include: [
          {
            model: db.category,
            as: "category",
            attributes: ["id", "name"],
          },
        ],
        where: { id: req.params.id },
        raw: true,
        nest: true,
      });
      let title = "editCategory";

      res.render("dashboard/tasks/roomCategoryAdd", { data, title, category });
    } catch (error) {
      console.log(error);
    }
  },

  editRoomCatPost: async (req, res) => {
    try {
      console.log(
        "🚀 ~ file: taskController.js:84 ~ editRoomCatPost: ~ req.body:",
        req.body
      );
      await db.roomCategories.update(
        { name: req.body.name, catId: req.body.catId },
        { where: { id: req.body.id } }
      );
      res.redirect("/admin/room_category_list");
    } catch (error) {
      console.log(error);
    }
  },

  deleteRoomCat: async (req, res) => {
    try {
      const result = await db.roomCategories.destroy({
        where: { id: req.body.id },
      });

      if (result) {
        res.json(1);
      } else {
        res.json(0);
      }
    } catch (error) {
      console.log(error);
    }
  },

  roomSubCategoryList: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      console.log("fdafafaf");
      const roomSubCats = await db.roomSubCategories.findAll({
        include: [
          {
            model: db.roomCategories,
            as: "roomCat",
          },
        ],
        order: [["id", "DESC"]],
        raw: true,
        nest: true,
      });
      console.log(
        "🚀 ~ file: taskController.js:122 ~ roomSubCategoryList: ~ roomSubCats:",
        roomSubCats
      );
      let title = "editCategory";

      res.render("dashboard/tasks/roomSubCategoryTable", {
        roomSubCats,
        title,
      });
    } catch (error) {
      console.log(error);
    }
  },
  roomSubCategoryStatus: async (req, res) => {
    try {
      console.log(req.body, "subscriptionPlans");
      let update = await db.roomSubCategories.update(
        {
          status: req.body.status,
        },
        {
          where: {
            id: req.body.id,
          },
        }
      );

      if (update) {
        res.json(1);
      } else {
        res.json(0);
      }
    } catch (err) {
      throw err;
    }
  },

  addRoomSubCategory: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      const roomCats = await db.roomCategories.findAll({
        raw: true,
        nest: true,
      });
      let title = "editCategory";
      const category = await db.category.findAll({ raw: true, nest: true });
      res.render("dashboard/tasks/roomSubCategoryAdd", {
        category,
        roomCats,
        title,
      });
    } catch (error) {
      console.log(error);
    }
  },
  addRoomSubCategoryPost: async (req, res) => {
    try {
      await db.roomSubCategories.create({
        name: req.body.name,
        roomCategoryId: req.body.roomCat,
      });
      res.redirect("/admin/room_subcategory_list");
    } catch (error) {
      console.log(error);
    }
  },
  editRoomSubCat: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      const data = await db.roomSubCategories.findOne({
        include: [
          {
            model: db.roomCategories,
            as: "roomCat",
          },
        ],
        where: { id: req.params.id },
        raw: true,
        nest: true,
      });

      const roomCats = await db.roomCategories.findAll({
        raw: true,
        nest: true,
      });
      const category = await db.category.findAll({ raw: true, nest: true });

      let title = "editCategory";

      res.render("dashboard/tasks/roomSubCategoryAdd", {
        data,
        roomCats,
        category,
        title,
      });
    } catch (error) {
      console.log(error);
    }
  },
  findRoomCatWithCatId: async (req, res) => {
    try {
      const roomCats = await db.roomCategories.findAll({
        where: { catId: req.body.catId },
      });
      res.json(roomCats);
    } catch (error) {
      console.log(error);
    }
  },
  editRoomSubCatPost: async (req, res) => {
    try {
      await db.roomSubCategories.update(
        { name: req.body.name, roomCatId: req.body.roomCat },
        { where: { id: req.body.id } }
      );
      res.redirect("/admin/room_subcategory_list");
    } catch (error) {
      console.log(error);
    }
  },
  deleteRoomSubCat: async (req, res) => {
    try {
      const result = await db.roomSubCategories.destroy({
        where: { id: req.body.id },
      });

      if (result) {
        res.json(1);
      } else {
        res.json(0);
      }
    } catch (error) {
      console.log(error);
    }
  },

  createTaskPage: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      const roomCats = await db.roomCategories.findAll({
        raw: true,
        nest: true,
      });
      let title = "editCategory";

      res.render("dashboard/tasks/taskAdd", { roomCats, title });
    } catch (error) {
      console.log(error);
    }
  },

  createTask: async (req, res) => {
    try {
      await db.tasks.create({
        title: req.body.title,
        type: req.body.roomCatId,
        createdBy: 0,
        categoryId: 0,
        isCompleted: 0,
      });

      res.redirect("/admin/tasks_list");
    } catch (error) {
      console.log(error);
    }
  },
  taskList: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      const tasks = await db.tasks.findAll({
        include: [
          {
            model: db.roomCategories,
            as: "roomCat",
          },
        ],
        order: [["id", "DESC"]],

        where: { createdBy: 0 },
      });
      let pageType = 1;
      let title = "editCategory";

      res.render("dashboard/tasks/taskList", {
        tasks,
        title,
        pageType,
      });
    } catch (error) {
      console.log(error);
    }
  },
  taskList2: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let pageType = 2;

      const tasks = await db.tasks.findAll({
        include: [
          {
            model: db.roomCategories,
            as: "roomCat",
          },
          {
            model: db.users,
            as: "user",
          },
        ],
        order: [["id", "DESC"]],

        where: {
          [Op.not]: { createdBy: 0 },
        },
      });
      console.log(
        "🚀 ~ file: taskController.js:308 ~ taskList2: ~ tasks:",
        tasks
      );
      let title = "editCategory";

      res.render("dashboard/tasks/taskList", {
        tasks,
        title,
        pageType,
      });
    } catch (error) {
      console.log(error);
    }
  },

  editTask: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      const roomCats = await db.roomCategories.findAll({
        raw: true,
        nest: true,
      });

      const data = await db.tasks.findOne({
        include: [
          {
            model: db.roomCategories,
            as: "roomCat",
          },
        ],
        where: { id: req.params.id },
        raw: true,
        nest: true,
      });
      let title = "editCategory";

      res.render("dashboard/tasks/taskAdd", { roomCats, data, title });
    } catch (error) {
      console.log(error);
    }
  },

  updateTask: async (req, res) => {
    try {
      await db.tasks.update(
        { title: req.body.title, type: req.body.roomCatId },
        { where: { id: req.body.id } }
      );

      res.redirect("/admin/tasks_list");
    } catch (error) {
      console.log(error);
    }
  },

  deletePreTask: async (req, res) => {
    try {
      const result = await db.tasks.destroy({ where: { id: req.body.id } });
      if (result) {
        res.json(1);
      } else {
        res.json(0);
      }
    } catch (error) {
      console.log(error);
    }
  },
  deleteUserTask: async (req, res) => {
    try {
      await db.tasks.destroy({ where: { id: req.body.id } });

      const result = await db.taskToDo.destroy({
        where: { taskId: req.body.id },
      });

      if (result) {
        res.json(1);
      } else {
        res.json(0);
      }
    } catch (error) {
      console.log(error);
    }
  },
  viewTask: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      const task = await db.tasks.findAll({
        include: [
          {
            model: db.roomCategories,
            as: "roomCat",
          },
          {
            model: db.tasksToDo,
            as: "task",
            // include: [{ model: db.category, as: "category" }],
          },
        ],
        order: [["id", "DESC"]],

        where: { id: req.params.id },
        raw: true,
        nest: true,
      });
      console.log("🚀 ~ file: taskController.js:416 ~ viewTask: ~ task:", task);
      let title = "editCategory";

      res.render("dashboard/tasks/taskView", { task, moment, title });
    } catch (error) {
      console.log(error);
    }
  },
};
