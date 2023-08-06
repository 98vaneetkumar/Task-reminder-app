const helper = require("../helper/helper");
const { Validator } = require("node-input-validator");
// var aes256 = require("aes256");
var CryptoJS = require("crypto-js");
const moment = require("moment");
const db = require("../models");
const fileUpload = require("express-fileupload");
const { Op } = require("sequelize");
const env = require("dotenv").config();
const Chart = require("chart.js/auto");
const secretcryptokey = "BestiltCrypto@_Secret_KEY";
var ciphertext = CryptoJS.AES.encrypt("123456", secretcryptokey).toString();

// Decrypt

// var bytes = CryptoJS.AES.decrypt(ciphertext, secretcryptokey);
// var originalText = bytes.toString(CryptoJS.enc.Utf8);
// var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
// console.log(ciphertext);

module.exports = {
  login: async (req, res) => {
    try {
      if (req.session.user) {
        res.redirect("/admin/dashboard");
      }

      res.render("dashboard/auth/login", {
        layout: false,
      });
    } catch (error) {
      helper.error(res, error);
    }
  },

  loginPost: async (req, res) => {
    try {
      console.log("object");
      const email = req.body.email;
      const passwrd = req.body.password;
      console.log("email===>",email)
      const checkEmail = await db.users.findOne({
        where: {
          email: email,
          type: "0",
        },
      });
      if (checkEmail) {
        var passwordBytes = CryptoJS.AES.decrypt(
          checkEmail.password,
          secretcryptokey
        );

        var originalText = passwordBytes.toString(CryptoJS.enc.Utf8);

        if (originalText == passwrd) {
          // req.session = req.session;
          req.session.user = checkEmail.dataValues;
          return res.json(1);
        } else {
          return res.json(" Invalid Credentials");
        }
      } else {
        return res.json(" Invalid Credentials");
      }
    } catch (err) {
      console.log(err);
    }
  },

  logout: async (req, res) => {
    try {
      req.session.destroy((err) => {});
      res.redirect("/admin/login");
    } catch (error) {
      helper.error(res, error);
    }
  },

  dashboard: async (req, res) => {
    if (!req.session.user) return res.redirect("/admin/login");

    var urlsArr = req.headers.referer.split("/");
    var message = "";
    if (urlsArr[4] == "login") {
      message = "Login successfully";
    }
    const users = await db.users.count({
      where: {
        [Op.not]: { type: "0" },
      },
    });

    let category = await db.category.count();
    let videos = await db.videos.count();
    let roomCat = await db.roomCategories.count();
    let roomSubCat = await db.roomSubCategories.count();
    let task = await db.tasks.count({ where: { createdBy: "0" } });
    let usersTask = await db.tasks.count({
      where: {
        [Op.not]: { createdBy: "0" },
      },
    });

    const title = "dashboard";
    res.render("dashboard/auth/dashboard", {
      title,
      message,
      users,
      category,
      videos,
      roomCat,
      roomSubCat,
      task,
      usersTask,
    });
  },

  profilePage: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      const admindata = await db.users.findOne({
        where: { id: req.session.user.id },
      });
      let title = "editCategory";

      res.render("dashboard/auth/profilePage", { admindata, moment, title });
    } catch (error) {
      helper.error(res, error);
    }
  },

  profileUpdate: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      let title = "editCategory";

      res.render("dashboard/auth/profileUpdate", { moment, title });
    } catch (error) {
      helper.error(res, error);
    }
  },

  updateProfile: async (req, res) => {
    try {
      console.log(req.body);
      const v = new Validator(req.body, {
        name: "required",
        // email: "required",
        mobile: "required",
        // gender: "required",
      });
      // var update = {
      //   name: req.body.name,
      //   email: req.body.email,
      //   mobile: req.body.mobile,
      //   address: req.body.address,
      //   gender: req.body.gender,
      //   birth_date: req.body.dob,
      // };

      const values = JSON.parse(JSON.stringify(v));
      let errorsResponse = await helper.checkValidation(v);

      if (errorsResponse) {
        return helper.failed(res, errorsResponse);
      }
      if (req.files && req.files.image) {
        var image = req.files.image;

        if (image) {
          values.inputs.image =await helper.fileUpload(image, "profile");
        }
      }
      const updatedata = await db.users.update({image:values.inputs.image}, {
        where: { id: req.body.id },
      });

      const addsession = await db.users.findOne({
        where: {
          email: req.session.user.email,
        },
      });

      req.session.user = addsession;

      res.redirect("/admin/profile");
    } catch (error) {
      helper.error(res, error);
    }
  },

  changePass: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      let title = "editCategory";

      res.render("dashboard/auth/changePass", { title });
    } catch (error) {
      helper.error(res, error);
    }
  },

  changePassUpdate: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        curruntPass: "required",
        newPass: "required",
        confirmNewPass: "required|same:newPass",
      });

      const values = JSON.parse(JSON.stringify(v));

      let errorsResponse = await helper.checkValidation(v);

      if (errorsResponse) {
        return helper.failed(res, errorsResponse);
      }

      const findPass = await db.users.findOne({
        where: { id: req.session.user.id },
      });
      if (findPass) {
        var passwordBytes = await CryptoJS.AES.decrypt(
          findPass.password,
          secretcryptokey
        );

        var originalText = await passwordBytes.toString(CryptoJS.enc.Utf8);

        // const data = await bcrypt.compare(passwrd, findPass.password);
        if (originalText == values.inputs.curruntPass) {
          var cipherPass = await CryptoJS.AES.encrypt(
            values.inputs.confirmNewPass,
            secretcryptokey
          ).toString();
          const signdata = await db.users.update(
            {
              password: cipherPass,
            },
            { where: { id: req.session.user.id }, type: 0 }
          );

          res.redirect("/admin/profile");
        } else {
          console.log("password Not Matched ");
          res.redirect("/admin/changePass");
        }
      }
    } catch (error) {
      helper.error(res, error);
    }
  },

  updateUserPost: async (req, res) => {
    try {
      const updateData = {
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
        birth_date: req.body.dob,
        address: req.body.address,
        mobile: req.body.mobile,
      };

      if (req.files && req.files.image) {
        var image = req.files.image;
        if (image) {
          updateData.image = helper.fileUpload(image, "userImg");
        }
      }
      const data = await db.users.update(updateData, {
        where: { id: req.body.id },
        type: "1",
      });
      if (data) {
      }
      res.redirect("/admin/userlist");
    } catch (error) {
      helper.error(res, error);
    }
  },

  updateUser: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      const userData = await db.users.findOne({
        where: { id: req.params.id },
      });
      let title = "editCategory";

      res.render("dashboard/usersTable/updateUser", { userData, title });
    } catch (error) {
      helper.error(res, error);
    }
  },

  userStatus: async (req, res) => {
    try {
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
        res.json(1);
      } else {
        res.json(0);
      }
    } catch (err) {
      throw err;
    }
  },

  deleteuser: async (req, res) => {
    const deldata = await db.users.destroy({
      where: { id: req.params.id },
    });
    res.redirect("/admin/userlist");
  },

  termsAndConditions: async (req, res) => {
    if (!req.session.user) return res.redirect("/admin/login");
    const content = await db.cms.findOne({ where: { id: 1 } });
    let title = "editCategory";

    res.render("dashboard/page/termsAndConditions", {
      content,
      title,
    });
  },

  termsAndConditionsUpdate: async (req, res) => {
    await db.cms.update(
      {
        content: req.body.content,
        title: req.body.title,
      },
      { where: { id: req.body.id } }
    );
    res.redirect("/admin/termsAndConditions");
  },

  privacyPolicy: async (req, res) => {
    if (!req.session.user) return res.redirect("/admin/login");
    const content = await db.cms.findOne({ where: { id: 2 } });
    let title = "editCategory";

    res.render("dashboard/page/privacyPolicy", {
      content,
      title,
    });
  },

  privacyPolicyUpdate: async (req, res) => {
    await db.cms.update(
      {
        content: req.body.content,
        title: req.body.title,
      },
      { where: { id: req.body.id } }
    );
    res.redirect("/admin/privacyPolicy");
  },

  aboutUs: async (req, res) => {
    if (!req.session.user) return res.redirect("/admin/login");
    const content = await db.cms.findOne({ where: { id: 3 } });
    let title = "editCategory";

    res.render("dashboard/page/aboutUs", {
      content,
      title,
    });
  },

  aboutUsUpdate: async (req, res) => {
    await db.cms.update(
      {
        content: req.body.content,
        title: req.body.title,
      },
      { where: { id: req.body.id } }
    );
    res.redirect("/admin/aboutUs");
  },

  verificationPatient: async (req, res) => {
    try {
      const data = await db.users.update(
        {
          isVerify: req.body.value,
        },
        { where: { id: req.body.id } }
      );
      if (data) {
        res.json(1);
      }
    } catch (error) {}
  },

  test: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      const bookingInfo = await db.bookings.findOne({
        where: { id: 3 },
        include: [
          {
            model: db.users,
            as: "doctor_detail",
          },
          {
            model: db.users,
            as: "patient_detail",
          },
        ],
      });
      let title = "editCategory";

      res.render("dashboard/test", { bookingInfo, title });
    } catch (error) {
      console.log(error);
    }
  },

  emailExist: async (req, res) => {
    try {
      console.log(req.body);
    } catch (error) {
      console.log(error);
    }
  },

  checkpass: async (req, res) => {
    try {
      const checkPassword = await db.users.findOne({
        where: { id: req.session.user.id },
      });
      if (checkPassword) {
        var passwordBytes = CryptoJS.AES.decrypt(
          checkPassword.password,
          secretcryptokey
        );
        var originalText = passwordBytes.toString(CryptoJS.enc.Utf8);
        if (originalText == req.body.curruntPass) {
          return res.json(true);
        } else {
          return res.json(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
};
