const helper = require("../helper/helper");
const { Validator } = require("node-input-validator");
// var aes256 = require("aes256");
var CryptoJS = require("crypto-js");
const moment = require("moment");
const db = require("../models");
const fileUpload = require("express-fileupload");
const { Op } = require("sequelize");
const env = require("dotenv").config();

const secretcryptokey = "BestiltCrypto@_Secret_KEY";
var ciphertext = CryptoJS.AES.encrypt("123456", secretcryptokey).toString();

// Decrypt

// var bytes = CryptoJS.AES.decrypt(ciphertext, secretcryptokey);
// var originalText = bytes.toString(CryptoJS.enc.Utf8);
// var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
// console.log(ciphertext);

module.exports = {
  userList: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      const users = await db.users.findAll({
        where: { type: "1", idDelete: 0 },
      });
      let title = "Users List";
      res.render("dashboard/usersTable/userTable", { title, users });
    } catch (error) {
      console.log(error);
    }
  },

  userDetails: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      const userInfo = await db.users.findOne({
        where: { id: req.params.id },
        raw: true,
        nest: true,
        attributes: {
          exclude: [
            "password",
            "createdAt",
            "updatedAt",
            "idDelete",
            "token",
            "deviceToken",
            "socialId",
            "otp",
          ],
        },
      });
      console.log(
        "🚀 ~ file: userControllers.js:43 ~ userDetails: ~ userInfo:",
        userInfo
      );
      let title = "editCategory";

      res.render("dashboard/usersTable/userDetailsPage", { userInfo, title });
    } catch (error) {
      console.log(error);
    }
  },

  userStatus: async (req, res) => {
    try {
      console.log(req.body, "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFffffffff");
      let update = await db.users.update(
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
  userDelete: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      console.log("test",req.params)
      const deleteUser=await db.users.destroy(  
      {
        where: {
          id: req.body.id,
        },
      })
      if(deleteUser){
        const users = await db.users.findAll({
          where: { type: "1", idDelete: 0 },
        });
        let title = "Users List";
        res.render("dashboard/usersTable/userTable", { title, users });
      }
     
    } catch (error) {
      console.log(error);
    }
  },
};
