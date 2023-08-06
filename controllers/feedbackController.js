const helper = require("../helper/helper");
const { Validator } = require("node-input-validator");
var CryptoJS = require("crypto-js");
const moment = require("moment");
const db = require("../models");
const fileUpload = require("express-fileupload");
const { Op } = require("sequelize");
const env = require("dotenv").config();
const nodemailer = require("nodemailer");
module.exports = {
  list: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      var title = "Feedback List";

      var feeds = await db.feedback.findAll();
      res.render("dashboard/feedback/list", { feeds, title });
    } catch (error) {
      console.log(error);
    }
  },
  feedbackView: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      let title = "Feedback View";
      let data = await db.feedback.findOne({
        where: { id: req.params.id },
        raw: true,
        nest: true,
      });
      res.render("dashboard/feedback/view", { title, data });
    } catch (error) {
      console.log(error);
    }
  },
  deleteFeed: async (req, res) => {
    const result = await db.feedback.destroy({
      where: { id: req.body.id },
    });
    if (result) {
      res.json(1);
    } else {
      res.json(0);
    }
  },

//   sendFeed: async (req, res) => {
//     try {

//       // [{"name":"title","value":"teat"},
//       // {"name":"email","value":"ashu@gmail.com"},{"name":"solution","value":"tertew"}]
//       console.log("req.body",req.body.data)
//       var transporter = nodemailer.createTransport({
//         host: "smtp.mailtrap.io",
//         port: 2525,
//         auth: {
//           user: "28182524df1f82",
//           pass: "6a2bf03dbde623",
//         },
//       });

//       // send mail with defined transport object
//       let info = await transporter.sendMail({
//         from: '" 👻" mailto:malkeet@example.com',
//         // to:req.body.email,
//         to: req.body.data[1].value,
//         // subject: req.body.title,
//         subject: req.body.data[0].value,
//         // text: req.body.solution,
//         text: req.body.data[2].value,
//         // html: forgot_password_html,
//       });

//    const dataReturn=  await db.feedback.update(
//         {
//           isReplied: 1,
//           // solution: req.body.solution,
//           // title: req.body.title,
//           solution:req.body.data[2].value,
//           title:req.body.data[0].value,
//         },
//         // { where: { email: req.body.email, isReplied: 0 } }
//         { where: { email: req.body.data[1].value, isReplied: 0 } }
//       );
// console.log("dataReturn=>>>",dataReturn)
//       res.redirect("/admin/feedList");
//     } catch (error) {
//       console.log(error);
//     }
//   },
sendFeed: async (req, res) => {
  try {
    const formData = JSON.parse(req.body.data);
    console.log("formData", formData);

    // Extract the necessary values from formData
    const title = formData.find(item => item.name === "title")?.value || "";
    const email = formData.find(item => item.name === "email")?.value || "";
    const solution = formData.find(item => item.name === "solution")?.value || "";
console.log("email----",email)
    var transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "28182524df1f82",
        pass: "6a2bf03dbde623",
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"👻" mailto:malkeet@example.com',
      to: email,
      subject: title,
      text: solution,
    });

    // Update the feedback record in the database
    const dataReturn = await db.feedback.update(
      {
        isReplied: 1,
        solution: solution,
        title: title,
      },
      { where: { email: email, isReplied: 0 } }
    );

    console.log("dataReturn=>>>", dataReturn);
    res.redirect("/admin/feedList");
    // return true
  } catch (error) {
    console.log(error);
  }
},


};
