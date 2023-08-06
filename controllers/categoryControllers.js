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
  categoryList: async (req, res) => {
    try {
      let title = "categoryList";
      if (!req.session.user) return res.redirect("/admin/login");

      let category = await db.category.findAll({ order: [["id", "DESC"]] });

      console.log(category, ";l;;lkkkkkkkkkkkkkkkkkkkkkkl;;");

      res.render("dashboard/category/categoryList", { category, title });
    } catch (error) {
      console.log(error);
    }
  },

  addCategoryPage: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      let title = "addCategory";
      res.render("dashboard/category/addCategoryPage", { title });
    } catch (error) {
      console.log(error);
    }
  },

  editCategory: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      const data = await db.category.findOne({ where: { id: req.body.id } });
      res.json(data);
      // res.render("dashboard/category/category_list", { data });
    } catch (error) {
      console.log(error);
    }
  },
  addCategory: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      await db.category.create({ name: req.body.name });
      let title = "editCategory";
      res.redirect("/admin/category_list");
    } catch (error) {
      console.log(error);
    }
  },
  updateCategory: async (req, res) => {
    try {
      await db.category.update(
        { name: req.body.name },
        { where: { id: req.body.id } }
      );

      res.redirect("/admin/category_list");
    } catch (error) {
      console.log(error);
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const result = await db.category.destroy({ where: { id: req.body.id } });

      if (result) {
        res.json(1);
      } else {
        res.json(0);
      }
    } catch (error) {
      console.log(error);
    }
  },
  categoryStatus: async (req, res) => {
    try {
      console.log(req.body, "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFffffffff");
      let update = await db.category.update(
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
        // req.flash("flashMessage", {
        //   color: "success",
        //   message: "Status updated successfully",
        // });
        res.json(1);
      } else {
        res.json(0);
      }
    } catch (err) {
      throw err;
    }
  }, 
 
  // ==================================    subscription    ========================================
  SubscriptionList: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      const plans = await db.subscriptionPlans.findAll({
        order: [["id", "DESC"]],

        raw: true, 
        nest: true,
      });
      console.log("subscriptionplan ",plans)
      let title = "editCategory";
      res.render("dashboard/plans/plansTable", { plans, title });
    } catch (error) {
      console.log(error);
    }
  },
  addSubscription: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      let title = "editCategory";

      res.render("dashboard/plans/addPlan", { title });
    } catch (error) {
      console.log(error);
    }
  },
  addPlan: async (req, res) => {
    try { 
      await db.subscriptionPlans.create({
        price: req.body.price,
        validity: req.body.validity,
        description:req.body.description,
        packageName:req.body.packageName
      });
      res.redirect("/admin/plans_list");
    } catch (error) {
      console.log(error);
    }
  },
  editSubscription: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      const data = await db.subscriptionPlans.findOne({
        where: { id: req.params.id },
      });
      let title = "editCategory";

      res.render("dashboard/plans/addPlan", { data, title });
    } catch (error) {
      console.log(error);
    }
  },
  subscriptionStatus: async (req, res) => {
    try {
      console.log(req.body, "subscriptionPlans");
      let update = await db.subscriptionPlans.update(
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
  editPlan: async (req, res) => {
    try {
      await db.subscriptionPlans.update(
        {
          price: req.body.price,
          validity: req.body.validity,
        },
        { where: { id: req.body.id } }
      );
      res.redirect("/admin/plans_list");
    } catch (error) {
      console.log(error);
    }
  },
  deletePlan: async (req, res) => {
    try {
      const result = await db.subscriptionPlans.destroy({
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
};
