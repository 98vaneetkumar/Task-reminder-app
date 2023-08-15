const helper = require("../../helper/helper");
const { Validator } = require("node-input-validator");
var CryptoJS = require("crypto-js");
var jwt = require("jsonwebtoken");
const db = require("../../models");
require("dotenv").config();
const Sequelize = require("sequelize");
const { Op, literal } = require("sequelize");
const nodemailer = require("nodemailer");
const secretCryptoKey = process.env.secretKey;
const twilio = require("twilio");
var CronJob = require("cron").CronJob;
var FCM = require("fcm-node");
const { json } = require("sequelize");
const moment = require("moment");
const schedule = require("node-schedule");

// var abc = db.roomCategories;

var accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
const client = require("twilio")(accountSid, authToken, {
  lazyLoading: true,
}); 

async function updateTasks() {
  try {
    const date = new Date();
    const now = moment(date).format("YYYY-MM-DD");
    const reminders = await db.tasksToDo.findAll({
      where: literal(`endTime > '${now}'`), // Using literal to compare dates as raw SQL
    });
    for (const reminder of reminders) {
      const previousDate = moment(date)
        .subtract(reminder.categoryId, "days")
        .format("YYYY-MM-DD");

      // Update tasksToDo table
      await db.tasksToDo.update(
        {
          completedDate: null,
          isCompleted: 0,
        },
        {
          where: {
            taskId: reminder.taskId,
          },
        }
      );

      // Update tasks table
      await db.tasks.update(
        {
          isCompleted: 0,
        },
        {
          where: {
            id: reminder.taskId,
          },
        }
      );
    }

    // return res.status(200).json({ message: "Tasks updated successfully." });
  } catch (error) {
    console.error("Error occurred:", error);
    // return res.status(500).json({ error: "Internal Server Error" });
  }
}
const scheduledTime = "0 30 2 * * *"; // This will run the function at 2:30 AM daily

// Schedule the function to run daily
schedule.scheduleJob(scheduledTime, updateTasks);

// var job = new CronJob(
//   "* * * * * *",
//   function () {
//     console.log("You will see this message every second");
//   },
//   null,
//   true,
//   "America/Los_Angeles"
// );
// ====================================================

// ====================================================

const job = schedule.scheduleJob("0 2 10 * * *", async function (fireDate) {
  const date = new Date();
  const dateToday = moment(date).format("YYYY-MM-DD");
  console.log(
    "first",
    moment(moment(new Date()).format("YYYY-MM-DD")).startOf("day").toDate()
  );
  console.log(
    "end",
    moment(moment(new Date()).format("YYYY-MM-DD")).endOf("day").toDate()
  );

  try {
    const data = await db.notifications.findOne({
      where: {
        date: {
          [Sequelize.Op.gte]: moment(dateToday).startOf("day").toDate(),
          [Sequelize.Op.lte]: moment(dateToday).endOf("day").toDate(),
        },
        isSent: 0,
      },
      raw: true,
      nest: true,
    });
    // console.log("data====>", data);
    // console.log("data====>", data.receiverId);
    if (data) {
      const receiverInfo = await db.users.findOne({
        where: { id: data.receiverId },
        raw: true,
        nest: true,
      });
      console.log("test token", receiverInfo);
      const notifyObj = {
        receiverDeviceToken: receiverInfo.deviceToken,
        // receiverDeviceToken:
        //   "b690591a48ad39f7a1bd1af3d855be6aebefde3bb71087424d4fd1570ed67c2d",
        message: data.message,
        taskId: data.taskId,
        type: receiverInfo.deviceType,
        senderName: "Cleaning App",
        senderImg: "/assets/img/logo1.png",
      };
      // console.log("device token===>", notifyObj);
      const result = await helper.sendPushToIos(notifyObj);
      if (result.sent.length > 0) {
        await db.notifications.update(
          { isSent: true },
          { where: { id: data.id } }
        );
      }
    }

    // console.log("Data:", data);
  } catch (error) {
    console.error("Error:", error);
  }
});

// Define the cron schedule to run every min
const cronSchedule = "* * * * *";

// Schedule the cron job
const jobs = schedule.scheduleJob(cronSchedule, async function () {
  const date = new Date();
  const currentTime = moment(date).format("HH:mm");
  // const currentTime = moment(date).format("HH:mm:ss");
  const currentDay = moment(date).format("dddd").toLowerCase();
 console.log("currettime",currentTime)
 console.log("curretday",currentDay)
  try {
    const notifications = await db.notifications.findAll({
      where: {
        date: {
          [Sequelize.Op.gte]: moment(date).startOf("day").toDate(),
          [Sequelize.Op.lte]: moment(date).endOf("day").toDate(),
        },
        isSent: 0,
      },
      raw: true,
      nest: true,
    });

    for (const data of notifications) {
      const timeMatches = data.time === currentTime;

      // Check if the 'day' field is null or has values
      const daysArray = data.day ? data.day.split(',') : [];
      const dayMatches = daysArray.length === 0 || daysArray.includes(currentDay);

      if (timeMatches && dayMatches) {
        const receiverInfo = await db.users.findOne({
          where: { id: data.receiverId },
          raw: true,
          nest: true,
        });

        const notifyObj = {
          receiverDeviceToken: receiverInfo.deviceToken,
          message: data.message,
          taskId: data.taskId,
          type: receiverInfo.deviceType,
          senderName: "Cleaning App",
          senderImg: "/assets/img/logo1.png",
        };

        const result = await helper.sendPushToIos(notifyObj);
        if (result.sent.length > 0) {
          await db.notifications.update(
            { isSent: true },
            { where: { id: data.id } }
          );
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
});



//Notification send all the schedule user

// const jobs = schedule.scheduleJob("0 1 10 * * *", async function (fireDate) {
//   const date = new Date();
//   const dateToday = moment(date).format("YYYY-MM-DD");
//   const data = await db.notifications.findAll({
//     where: {
//       date: {
//         [Sequelize.Op.gte]: moment(dateToday).startOf("day").toDate(),
//         [Sequelize.Op.lte]: moment(dateToday).endOf("day").toDate(),
//       },
//       isSent: 0,
//     },
//     raw: true,
//     nest: true,
//   });

//   for (const notification of data) {
//     try {
//       console.log("notification send===>", notification.receiverId);
//       const receiverInfo = await db.users.findOne({
//         where: { id: notification.receiverId },
//         raw: true,
//         nest: true,
//       });

//       const notifyObj = {
//         receiverDeviceToken: receiverInfo.deviceToken,
//         message: notification.message,
//         taskId: notification.taskId,
//         type: receiverInfo.deviceType,
//         senderName: "Cleaning App",
//         senderImg: "/assets/img/logo1.png",
//       };
//       console.log("notifiyobj", notifyObj);
//       const result = await helper.sendPushToIos(notifyObj);

//       if (result.sent.length > 0) {
//         await db.notifications.update(
//           { isSent: true },
//           { where: { id: notification.id } }
//         );
//       }
//     } catch (error) {
//       console.error("Error sending notification:", error);
//     }
//   }
// });

module.exports = {
  encryptionForSkPk: async (req, res) => {
    try {
      const v = new Validator(req.headers, {
        secret_key: "required|string",
        publish_key: "required|string",
      });

      let errorsResponse = await helper.checkValidation(v);

      if (errorsResponse) {
        return helper.failed(res, errorsResponse);
      }

      if (
        req.headers.secret_key !== global.secret_key &&
        req.headers.publish_key !== global.publish_key
      ) {
        return helper.failed(res, "Key not matched!");
      }

      //plain text
      let sk_data = global.secret_key;
      let pk_data = global.publish_key;

      //encrypt buffer
      let encryptedSkBuffer = cipher.encrypt(sk_data);
      let encryptedPkBuffer = cipher.encrypt(pk_data);

      // console.log(encryptedSkBuffer,'============encrptioio====')
      // console.log(encryptedPkBuffer,'============encrptioio====')

      //decrypt data
      let decryptedSkBuffer = cipher.decrypt(encryptedSkBuffer);
      encryptedSkBuffer = "sk_" + encryptedSkBuffer;
      // decryptedSkBuffer = decryptedSkBuffer.toString('utf8')
      let decryptedPkBuffer = cipher.decrypt(encryptedPkBuffer);
      encryptedPkBuffer = "pk_" + encryptedPkBuffer;
      // decryptedPkBuffer = decryptedPkBuffer.toString('utf8')

      return helper.success(res, "data", {
        encryptedSkBuffer,
        encryptedPkBuffer,
        decryptedSkBuffer,
        decryptedPkBuffer,
      });
    } catch (err) {
      console.log(err, "------err--------");
    }
  },

  signup: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        name: "required",
        email: "required|email",
        password: "required",
        countryCode: "required",
        mobile: "required",
      });

      const values = JSON.parse(JSON.stringify(v));

      let errorsResponse = await helper.checkValidation(v);

      if (errorsResponse) {
        return helper.failed(res, errorsResponse);
      }

      const isEmailExist = await db.users.findOne({
        where: {
          email: values.inputs.email,
        },
      });

      if (isEmailExist) {
        return helper.failed(res, "Email already registered");
      }

      let isMobileExist = await db.users.findOne({
        where: {
          mobile: values.inputs.mobile,
        },
      });

      if (isMobileExist) {
        return helper.failed(res, "Mobile already registered.");
      }

      if (req.files && req.files.image) {
        var image = req.files.image;

        if (image) {
          image = await helper.fileUpload(image, "profile");
        }
      }

      // var Otp = Math.floor(1000 + Math.random() * 9000);
      Otp = 1111;

      let hash = CryptoJS.AES.encrypt(
        values.inputs.password,
        secretCryptoKey
      ).toString();

      let time = helper.unixTimestamp();

      let dataEnter = await db.users.create({
        name: values.inputs.name,
        email: values.inputs.email,
        type: "1",
        countryCode: values.inputs.countryCode,
        mobile: values.inputs.mobile,
        image: image,
        deviceToken: req.body.deviceToken,
        deviceType: req.body.deviceType,
        loginTime: time,
        firstTimeLogin: 0,
        password: hash,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        otp: Otp,
      });

      const getUser = await db.users.findOne({
        where: { email: dataEnter.email },
        attributes: [
          "id",
          "name",
          "email",
          "countryCode",
          "mobile",
          "image",
          "notifyStatus",
          "deviceType",
          "firstTimeLogin",
          "is_otp_verify",

          "deviceToken",
          "otp",
          "createdAt",
          "updatedAt",
        ],
        raw: true,
        nest: true,
      });

      if (dataEnter) {
        // client.messages
        //   .create({
        //     body: `Your verification code for registration on CleaningApp is ${Otp}`,
        //     from: "+12053749386",
        //     to: "+919877894202",
        //   })
        //   .then((message) => console.log(message.sid));

        let token = jwt.sign(
          {
            data: {
              id: getUser.id,
              name: getUser.name,
              email: getUser.email,
              loginTime: time,
            },
          },
          secretCryptoKey,
          { expiresIn: "30d" }
        );
        // getUser = JSON.parse(JSON.stringify(getUser));
        getUser.token = token;
        delete getUser.password;
        // getUser.is_otp_verify =
        //   getUser.otp == null || getUser.otp == "" ? 1 : 0;
        return helper.success(res, "Signup Successfully", getUser);
      }
    } catch (error) {
      console.log(error);
    }
  },

  login: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        email: "required",
        password: "required",
      });
      console.log("req.body", req.body);
      const values = JSON.parse(JSON.stringify(v));
      let errorsResponse = await helper.checkValidation(v);
      if (errorsResponse) {
        return helper.failed(res, errorsResponse);
      }

      let logData = await db.users.findOne({
        where: { email: v.inputs.email },
      });

      // if (logData.otp !== "") {
      //   return helper.error(res, "please verify otp");
      // }
      if (!logData) {
        return helper.failed(
          res,
          "This email address is not registered with us"
        );
      }

      var bytes = CryptoJS.AES.decrypt(logData.password, secretCryptoKey);

      var originalText = bytes.toString(CryptoJS.enc.Utf8);

      let time = helper.unixTimestamp();

      if (originalText !== values.inputs.password) {
        return helper.failed(res, "Password is incorrect");
      }
      const firstTimeLogin = logData.firstTimeLogin == null ? 0 : 1;
      console.log(req.body, "------>");
      await db.users.update(
        {
          loginTime: time,
          deviceType: req.body.deviceType,
          deviceToken: req.body.deviceToken,
          firstTimeLogin: firstTimeLogin,
          longitude: req.body.longitude,
          latitude: req.body.latitude,
        },
        { where: { id: logData.id } }
      );

      let userInfo = await db.users.findOne({
        where: {
          id: logData.id,
        },
        attributes: [
          "id",
          "name",
          "email",
          "countryCode",
          "mobile",
          "image",
          "notifyStatus",
          "deviceType",
          "is_otp_verify",
          "firstTimeLogin",
          "deviceToken",
          "otp",
          "createdAt",
          "updatedAt",
        ],
        raw: true,
        nest: true,
      });

      let token = jwt.sign(
        {
          data: {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            loginTime: time,
          },
        },
        secretCryptoKey,
        { expiresIn: "30d" }
      );
      userInfo = JSON.stringify(userInfo);
      userInfo = JSON.parse(userInfo);
      userInfo.token = token;
      console.log("🚀 ~ file: authApi.js:401 ~ login: ~ userInfo:", userInfo);
      // userInfo.is_otp_verify =
      //   userInfo.otp == null || userInfo.otp == "" ? 1 : 0;

      // delete userInfo.password;
      return helper.success(res, "User Login Successfully", userInfo);
    } catch (error) {
      console.log(error);
    }
  },

  otpVerify: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        otp: "required",
        mobile: "required",
      });

      let errorsResponse = await helper.checkValidation(v);
      if (errorsResponse) {
        return helper.failed(res, errorsResponse);
      }
      let isMobileExist = await db.users.findOne({
        where: { mobile: req.body.mobile },
      });

      if (isMobileExist) {
        if (req.body.otp == isMobileExist.otp) {
          await db.users.update(
            {
              otp: "",
              is_otp_verify: 1,
            },
            {
              where: { id: isMobileExist.id },
            }
          );
          if (req.body.newNumber) {
            await db.users.update(
              {
                mobile: req.body.newNumber,
              },
              {
                where: { id: isMobileExist.id },
              }
            );
          }
          const userDetail = await db.users.findOne({
            where: { id: isMobileExist.id },
            attributes: [
              "id",
              "name",
              "email",
              "countryCode",
              "mobile",
              "image",
              "otp",
            ],
          });
          userDetail.is_otp_verify == 1;
          return await helper.success(
            res,
            "Verify otp successfully",
            userDetail
          );
        } else {
          return helper.failed(res, "Otp doesn't Matched!");
        }
      } else {
        return helper.failed(res, "mobile doesn't Matched!");
      }
    } catch (error) {
      console.log(error);
      return helper.failed(res, error);
    }
  },

  getProfile: async (req, res) => {
    try {
      const userInfo = await db.users.findOne({
        where: { id: req.user.id },
        attributes: [
          "id",
          "name",
          "email",
          "image",
          "loginTime",
          "mobile",
          "countryCode",
          "status",
        ],
        raw: true,
        nest: true,
      });

      if (userInfo.password) {
        // var bytes = CryptoJS.AES.decrypt(userInfo.password, secretCryptoKey);
        // var originalText = bytes.toString(CryptoJS.enc.Utf8);
        delete userInfo.password;
        delete userInfo.otp;

        // userInfo.password = originalText;
        return helper.success(res, "Profile get Successfully", userInfo);
      }
      return helper.success(res, "Profile get Successfully", userInfo);
    } catch (error) {
      console.log(error);
    }
  },

  getCmsList: async (req, res) => {
    try {
      const v = new Validator(req.query, {
        type: "required",
      });

      if (req.query.type > 3 || req.query.type == 0) {
        return helper.error(
          res,
          "you can type only (1 for Terms & Conditions, 2 for Privacy Policy, 3 for AboutUs)"
        );
      }
      const values = JSON.parse(JSON.stringify(v));

      let errorsResponse = await helper.checkValidation(v);

      if (errorsResponse) {
        return helper.failed(res, errorsResponse);
      }

      let cmsData = await db.cms.findOne({
        where: {
          id: values.inputs.type,
        },
      });
      return helper.success(res, "Success", cmsData);
    } catch (error) {
      return helper.error(res, error);
    }
  },

  logOut: async (req, res) => {
    try {
      await db.users.update(
        { loginTime: "0", deviceToken: "" },
        { where: { id: req.user.id } }
      );
      return helper.success(res, "Logout successfully");
    } catch (error) {
      console.log(error);
    }
  },

  deleteAccount: async (req, res) => {
    try {
      console.log("objectfffffffffffffffffffffffff", req.user);
      await db.users.destroy({ where: { id: req.user.id } });
      return helper.success(res, "Account deleted successfully");
    } catch (error) {
      console.log(error);
    }
  },

  changePassword: async (req, res) => {
    try {
      const id = req.user.id;
      const userInfo = await db.users.findOne({
        where: { id: id },
      });

      var passwordBytes = CryptoJS.AES.decrypt(
        userInfo.password,
        secretCryptoKey
      );

      var originalText = passwordBytes.toString(CryptoJS.enc.Utf8);

      const v = new Validator(req.body, {
        oldPassword: "required",
        newPassword: "required",
      });

      const values = JSON.parse(JSON.stringify(v));

      let errorsResponse = await helper.checkValidation(v);

      if (errorsResponse) {
        return helper.failed(res, errorsResponse);
      }

      if (originalText == values.inputs.oldPassword) {
        if (originalText !== values.inputs.newPassword) {
          var cipherPass = CryptoJS.AES.encrypt(
            values.inputs.newPassword,
            secretCryptoKey
          ).toString();

          await db.users.update(
            {
              password: cipherPass,
            },
            { where: { id: id } }
          );
          return helper.success(res, "Password Changed successfully");
        }
        return helper.failed(
          res,
          "New password should be different from old password"
        );
      } else {
        return helper.failed(res, "Old password not match");
      }
    } catch (error) {
      console.log(error);
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        email: "required|email",
      });
      let errorsResponse = await helper.checkValidation(v);

      if (errorsResponse) {
        return helper.failed(res, errorsResponse);
      }
      const checkEmail = await db.users.findOne({
        where: { email: v.inputs.email },
        raw: true,
        nest: true,
      });

      if (!checkEmail) {
        return await helper.failed(res, "The email is not register with us");
      }

      let ran_token = Math.random().toString(36).substring(2, 25);

      // ==========================check here============================
      let save_data = await db.users.update(
        {
          forgotPasswordToken: ran_token,
        },
        {
          where: { id: checkEmail.id },
        }
      );

      let forgotPasswordUrl = "" + ran_token;
      var baseUrl =
        req.protocol +
        "://" +
        req.get("host") +
        "/api/resetPassword/" +
        checkEmail.id +
        "/" +
        forgotPasswordUrl;

      // ===================================================================================================================

      let forgot_password_html =
        // "Hello " +
        // checkEmail.dataValues.name +
        // ',<br> Your Forgot Password Link is: <a href="' +
        // baseUrl +
        // '"><u>CLICK HERE TO RESET PASSWORD </u></a>. <br><br><br> Regards,<br> ';

        ` <section
      style="background-color: #d9d9d9; padding: 20px; border-radius: 10px"
    >
      <div style="background-color: white; padding: 10px; border-radius: 10px">
        <h3>Hello User363,</h3>
        <p>Your Forgot Password Link is:</p>
        <p style="text-align: center">
          <a
            href="${baseUrl}"
            style="
              color: white;
              background: #14aa78;
              padding: 10px 20px;
              border-radius: 10px;
              text-decoration: none;
              margin: auto;
              display: inline-block;
            "
            >RESET PASSWORD .</a
          >
        </p>

        <p>Regards,</p>
      </div>

      <div style="text-align: center">
        <small
          >Lorem ipsum dolor sit amet <a href="#"> consectetur, </a> adipisicing
          elit. Dicta, maiores?</small
        >
      </div>
    </section>
              
              `;

      // ===================================================================================================================
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
        from: '" 👻" mailto:malkeet@example.com',
        to: v.inputs.email,
        subject: " Forget Password Link ",
        text: "Hello world?",
        html: forgot_password_html,
      });

      // console.log("Message sent: %s", info.messageId);
      return helper.success(res, "Mail sent successfully.");
    } catch (error) {
      console.log(error);
      return helper.failed(res, error);
    }
  },

  resetPassword: async (req, res) => {
    try {
      let token = req.params.ran_token;
      let user_id = req.params.id;
      let checkToken = await db.users.findOne({
        where: {
          forgotPasswordToken: token,
        },
        raw: true,
      });

      if (!checkToken?.forgotPasswordToken) {
        res.redirect("/api/linkExpired");
      } else {
        res.render("dashboard/auth/forgotPassword", {
          token: token,
          id: user_id,
          tokenFound: 1,
          layout: false,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },

  updateForgetPassword: async (req, res) => {
    try {
      let check_token = await db.users.findOne({
        where: { forgotPasswordToken: req.body.token },
      });

      if (check_token?.forgotPasswordToken) {
        const v = new Validator(req.body, {
          password: "required",
          confirm_password: "required|same:password",
        });

        let errorsResponse = await helper.checkValidation(v);
        if (errorsResponse) {
          return await helper.failed(res, errorsResponse);
        }
        var password = v.inputs.password;

        var cipherpassword = CryptoJS.AES.encrypt(
          JSON.stringify(password),
          secretCryptoKey
        ).toString();

        let update_password = await db.users.update(
          {
            password: cipherpassword,
            forgotPasswordToken: "",
          },
          {
            where: { forgotPasswordToken: req.body.token },
          }
        );

        res.redirect("/api/success");
      } else {
        res.redirect("/api/resetPassword/:id/:ran_token", {
          layout: false,
          token: 0,
          id: 0,
          tokenFound: 0,
        });
      }
    } catch (error) {
      console.log(error);
      return helper.failed(res, error);
    }
  },

  successMsg: async (req, res) => {
    try {
      res.render("dashboard/auth/successMsg", { layout: false });
    } catch (error) {
      console.log(error);
    }
  },

  linkExpired: async (req, res) => {
    try {
      res.render("dashboard/auth/linkExpired", { layout: false });
    } catch (error) {
      console.log(error);
    }
  },

  resendOtp: async (req, res) => {
    try {
      // var otp = Math.floor(1000 + Math.random() * 9000);
      var otp = 1111;
      var update_otp = await db.users.update(
        {
          otp: otp,
        },
        {
          where: { mobile: req.body.mobile },
        }
      );
      if (update_otp) {
        client.messages
          .create({
            body: `Your new verification code on CleaningApp is ${otp}`,
            from: "+12053749386",
            to: "+919877894202",
          })
          .then((message) => console.log(message.sid));
        return await helper.success(res, "Resend otp successfully");
      } else {
        return helper.failed(res, "something went wrong");
      }
    } catch (error) {
      console.log(error);
      return helper.failed(res, error);
    }
  },

  socialLogin: async (req, res) => {
    try {
      const required = {
        socialId: req.body.socialId,
        socialType: req.body.socialType,
        type: req.body.type,
        email: req.body.email,
      };

      const nonRequired = {
        device_type: req.body.device_type,
        device_token: req.body.device_token,
        name: req.body.name,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
      };
      let requestData = await helper.vaildObjectApi(required, nonRequired);

      let time = helper.unixTimestamp();
      requestData.loginTime = time;

      let attributes = {
        attributes: [
          "id",
          "name",
          "email",
          "type",
          "socialId",
          "loginTime",
          "is_otp_verify",

          "socialType",
          "longitude",
          "latitude",
        ],
      };
      // =====================          ++++++++++++++++++++          ================================
      let emailcheck = await db.users.findOne({
        where: { email: requestData.email, socialId: requestData.socialId },
        ...attributes,
      });

      if (emailcheck) {
        let newData = await db.users.update(requestData, {
          where: { id: emailcheck.id },
        });

        let emailData = await db.users.findOne({
          where: { email: requestData.email, socialId: requestData.socialId },
          ...attributes,
          raw: true,
          nest: true,
        });

        let token = jwt.sign(
          {
            data: {
              ...emailData,
            },
          },
          secretCryptoKey,
          { expiresIn: "30d" }
        );

        const values = JSON.parse(JSON.stringify(emailData));
        values.token = token;
        values.allreadyExist = 1;

        return helper.success(res, "User Allready exist", values);
      }
      // {{{{{{{{{{{{{{{{{{{   Done   }}}}}}}}}}}}}}}}}}}

      // let socialData = await db.users.findOne({
      //   where: {
      //     socialId: requestData.socialId,
      //   },
      // });

      // if (socialData != null) {
      //   delete requestData.socialId;
      //   requestData.loginTime = time;
      //   await db.users.update(requestData, { where: { id: socialData.id } });

      //   socialData = await db.users.findOne({
      //     where: { id: socialData.id },
      //     ...attributes,
      //   });
      //   let time = helper.unixTimestamp();

      //   const credentials = {
      //     id: socialData.id,
      //     name: socialData.name,
      //     email: socialData.email,
      //     type: socialData.type,
      //     socialId: socialData.socialId,
      //     socialType: socialData.socialType,
      //     loginTime: time,
      //   };
      //   let token = jwt.sign(
      //     {
      //       data: {
      //         credentials,
      //       },
      //     },
      //     secretCryptoKey,
      //     { expiresIn: "30d" }
      //   );

      //   let user = socialData.toJSON();
      //   user.token = token;
      //   return helper.success(res, "User login success ", user);
      // }
      else {
        if (!requestData.name) {
          let nameArr = requestData.email.split("@");
          requestData.name = nameArr[0];
        }

        let usedata = await db.users.create(requestData);

        let userData = await db.users.findOne({
          where: { id: usedata.id },
          ...attributes,
          raw: true,
          nest: true,
        });

        let time = helper.unixTimestamp();

        let token = jwt.sign(
          {
            data: {
              ...userData,
            },
          },
          secretCryptoKey,
          { expiresIn: "30d" }
        );
        userData.token = token;
        userData.allreadyExist = 0;

        return helper.success(res, "User register success ", userData);
      }
    } catch (err) {
      console.log(err);
      return helper.error(res, err.message);
    }
  },

  editProfile: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        name: "required",
        // mobile: "required",
        // countryCode: "required",

        // email: "required|email",
      });

      const values = JSON.parse(JSON.stringify(v));
      let errorsResponse = await helper.checkValidation(v);
      if (errorsResponse) {
        return helper.failed(res, errorsResponse);
      }

      if (req.files && req.files.image) {
        var image = req.files.image;

        if (image) {
          image = await helper.fileUpload(image, "profile");
        }
      }

      if (req.body.newNumber) {
        // var Otp = Math.floor(1000 + Math.random() * 9000);

        var Otp = 1111;
        // client.messages
        //   .create({
        //     body: `Your verification code on CleaningApp is ${Otp}`,
        //     from: "+12053749386",
        //     to: "+919877894202",
        //   })
        //   .then((message) => console.log(message.sid));
      }

      const editedData = await db.users.update(
        {
          name: values.inputs.name,
          countryCode: req.body.countryCode,
          // mobile: req.body.mobile,
          otp: Otp,
          email: req.body.email,
          image: image,
        },
        { where: { id: req.user.id } }
      );

      const updatedData = await db.users.findOne({
        where: { id: req.user.id },
        attributes: { exclude: ["password"] },
      });

      if (editedData) {
        return helper.success(res, "Success", updatedData);
      }
    } catch (error) {
      console.log(error);
    }
  },

  NotificationStatus: async (req, res) => {
    try {
      const status = await db.users.update(
        {
          notifyStatus: req.body.type,
        },
        { where: { id: req.user.id } }
      );
      let result = await db.users.findOne({
        where: { id: req.user.id },
        attributes: ["notifyStatus"],
        raw: true,
        nest: true,
      });

      return helper.success(
        res,
        "Notification status update successfully",
        result
      );
    } catch (error) {
      console.log(error);
    }
  },

  notificationsList: async (req, res) => {
    try {
      const notificationsData = await db.notifications.findAll({
        // attributes: ["description", "createdAt"],
        include: [
          {
            model: db.users,
            as: "sender",
            attributes: ["name", "image", "id"],
          },
        ],
        where: { receiverId: req.user.id, isSent: true },
        raw: true,
        nest: true,
      });
      console.log("test", notificationsData);
      // var arr = [];
      for (let i in notificationsData) {
        notificationsData[i].name = notificationsData[i].sender.name;
        notificationsData[i].image = notificationsData[i].sender.image;
        notificationsData[i].userId = notificationsData[i].sender.id;
        delete notificationsData[i].sender;
      }

      return helper.success(res, "NotifictionList", { notificationsData });
    } catch (error) {
      console.log(error);
    }
  },

  clearAllNotifications: async (req, res) => {
    try {
      const data = await db.notifications.destroy({
        where: {
          receiverId: req.user.id,
          isSent: true,
        },
      });
      if (data) {
        return helper.success(res, "All notifications clear");
      }
      return helper.success(res, "Notifications already cleared");
    } catch (error) {
      console.log(error);
    }
  },

  banners: async (req, res) => {
    try {
      const banners = await db.banners.findAll();
      return helper.success(res, "banners", { banners });
    } catch (error) {
      console.log(error);
    }
  },

  terms_and_conditions: async (req, res) => {
    try {
      let Data = await db.cms.findOne({
        where: {
          id: 1,
        },
        raw: true,
        nest: true,
      });
      const d = new Date();
      let year = d.getFullYear();
      res.render("cmsPages/terms", { Data, year, layout: false });
      // return helper.success(res, "Success", Data);
    } catch (error) {
      console.log(error);
    }
  },

  privacyPolicy: async (req, res) => {
    try {
      let Data = await db.cms.findOne({
        where: {
          id: 2,
        },
        raw: true,
        nest: true,
      });
      const d = new Date();
      let year = d.getFullYear();
      res.render("cmsPages/terms", { Data, year, layout: false });
      // return helper.success(res, "Success", Data);
    } catch (error) {
      console.log(error);
    }
  },

  getRandomVideos: async (req, res) => {
    // order: Sequelize.literal("rand()");
    try {
      const videos = await db.videos.findAll({
        order: Sequelize.literal("rand()"),
        raw: true,
        nest: true,
      });

      return helper.success(res, "videos list", videos);
    } catch (error) {
      console.log(error);
    }
  },

  getCategoryList: async (req, res) => {
    try {
      const categories = await db.category.findAll({
        attributes: ["id", "name"],
        raw: true,
        nest: true,
      });

      return helper.success(res, "categories list", categories);
    } catch (error) {
      console.log(error);
    }
  },

  getRoomCatAndSubCat: async (req, res) => {
    try {
      var roomCategories = await db.roomCategories.findAll({
        include: [{ model: db.category, as: "category" }],
        where: { catId: req.params.id },
        raw: true,
        nest: true,
      });

      for (let i in roomCategories) {
        var data = await db.roomSubCategories.findAll({
          where: { roomCategoryId: roomCategories[i].id },
          raw: true,
          nest: true,
        });

        roomCategories[i].roomSubCatgeoriesArr = data;
      }

      return helper.success(res, "list get Success", roomCategories);

      // const data = await db.roomCategories.findAll({
      //   include: [
      //     // {
      //     //   model: db.category,
      //     //   as: "category",
      //     //   attributes: ["id", "name"],
      //     // },
      //     {
      //       model: db.roomSubCategories,
      //       as: "roomCatId",
      //       // attributes: ["id", "name", "roomCatId"],
      //       // group: ["roomCatId"],
      //     },
      //   ],
      //   // where: { catId: req.params.id },
      //   // attributes: [
      //   //   "id", // Include the id column
      //   //   "name", // Include the name column
      //   // ],
      //   raw: true,
      //   nest: true,
      // });
    } catch (error) {
      console.log(error);
    }
  },

  // createTask: async (req, res) => {
  //   try {
  //     const v = new Validator(req.body, {
  //       // title: "required",
  //       // categoryId: "required",
  //       // type: "required",
  //       // ids: "required|array",
  //     });

  //     const values = JSON.parse(JSON.stringify(v));

  //     let errorsResponse = await helper.checkValidation(v);

  //     if (errorsResponse) {
  //       return helper.failed(res, errorsResponse);
  //     }

  //     let { taskId, startTime, endTime, currentState, reminder } = req.body;

  //     // =====================================================
  //     let tasks;
  //     tasks = await db.roomCategories.findAll({
  //       where: { catId: taskId },
  //       include: [{ model: db.roomSubCategories, as: "roomSubCategory" }],
  //     });

  //     let mainArr = [];
  //     const arr = [];

  //     if (tasks.length > 0) {
  //       tasks.map((item) => {
  //         console.log(item, "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDd");

  //         item.roomSubCategory.map((result, i) => {
  //           let obj = {
  //             roomId: item.id,
  //             whatToDo: result.name,
  //             roomSubId: result.id,
  //           };
  //           arr.push(obj);
  //         });
  //       });
  //     } else {
  //       tasks = await db.tasks.findAll({
  //         where: { id: taskId },
  //         include: [{ model: db.tasksToDo, as: "task" }],
  //       });
  //       tasks.map((item) => {
  //         console.log(item, "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDd");

  //         item.task.map((result, i) => {
  //           let obj = {
  //             roomId: item.id,
  //             whatToDo: result.whatToDo,
  //             roomSubId: result.taskId,
  //           };
  //           arr.push(obj);
  //         });
  //       });
  //     }
  //     let name;
  //     name = await db.category.findOne({ where: { id: taskId } });
  //     if (!name) {
  //       name = await db.tasks.findOne({
  //         where: { id: taskId },
  //         raw: true,
  //         nest: true,
  //       });
  //     }
  //     const newtask = await db.tasks.create({
  //       title: name?.name ? name.name : name.title,
  //       categoryId: taskId,
  //       createdBy: req.user.id,
  //       isCompleted: false,
  //     });
  //     arr.forEach((val, i) => {
  //       db.tasksToDo.create({
  //         taskId: newtask.id,
  //         whatToDo: val.whatToDo,
  //         roomCategoryId: val.roomId,
  //         startTime: startTime,
  //         categoryId: reminder,
  //         endTime: endTime,
  //         currentState: currentState,
  //         isCompleted: 0,
  //       });
  //     });

  //     var arr2 = [];
  //     var obj = {};
  //     var count;
  //     var daySkip;
  //     if (reminder == 1) {
  //       count = 30;
  //       daySkip = 1;
  //     } else if (reminder == 2) {
  //       count = 2;
  //       daySkip = 3;
  //     } else if (reminder == 15) {
  //       count = 2;
  //       daySkip = 15;
  //     } else if (reminder == 7) {
  //       count = 7;
  //       daySkip = 7;
  //     } else {
  //       count = 30;
  //       daySkip = 1;
  //     }

  //     let now = new Date();
  //     for (let i = 1; i <= count; i++) {
  //       let newDate = new Date(now.setDate(now.getDate() + daySkip));

  //       obj = {
  //         senderId: 1,
  //         receiverId: req.user.id,
  //         taskId: name.id,
  //         message: `This is your reminder for ${
  //           name?.name ? name.name : name.title
  //         } cleaning`,
  //         date: newDate,
  //       };
  //       arr2.push(obj);
  //     }
  //     await db.notifications.bulkCreate(arr2);

  //     return helper.success(res, "task Created", newtask);

  //     // =====================================================
  //     // type = JSON.parse(type);
  //     // categoryId = Number(categoryId);

  //     // let catData = await db.category.findOne({
  //     //   where: { id: categoryId },
  //     //   raw: true,
  //     //   nest: true,
  //     // });
  //     // var data = await db.tasks.create({
  //     //   title: catData.name,
  //     //   categoryId: categoryId,
  //     //   createdBy: req.user.id,
  //     //   // type: type[i].type,
  //     // });

  //     // var todayDate = new Date().toISOString().slice(0, 10);
  //     // let now = new Date();
  //     // let next30days = new Date(now.setDate(now.getDate() + 30));

  //     // for (const i in type) {
  //     //   for (const j in type[i].ids) {
  //     //     const title = await db.roomSubCategories
  //     //       .findOne({
  //     //         where: { id: type[i].ids[j] },
  //     //         raw: true,
  //     //         nest: true,
  //     //       })
  //     //       .then((title) => {
  //     //         db.tasksToDo.create({
  //     //           taskId: data.dataValues.id,
  //     //           whatToDo: title.name,
  //     //           startTime: !req.body.startTime ? todayDate : req.body.startTime,
  //     //           endTime: !req.body.endTime ? next30days : req.body.endTime,
  //     //           currentState: !currentState ? 0 : currentState,
  //     //           isCompleted: 0,
  //     //           categoryId: categoryId,
  //     //           roomCategoryId: type[i].type,
  //     //         });
  //     //       })
  //     //       .catch((err) => {
  //     //       });
  //     //   }
  //     // }

  //     // var arr = [];
  //     // var obj = {};
  //     // var count;
  //     // var daySkip;
  //     // if (categoryId == 1) {
  //     //   count = 30;
  //     //   daySkip = 1;
  //     // } else if (categoryId == 2) {
  //     //   count = 2;
  //     //   daySkip = 3;
  //     // } else if (categoryId == 3) {
  //     //   count = 30;
  //     //   daySkip = 1;
  //     // } else if (categoryId == 7) {
  //     //   count = 7;
  //     //   daySkip = 7;
  //     // } else {
  //     //   count = 1;
  //     //   daySkip = 15;
  //     // }

  //     // // let now = new Date();
  //     // for (let i = 1; i <= count; i++) {
  //     //   let newDate = new Date(now.setDate(now.getDate() + daySkip));

  //     //   obj = {
  //     //     senderId: 1,
  //     //     receiverId: req.user.id,
  //     //     taskId: data.dataValues.id,
  //     //     message: `This is your reminder for ${data.dataValues.title}`,
  //     //     date: newDate,
  //     //   };
  //     //   arr.push(obj);
  //     // }
  //     // await db.notifications.bulkCreate(arr);

  //     // return helper.success(res, "task Created", data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // },

  createTask: async (req, res) => {
    try {
      const v = new Validator(req.body, {});
      let { taskId, startTime, endTime, currentState, reminder } = req.body;
      // console.log("test vaneet==========>", req.body);
      const values = JSON.parse(JSON.stringify(v));

      let errorsResponse = await helper.checkValidation(v);

      if (errorsResponse) {
        return helper.failed(res, errorsResponse);
      }

      // =====================================================
      let tasks;
      tasks = await db.roomCategories.findAll({
        where: { catId: taskId },
        include: [{ model: db.roomSubCategories, as: "roomSubCategory" }],
      });
      console.log("🚀 ~ file: authApi.js:1554 ~ createTask: ~ tasks:", tasks);

      let mainArr = [];
      const arr = [];

      if (tasks.length > 0) {
        tasks.map((item) => {
          console.log(item, "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDd");

          item.roomSubCategory.map((result, i) => {
            let obj = {
              roomId: item.id,
              whatToDo: result.name,
              roomSubId: result.id,
            };
            arr.push(obj);
          });
        });
      } else {
        tasks = await db.tasks.findAll({
          where: { id: taskId },
          include: [{ model: db.tasksToDo, as: "task" }],
        });
        console.log("🚀 ~ file: authApi.js:1577 ~ createTask: ~ tasks:", tasks);
        tasks.map((item) => {
          console.log("🚀 ~ file: authApi.js:1579 ~ tasks.map ~ item:", item);
          // console.log(item, "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDd");

          item.task.map((result, i) => {
            let obj = {
              roomId: item.id,
              whatToDo: result.whatToDo,
              roomSubId: result.taskId,
            };
            arr.push(obj);
          });
        });
      }
      console.log("🚀 ~ file: authApi.js:1558 ~ createTask: ~ arr:", arr);

      let name;
      name = await db.category.findOne({ where: { id: taskId } });
      if (!name) {
        name = await db.tasks.findOne({
          where: { id: taskId },
          raw: true,
          nest: true,
        });
      }
      const newtask = await db.tasks.create({
        title: name?.name ? name.name : name.title,
        categoryId: taskId,
        createdBy: req.user.id,
        isCompleted: false,
      });
      console.log(
        "🚀 ~ file: authApi.js:1609 ~ createTask: ~ newtask:",
        newtask
      );

      // console.log(
      //   "🚀 ~ file: authApi.js:1540 ~ createTask: ~ newtask:",
      //   newtask
      // );
      // console.log("array====>>>>>", arr);
      // let save = arr.forEach((val, i) => {
      //   db.tasksToDo.create({
      //     taskId: newtask.dataValues.id,
      //     whatToDo: val.whatToDo,
      //     roomCategoryId: val.roomId,
      //     startTime: startTime,
      //     categoryId: reminder,
      //     endTime: endTime,
      //     currentState: currentState,
      //     isCompleted: 0,
      //   });
      // });
      const tasksToCreate = arr.map((val) => ({
        taskId: newtask.dataValues.id,
        whatToDo: val.whatToDo,
        roomCategoryId: val.roomId,
        startTime: startTime,
        categoryId: reminder,
        endTime: endTime,
        currentState: currentState,
        isCompleted: 0,
      }));
      // console.log("tasksToCreate", tasksToCreate);
      const save = await Promise.all(
        tasksToCreate.map((task) => db.tasksToDo.create(task))
      );

      console.log("save====>", save);
      const today = new Date();
      const targetDate = new Date(endTime);
      const timeDifferenceInMilliseconds =
        targetDate.getTime() - today.getTime();
      const daysDifference = Math.ceil(
        timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24)
      );

      var arr2 = [];
      var obj = {};
      var count;
      var daySkip;
      if (reminder == 1) {
        count = daysDifference;
        daySkip = 1;
      } else if (reminder == 2) {
        count = Math.round(daysDifference / 2);
        daySkip = 3;
      } else if (reminder == 15) {
        count = Math.round(daysDifference / 15);
        daySkip = 15;
      } else if (reminder == 7) {
        count = Math.round(daysDifference / 7);
        daySkip = 7;
      } else if (reminder == 30) {
        count = Math.round(daysDifference / 30);
        daySkip = 30;
      } else {
        count = daysDifference;
        daySkip = 1;
      }

      let now = new Date();
      for (let i = 1; i <= count; i++) {
        let newDate = new Date(now.setDate(now.getDate() + daySkip));

        obj = {
          senderId: 1,
          receiverId: req.user.id,
          taskId: newtask.dataValues.id,
          message: `This is your reminder for ${
            name?.name ? name.name : name.title
          } cleaning`,
          date: newDate,
        };
        arr2.push(obj);
      }
      let storedata = await db.notifications.bulkCreate(arr2);
      console.log(storedata, "notification stores---------------");

      return helper.success(res, "task Created", newtask);

      // =====================================================
      // type = JSON.parse(type);
      // categoryId = Number(categoryId);

      // let catData = await db.category.findOne({
      //   where: { id: categoryId },
      //   raw: true,
      //   nest: true,
      // });
      // var data = await db.tasks.create({
      //   title: catData.name,
      //   categoryId: categoryId,
      //   createdBy: req.user.id,
      //   // type: type[i].type,
      // });

      // var todayDate = new Date().toISOString().slice(0, 10);
      // let now = new Date();
      // let next30days = new Date(now.setDate(now.getDate() + 30));

      // for (const i in type) {
      //   for (const j in type[i].ids) {
      //     const title = await db.roomSubCategories
      //       .findOne({
      //         where: { id: type[i].ids[j] },
      //         raw: true,
      //         nest: true,
      //       })
      //       .then((title) => {
      //         db.tasksToDo.create({
      //           taskId: data.dataValues.id,
      //           whatToDo: title.name,
      //           startTime: !req.body.startTime ? todayDate : req.body.startTime,
      //           endTime: !req.body.endTime ? next30days : req.body.endTime,
      //           currentState: !currentState ? 0 : currentState,
      //           isCompleted: 0,
      //           categoryId: categoryId,
      //           roomCategoryId: type[i].type,
      //         });
      //       })
      //       .catch((err) => {
      //       });
      //   }
      // }

      // var arr = [];
      // var obj = {};
      // var count;
      // var daySkip;
      // if (categoryId == 1) {
      //   count = 30;
      //   daySkip = 1;
      // } else if (categoryId == 2) {
      //   count = 2;
      //   daySkip = 3;
      // } else if (categoryId == 3) {
      //   count = 30;
      //   daySkip = 1;
      // } else if (categoryId == 7) {
      //   count = 7;
      //   daySkip = 7;
      // } else {
      //   count = 1;
      //   daySkip = 15;
      // }

      // // let now = new Date();
      // for (let i = 1; i <= count; i++) {
      //   let newDate = new Date(now.setDate(now.getDate() + daySkip));

      //   obj = {
      //     senderId: 1,
      //     receiverId: req.user.id,
      //     taskId: data.dataValues.id,
      //     message: `This is your reminder for ${data.dataValues.title}`,
      //     date: newDate,
      //   };
      //   arr.push(obj);
      // }
      // await db.notifications.bulkCreate(arr);

      // return helper.success(res, "task Created", data);
    } catch (error) {
      console.log(error);
    }
  },

//my self
createTask: async (req, res) => {
  try {
    const v = new Validator(req.body, {});
    let { taskId, startTime, endTime, currentState, reminder,time,day } = req.body;
    // console.log("test vaneet==========>", req.body);
    const values = JSON.parse(JSON.stringify(v));

    let errorsResponse = await helper.checkValidation(v);

    if (errorsResponse) {
      return helper.failed(res, errorsResponse);
    }

    // =====================================================
    let tasks;
    tasks = await db.roomCategories.findAll({
      where: { catId: taskId },
      include: [{ model: db.roomSubCategories, as: "roomSubCategory" }],
    });
    console.log("🚀 ~ file: authApi.js:1554 ~ createTask: ~ tasks:", tasks);

    let mainArr = [];
    const arr = [];

    if (tasks.length > 0) {
      tasks.map((item) => {
        console.log(item, "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDd");

        item.roomSubCategory.map((result, i) => {
          let obj = {
            roomId: item.id,
            whatToDo: result.name,
            roomSubId: result.id,
          };
          arr.push(obj);
        });
      });
    } else {
      tasks = await db.tasks.findAll({
        where: { id: taskId },
        include: [{ model: db.tasksToDo, as: "task" }],
      });
      console.log("🚀 ~ file: authApi.js:1577 ~ createTask: ~ tasks:", tasks);
      tasks.map((item) => {
        console.log("🚀 ~ file: authApi.js:1579 ~ tasks.map ~ item:", item);
        // console.log(item, "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDd");

        item.task.map((result, i) => {
          let obj = {
            roomId: item.id,
            whatToDo: result.whatToDo,
            roomSubId: result.taskId,
          };
          arr.push(obj);
        });
      });
    }
    console.log("🚀 ~ file: authApi.js:1558 ~ createTask: ~ arr:", arr);

    let name;
    name = await db.category.findOne({ where: { id: taskId } });
    if (!name) {
      name = await db.tasks.findOne({
        where: { id: taskId },
        raw: true,
        nest: true,
      });
    }
    const newtask = await db.tasks.create({
      title: name?.name ? name.name : name.title,
      categoryId: taskId,
      createdBy: req.user.id,
      isCompleted: false,
    });
    console.log(
      "🚀 ~ file: authApi.js:1609 ~ createTask: ~ newtask:",
      newtask
    );
    const selectedDays = day ? day.join(',') : null;
    const tasksToCreate = arr.map((val) => ({
      taskId: newtask.dataValues.id,
      whatToDo: val.whatToDo,
      roomCategoryId: val.roomId,
      startTime: startTime,
      categoryId: reminder,
      endTime: endTime,
      currentState: currentState,
      isCompleted: 0,
      day:selectedDays,
      time:time
    }));
    // console.log("tasksToCreate", tasksToCreate);
    const save = await Promise.all(
      tasksToCreate.map((task) => db.tasksToDo.create(task))
    );

    console.log("save====>", save);
    const today = new Date();
    const targetDate = new Date(endTime);
    const timeDifferenceInMilliseconds =
      targetDate.getTime() - today.getTime();
    const daysDifference = Math.ceil(
      timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24)
    );

    var arr2 = [];
    var obj = {};
    var count;
    var daySkip;
    if (reminder == 1) {
      count = daysDifference;
      daySkip = 1;
    } else if (reminder == 2) {
      count = Math.round(daysDifference / 2);
      daySkip = 3;
    } else if (reminder == 15) {
      count = Math.round(daysDifference / 15);
      daySkip = 15;
    } else if (reminder == 7) {
      count = Math.round(daysDifference / 7);
      daySkip = 7;
    } else if (reminder == 30) {
      count = Math.round(daysDifference / 30);
      daySkip = 30;
    } else {
      count = daysDifference;
      daySkip = 1;
    }

    let isoFormattedStartTime = moment(startTime, "DD-MM-YYYY").toDate();
    let now = new Date(isoFormattedStartTime);
    // let now = new Date();
    for (let i = 1; i <= count; i++) {
      let newDate = new Date(now.setDate(now.getDate() + daySkip));

      obj = {
        senderId: 1,
        receiverId: req.user.id,
        taskId: newtask.dataValues.id,
        message: `This is your reminder for ${
          name?.name ? name.name : name.title
        } cleaning`,
        date: newDate,
        day:selectedDays,
        time:time
      };
      arr2.push(obj);
    }
    const lowercaseSpecifiedDays = day.map(day => day.toLowerCase()); // Convert specified days to lowercase
    
    const filteredArr2 = arr2.filter(obj => {
      const dayMatches = lowercaseSpecifiedDays.includes(obj.date.toLocaleString("en-us", { weekday: "long" }).toLowerCase());
      return dayMatches;
    });  
    console.log(filteredArr2)
    let storedata = await db.notifications.bulkCreate(arr2);
    let storedataOriginal = await db.notifications.bulkCreate(filteredArr2);
    console.log(storedata, "notification stores---------------");

    return helper.success(res, "task Created", newtask);

  } catch (error) {
    console.log(error);
  }
 },


  createCustomTask: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        taskName: "required",
        task: "required",
      });
      req.body.task = JSON.parse(req.body.task);
      req.body.task = Array.isArray(req.body.task)
        ? req.body.task
        : [req.body.task];
      let errorsResponse = await helper.checkValidation(v);
      if (errorsResponse) {
        return await helper.failed(res, errorsResponse);
      }

      const task = await db.tasks.create({
        title: req.body.taskName,
        // categoryId: req.body.categoryId,
        createdBy: req.user.id,
        isCompleted: 0,
        // type: req.body.type,
      });

      var todayDate = new Date().toISOString().slice(0, 10);
      let now = new Date();
      let next30days = new Date(now.setDate(now.getDate() + 30));

      for (const i in req.body.task) {
        await db.tasksToDo.create({
          taskId: task.id,
          whatToDo: req.body.task[i],
          // startTime: !req.body.startTime ? todayDate : req.body.startTime,
          // endTime: !req.body.endTime ? next30days : req.body.endTime,
          currentState: !req.body.currentState ? 0 : req.body.currentState,
          isCompleted: 0,
          categoryId: task.categoryId,
        });
      }

      // var arr = [];
      // var obj = {};
      // var count;
      // var daySkip;
      // if (task.categoryId == 1) {
      //   count = 30;
      //   daySkip = 1;
      // } else if (task.categoryId == 2) {
      //   count = 2;
      //   daySkip = 3;
      // } else if (task.categoryId == 3) {
      //   count = 30;
      //   daySkip = 1;
      // } else if (task.categoryId == 7) {
      //   count = 7;
      //   daySkip = 7;
      // } else {
      //   count = 1;
      //   daySkip = 15;
      // }

      // for (let i = 1; i <= count; i++) {
      //   let newDate = new Date(now.setDate(now.getDate() + daySkip));

      //   obj = {
      //     senderId: 1,
      //     receiverId: req.user.id,
      //     taskId: task.id,
      //     message: `This is your reminder for ${task.title}`,
      //     date: newDate,
      //   };
      //   arr.push(obj);
      // }
      // await db.notifications.bulkCreate(arr);

      return helper.success(res, "task created");
    } catch (error) {
      console.log(error);
    }
  },

  deleteTask: async (req, res) => {
    try {
      const deleted = await db.tasks.destroy({
        where: { id: req.body.id, createdBy: req.user.id },
        raw: true,
        nest: true,
      });
      if (deleted) {
        const isExist = await db.tasks.findAll({
          where: { categoryId: req.body.id },
        });
        if (isExist) {
          await db.tasks.destroy({
            where: { categoryId: req.body.id },
          });
          await db.tasksToDo.destroy({
            where: { roomCategoryId: req.body.id },
          });
          for (const i in isExist) {
            await db.notifications.destroy({
              where: { taskId: isExist[i].id },
            });
          }
          return helper.success(res, "Task deleted");
        }
        await db.tasksToDo.destroy({ where: { taskId: req.body.id } });
        console.log("first");
        await db.notifications.destroy({ where: { taskId: req.body.id } });
        console.log("second");
        return helper.success(res, "Task deleted");
      }
      return helper.failed(res, "Task not deleted");
    } catch (error) {
      console.log(error);
    }
  },

  updateCustomTask: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        taskId: "required",
      });

      const values = JSON.parse(JSON.stringify(v));

      let errorsResponse1 = await helper.checkValidation(v);

      if (errorsResponse1) {
        return helper.failed(res, errorsResponse1);
      }

      let deletedTasks = JSON.parse(req.body.deletedTasks);

      req.body.newTasks = JSON.parse(req.body.newTasks);
      req.body.newTasks = Array.isArray(req.body.newTasks)
        ? req.body.newTasks
        : [req.body.newTasks];

      for (const i in deletedTasks) {
        await db.tasksToDo.destroy({ where: { id: deletedTasks[i] } });
      }
      const isTaskExist = await db.tasks.findOne({
        where: {
          id: req.body.taskId,
        },
      });
      if (isTaskExist) {
        const task = await db.tasks.update(
          {
            title: req.body.taskName,
          },
          {
            where: {
              id: req.body.taskId,
            },
          }
        );

        var todayDate = new Date().toISOString().slice(0, 10);
        let now = new Date();
        let next30days = new Date(now.setDate(now.getDate() + 30));

        for (const i in req.body.newTasks) {
          await db.tasksToDo.create({
            taskId: req.body.taskId,
            whatToDo: req.body.newTasks[i],
            // startTime: !req.body.startTime ? todayDate : req.body.startTime,
            // endTime: !req.body.endTime ? next30days : req.body.endTime,
            currentState: !req.body.currentState ? 0 : req.body.currentState,
            isCompleted: 0,
            // categoryId: task.categoryId,
          });
        }
        return helper.success(res, "task updated successfully");
      } else {
        return helper.error(res, "task not found with this id");
      }
    } catch (error) {
      console.log(error);
    }
  },

  updateTask: async (req, res) => {
    try {
      let { taskId, tasks, startTime, endTime, currentState, reminder } =
        req.body;

      const v = new Validator(req.body, {
        taskId: "required",
        tasks: "required",
      });

      const values = JSON.parse(JSON.stringify(v));

      let errorsResponse1 = await helper.checkValidation(v);

      if (errorsResponse1) {
        return helper.failed(res, errorsResponse1);
      }

      tasks = JSON.parse(tasks);
      let completedDate = moment(new Date()).format("YYYY-MM-DD");
      console.log(
        "🚀 ~ file: authApi.js:1882 ~ updateTask: ~ completedDate:",
        completedDate
      );
      // console.log(tasks[0]);
      // return;
      for (let i in tasks) {
        await db.tasksToDo.update(
          {
            currentState: currentState,
            startTime: startTime,
            endTime: endTime,
            categoryId: reminder,
            isCompleted: tasks[i].isCompleted == 1 ? true : false,
            completedDate: tasks[i].isCompleted == 1 ? completedDate : null,
          },
          {
            where: {
              id: tasks[i].id,
            },
          }
        );
      }
      // const updateTasksPromises = tasks.map(async (data) => {

      // });
      // await db.tasks.update(
      //   { categoryId: reminder },
      //   { where: { id: taskId } }
      // );

      // await Promise.all(updateTasksPromises);

      if (reminder) {
        // Handle reminder creation
        await db.notifications.destroy({
          where: {
            taskId: taskId,
          },
        });

        // ... rest of the reminder creation code ...
        var arr2 = [];
        var obj = {};
        var count;
        var daySkip;
        if (reminder == 1) {
          count = 30;
          daySkip = 1;
        } else if (reminder == 2) {
          count = 2;
          daySkip = 3;
        } else if (reminder == 15) {
          count = 2;
          daySkip = 15;
        } else if (reminder == 7) {
          count = 7;
          daySkip = 7;
        } else {
          count = 30;
          daySkip = 1;
        }

        let now = new Date();
        for (let i = 1; i <= count; i++) {
          let newDate = new Date(now.setDate(now.getDate() + daySkip));

          const name = await db.tasks.findOne({
            where: { id: taskId },
            raw: true,
            nest: true,
          });

          obj = {
            senderId: 1,
            receiverId: req.user.id,
            taskId: name.id,
            message: `This is your reminder for ${name.title} cleaning`,
            date: newDate,
          };
          arr2.push(obj);
        }
        await db.notifications.bulkCreate(arr2);

        // Check if all tasks are completed and update the main task
        const name = await db.tasks.findOne({
          where: { id: taskId },
          include: [{ model: db.tasksToDo, as: "task" }],
        });

        const checkTasks = name.task;
        const allTasksCompleted = checkTasks.every((task) => task.isCompleted);

        if (allTasksCompleted) {
          await db.tasks.update(
            { isCompleted: true },
            { where: { id: name.id } }
          );
          return helper.success(res, "Task updated and completed");
        }

        return helper.success(res, "Task updated");
      }

      const name = await db.tasks.findOne({
        where: { id: taskId },
        include: [{ model: db.tasksToDo, as: "task" }],
      });

      const checkTasks = name.task;
      const allTasksCompleted = checkTasks.every((task) => task.isCompleted);

      if (allTasksCompleted) {
        await db.tasks.update(
          { isCompleted: true },
          { where: { id: name.id } }
        );
        return helper.success(res, "Task updated successfully");
      }

      return helper.success(res, "Task updated successfully");
    } catch (error) {
      // Handle errors and send an appropriate response
      console.error(error);
      return helper.failed(res, "An error occurred while updating the task.");
    }
  },
  // var name = await db.tasks.findOne({
  //   where: { id: taskId },

  //   include: [{ model: db.tasksToDo, as: "task" }],
  // });

  // tasks.map(async (data) => {
  //   console.log(data.isCompleted, data.id);
  //   const result = await db.tasksToDo.update(
  //     {
  //       currentState: currentState,
  //       startTime: startTime,
  //       endTime: endTime,
  //       isCompleted: data.isCompleted == 1 ? true : false,
  //     },
  //     {
  //       where: {
  //         id: data.id,
  //       },
  //     }
  //   );
  // });

  // if (reminder) {
  //   await db.notifications.destroy({
  //     where: {
  //       taskId: taskId,
  //     },
  //   });
  //   var arr2 = [];
  //   var obj = {};
  //   var count;
  //   var daySkip;
  //   if (reminder == 1) {
  //     count = 30;
  //     daySkip = 1;
  //   } else if (reminder == 2) {
  //     count = 2;
  //     daySkip = 3;
  //   } else if (reminder == 3) {
  //     count = 30;
  //     daySkip = 1;
  //   } else if (reminder == 7) {
  //     count = 7;
  //     daySkip = 7;
  //   } else {
  //     count = 2;
  //     daySkip = 15;
  //   }

  //   let now = new Date();
  //   for (let i = 1; i <= count; i++) {
  //     let newDate = new Date(now.setDate(now.getDate() + daySkip));

  //     obj = {
  //       senderId: 1,
  //       receiverId: req.user.id,
  //       taskId: name.id,
  //       message: `This is your reminder for ${name.name} cleaning`,
  //       date: newDate,
  //     };
  //     arr2.push(obj);
  //   }
  //   await db.notifications.bulkCreate(arr2);
  //   const checkTasks = name.task;
  //   const allTasksCompleted = checkTasks.every((task) => task.isCompleted);

  //   if (allTasksCompleted) {
  //     await db.tasks.update(
  //       { isCompleted: true },
  //       { where: { id: name.id } }
  //     );
  //     return helper.success(res, "task updated And completed");
  //   }

  //   return helper.success(res, "task updated 2");
  // }
  // name = await db.tasks.findOne({
  //   where: { id: taskId },
  //   include: [{ model: db.tasksToDo, as: "task" }],
  // });
  // const checkTasks = name.task;
  // const allTasksCompleted = checkTasks.every((task) => task.isCompleted);

  // if (allTasksCompleted) {
  //   try {
  //     await db.tasks.update(
  //       { isCompleted: true },
  //       { where: { id: name.id } }
  //     );
  //     console.log("GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG");
  //     return helper.success(res, "Task updated successfully");
  //   } catch (error) {
  //     console.log(error, "======>----hereiserror");
  //   }
  // }

  // return helper.success(res, "Task updated successfully");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // },

  isTaskCompleted: async (req, res) => {
    try {
      const result = await db.tasksToDo.update(
        { isCompleted: req.body.isCompleted },
        { where: { taskId: req.body.taskId } }
      );

      await db.notifications.destroy({
        where: { taskId: req.body.taskId, isSent: false },
      });

      if (result) {
        return helper.success(res, "Task updated");
      }
      return helper.failed(res, "Task not updated");
    } catch (error) {
      console.log(error);
    }
  },
  getTasksList: async (req, res) => {
    try {
      let list = await db.tasks.findAll({
        include: [
          {
            model: db.category,
            as: "category",
            attributes: ["id", "name"],
          },
          {
            model: db.tasksToDo,
            as: "task",
            include: [
              {
                model: db.roomCategories,
                as: "roomCategory",
                group: ["roomCategoryId"],
                attributes: ["id", "name"],
              },
            ],
            attributes: { exclude: ["createdAt", "updatedAt"] },
            order: [["id", "DESC"]],
          },
        ],
        attributes: { exclude: ["createdAt", "updatedAt"] },
        where: { createdBy: 108 },
      });

      const newList = list.map((item) => {
        let arr = [];
        for (const key in item.task) {
          arr.push(item.task[key].currentState);
        }
        const sum = arr.reduce((acc, curr) => acc + curr, 0);
        const avg = sum / arr.length;

        return {
          taskId: item.id,
          averageCurrentState: avg,
        };
      });
      for (const i in list) {
        list[i].dataValues.averageCurrentState = newList[i].averageCurrentState;
      }
      return helper.success(res, "Tasks List", list);
    } catch (error) {
      console.log(error);
    }
  },
  getTaskList: async (req, res) => {
    try {
      console.log("test");
      const preCreated = await db.category.findAll({ raw: true, nest: true });

      let notWant = [];
      for (const i in preCreated) {
        let newObj = { title: { [Sequelize.Op.ne]: preCreated[i].name } };
        notWant.push(newObj);
      }

      const userCreated = await db.tasks.findAll({
        where: {
          createdBy: req.user.id,
          [Sequelize.Op.and]: notWant,
        },
        include: [
          {
            model: db.tasksToDo,
            as: "task",
            where: {
              [Sequelize.Op.and]: [{ startTime: null }],
            },
          },
        ],
        // group: ["title"],
        // raw: true,
        nest: true,
      });
      // console.log(userCreated, "==================>");
      // return;

      let arr = [];

      preCreated.map((item) => {
        let obj = {
          id: item.id,
          name: item.name,
          createdBy: 0,
        };
        arr.push(obj);
      });
      userCreated.map((item) => {
        let obj = {
          id: item.id,
          name: item.title,
          createdBy: item.createdBy,
        };
        arr.push(obj);
      });

      arr.preCreated = preCreated;
      arr.userCreated = userCreated;
      return helper.success(res, "get TaskList success", arr);
    } catch (error) {
      console.log(error);
    }
  },

  deleteCustomTask: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        id: "required",
      });

      let errorsResponse = await helper.checkValidation(v);

      if (errorsResponse) {
        return helper.failed(res, errorsResponse);
      }

      const result = await db.tasks.destroy({ where: { id: req.body.id } });
      await db.tasksToDo.destroy({
        where: {
          taskId: req.body.id,
        },
      });
      if (result) {
        return helper.success(
          res,
          `deleted custom tasks with ${req.body.id} id`
        );
      }
      return helper.failed(res, "something went wrong");
    } catch (error) {
      console.log(error);
    }
  },

  getRoomCat: async (req, res) => {
    try {
      const data = await db.roomCategories.findAll({
        attributes: { exclude: ["status", "createdAt", "updatedAt"] },
        where: { catId: req.params.id },
        include: [
          {
            model: db.roomSubCategories,
            as: "roomSubCategory",
            attributes: { exclude: ["status", "createdAt", "updatedAt"] },
            // order: [["id", "DESC"]],
          },
        ],
      });
      if (data.length <= 0) {
        let result = await db.tasks.findOne({
          where: {
            id: req.params.id,
            createdBy: req.user.id,
          },
          include: [
            {
              model: db.tasksToDo,
              as: "task",
              attributes: { exclude: ["createdAt", "updatedAt"] },
              // order: [["id", "DESC"]],
            },
          ],
        });
        let arr = [];
        let roomSubCategoryArr = [];
        result.task.map(async (val) => {
          // let val = item;

          // for (const i in val) {
          let obj2 = {
            id: val.id,
            name: val.whatToDo,
            roomCategoryId: val.roomCategoryId,
          };

          roomSubCategoryArr.push(obj2);
          // }
        });
        result = JSON.parse(JSON.stringify(result));
        delete result.task;
        result.roomSubCategory = roomSubCategoryArr;
        let data2 = [];
        data2[0] = result;
        return helper.success(res, "list get success", data2);
      }

      return helper.success(res, "list get success", data);
    } catch (error) {
      console.log(error);
    }
  },

  // getRoomCat: async (req, res) => {
  //   try {
  //     const data = await db.roomCategories.findAll({
  //       attributes: { exclude: ["status", "createdAt", "updatedAt"] },
  //       where: { catId: req.params.id },
  //       include: [
  //         {
  //           model: db.roomSubCategories,
  //           as: "roomSubCategory",
  //           attributes: { exclude: ["status", "createdAt", "updatedAt"] },
  //           // order: [["id", "DESC"]],
  //         },
  //       ],
  //     });
  //     if (data.length <= 0) {
  //       const result = await db.tasks.findAll({
  //         where: {
  //           createdBy: req.user.id,
  //         },
  //         include: [
  //           {
  //             model: db.tasksToDo,
  //             as: "task",
  //             attributes: { exclude: ["createdAt", "updatedAt"] },
  //             // order: [["id", "DESC"]],
  //           },
  //         ],
  //       });
  //       let arr = [];
  //       let roomSubCategoryArr = [];
  //       result.map(async (item) => {
  //         let val = item;

  //         for (const i in val.task) {
  //           let obj2 = {
  //             id: val.task[i].id,
  //             name: val.task[i].whatToDo,
  //             roomCategoryId: val.task[i].roomCategoryId,
  //           };

  //           roomSubCategoryArr.push(obj2);
  //         }

  //         let obj = {
  //           id: val.id,
  //           catId: val.categoryId,
  //           name: val.title,
  //           roomSubCategory: roomSubCategoryArr,
  //         };
  //         arr.push(obj);
  //       });

  //       return helper.success(res, "list get success", arr);
  //     }

  //     return helper.success(res, "list get success", data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // },

  getTaskDetails: async (req, res) => {
    try {
      // const data = await db.tasks.findAll({
      //   attributes: { exclude: ["status", "createdAt", "updatedAt"] },
      //   where: { id: req.params.id },
      //   include: [
      //     {
      //       model: db.tasksToDo,
      //       as: "roomSubCategory",
      //       attributes: [
      //         "id",
      //         "roomCategoryId",
      //         "whatToDo",
      //         "currentState",
      //         "isCompleted",
      //       ],
      //       group: ["roomCategoryId"],
      //     },
      //   ],
      //   // group: ["roomSubCategory.roomCategoryId"],
      // });
      // return helper.success(res, "task Details", data);

      console.log("ffffffffffffffffffffffffffffffffff");
      const result = await db.tasks.findOne({
        include: [
          {
            model: db.category,
            as: "category",
            attributes: ["id", "name"],
          },
          {
            model: db.tasksToDo,
            as: "task",
            include: [
              {
                model: db.roomCategories,
                as: "roomCategory",
                group: ["roomCategoryId"],
                attributes: ["id", "name"],
              },
            ],
            attributes: { exclude: ["createdAt", "updatedAt"] },
            order: [["id", "DESC"]],
          },
        ],
        attributes: { exclude: ["createdAt", "updatedAt", "type"] },

        where: {
          id: req.params.id,
        },
      });

      // const checkTasks = result.task;
      // const allTasksCompleted = checkTasks.every((task) => task.isCompleted);

      // if (allTasksCompleted) {
      //   console.log("All tasks are completed.");
      // } else {
      //   console.log("Some tasks are not completed.");
      // }

      let arr = [];
      result.task.map((data) => {
        let obj = {
          id: data.id,
          name: data.whatToDo,
          roomCategoryId: data.roomCategoryId,
        };
      });

      return helper.success(res, "task Details", result);
    } catch (error) {}
  },

  // contactUs: async (req, res) => {
  //   try {
  //     const v = new Validator(req.body, {
  //       email: "required|email",
  //       name: "required",
  //       mobile: "required",
  //       feedback: "required",
  //     });
  //     let errorsResponse = await helper.checkValidation(v);

  //     if (errorsResponse) {
  //       console.log(errorsResponse);
  //       return helper.failed(res, errorsResponse);
  //     }
  //     const result = await db.feedback.create({
  //       name: req.body.name,
  //       email: req.body.email,
  //       mobile: req.body.email,
  //       feed: req.body.feedback,
  //     });

  //     return helper.success(res, "feedback sent");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // },

  contactUs: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        name: "required",
        email: "required|email",
        subject: "required",
        title: "required",
      });

      const values = JSON.parse(JSON.stringify(v));

      let errorsResponse = await helper.checkValidation(v);

      if (errorsResponse) {
        return helper.failed(res, errorsResponse);
      }

      const isUpdated = await db.feedback.create({
        name: req.body.name,
        email: req.body.email,
        feed: req.body.subject,
        title: req.body.title,
      });
      if (isUpdated) {
        return helper.success(res, "Updated successfully", isUpdated);
      }
      return helper.failed(res, "not updated");
    } catch (error) {
      console.log(error);
    }
  },

  taskFilter: async (req, res) => {
    try {
      console.log("test filter");
      if (req.params.id == 0) {
        console.log("test filter inside");
        let result = await db.tasks.findAll({
          where: {
            createdBy: req.user.id,
            isCompleted: false,
          },
          order: [["id", "DESC"]],
          include: [
            {
              model: db.tasksToDo,

              as: "task",
              where: {
                [Sequelize.Op.and]: [
                  { startTime: { [Sequelize.Op.ne]: null } },
                ],
              },
              // attributes: { exclude: ["createdAt", "updatedAt"] },
              // order: [["id", "DESC"]],
            },
          ],
        });

        const newList = result.map((item) => {
          let arr = [];
          for (const key in item.task) {
            arr.push(item.task[key].isCompleted);
          }
          const sum = arr.reduce((acc, curr) => acc + curr, 0);
          const avg = sum / arr.length;
          // Example values
          var completedTasks = sum;
          var totalTasks = arr.length;

          var average = completedTasks / totalTasks;

          // Convert the average to a float value with two decimal places
          var floatAverage = parseFloat(average.toFixed(2));

          console.log(floatAverage); // Output: 0.75

          return {
            taskId: item.id,
            averageCurrentState: floatAverage,
          };
          return {
            taskId: item.id,
            averageCurrentState: floatAverage,
          };
        });
        for (const i in result) {
          result[i].dataValues.averageCurrentState =
            newList[i].averageCurrentState;
        }

        // let arr = [];
        // let roomSubCategoryArr = [];
        // result.task.map(async (val) => {
        //   // let val = item;

        //   // for (const i in val) {
        //   let obj2 = {
        //     id: val.id,
        //     name: val.whatToDo,
        //     roomCategoryId: val.roomCategoryId,
        //   };

        //   // roomSubCategoryArr.push(obj2);
        //   // }
        // });
        // result = JSON.parse(JSON.stringify(result));
        // delete result.task;
        // result.roomSubCategory = roomSubCategoryArr;
        // let data2 = [];
        // data2[0] = result;
        return helper.success(res, "list get success", result);
      } else {
        let result = await db.tasks.findAll({
          where: {
            // categoryId: req.params.id,
            isCompleted: false,
            createdBy: req.user.id,
          },
          order: [["id", "DESC"]],

          include: [
            {
              model: db.tasksToDo,
              where: { categoryId: req.params.id },
              as: "task",
              // attributes: { exclude: ["createdAt", "updatedAt"] },
              // order: [["id", "DESC"]],
            },
          ],
        });
        const newList = result.map((item) => {
          let arr = [];
          for (const key in item.task) {
            arr.push(item.task[key].isCompleted);
          }
          const sum = arr.reduce((acc, curr) => acc + curr, 0);
          const avg = sum / arr.length;
          // Example values
          var completedTasks = sum;
          var totalTasks = arr.length;

          var average = completedTasks / totalTasks;

          // Convert the average to a float value with two decimal places
          var floatAverage = parseFloat(average.toFixed(2));

          console.log(floatAverage); // Output: 0.75

          return {
            taskId: item.id,
            averageCurrentState: floatAverage,
          };
        });
        for (const i in result) {
          result[i].dataValues.averageCurrentState =
            newList[i].averageCurrentState;
        }

        return helper.success(res, "list get success", result);
      }
    } catch (error) {
      console.log(error);
    }
  },
  testFcm: async (req, res) => {
    try {
      var serverKey = process.env.fcm_server_key; //put your server key here
      console.log(serverKey);
      // return;
      var fcm = new FCM(serverKey);

      var message = {
        //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: "e-ogjH_jQH-WUhWKpfcLYi:APA91bHbVh2DuuvvAuRqSrGvP1ZzSOfrucAzRugELklt_D2iDGK3bBC2ueKTrC1q5F66L7lZ9U_Mic2gwYgkmSpqjTiLQ9UXKo3CyQbm7jWumTYceMafwdLHLQQnLm-WyeEQErrHiB4w",
        collapse_key: "your_collapse_key",

        notification: {
          title: "Cleaning App",
          body: "This is a testing message",
          notification_type: 1,
          sender_id: 0,
          sender_name: "TL Malkeet singh",
        },

        data: {
          title: "Cleaning App",
          body: "This is a testing message",
          notification_type: 1,
          sender_id: 0,
          sender_name: "TL Malkeet singh",
        },
      };

      fcm.send(message, function (err, response) {
        if (err) {
          console.log("Something has gone wrong!");
          return helper.failed(res, "Something has gone wrong!", {});
        } else {
          console.log("Successfully sent with response: ", response);
          return helper.success(res, "send successfuly send", message);
        }
      });
    } catch (error) {
      console.log(error);
    }
  },

  notificationList: async (req, res) => {
    try {
      const list = await db.notifications.findAll({
        where: { receiverId: req.user.id, isSent: true },
        order: [["id", "DESC"]],
      });
      return helper.success(res, "notification List", list);
    } catch (error) {
      console.log(error);
    }
  },

  test: async (req, res) => {
    try {
      console.log(43 / 2);
      // Step 1: Get the current date
      const today = new Date();

      // Step 2: Get the target date (September 15, 2023)
      const targetDate = new Date("2023-09-15");

      // Step 3: Calculate the difference between the two dates in milliseconds
      const timeDifferenceInMilliseconds =
        targetDate.getTime() - today.getTime();

      // Step 4: Convert the milliseconds difference to days
      const daysDifference = Math.ceil(
        timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24)
      );

      console.log(
        `Number of days from today to September 15, 2023: ${daysDifference}`
      );

      // const date = new Date();
      // const now = moment(date).format("YYYY-MM-DD");

      // const reminders = await db.tasksToDo.findAll({
      //   where: literal(`endTime > '${now}'`), // Using literal to compare dates as raw SQL
      // });
      // for (const reminder of reminders) {
      //   const previousDate = moment(date)
      //     .subtract(reminder.categoryId, "days")
      //     .format("YYYY-MM-DD");

      //   // Update tasksToDo table
      //   await db.tasksToDo.update(
      //     {
      //       completedDate: null,
      //       isCompleted: 0,
      //     },
      //     {
      //       where: {
      //         taskId: reminder.taskId,
      //       },
      //     }
      //   );

      //   // Update tasks table
      //   await db.tasks.update(
      //     {
      //       isCompleted: 0,
      //     },
      //     {
      //       where: {
      //         id: reminder.taskId,
      //       },
      //     }
      //   );
      // }

      return res.status(200).json({ message: "date." });
    } catch (error) {
      console.error("Error occurred:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  // test: async (req, res) => {
  //   try {
  //     let date = new Date();
  //     const previous = new Date(date.getTime());
  //     let now = moment(date).format("YYYY-MM-DD");
  //     const reminder = await db.tasksToDo.findAll({
  //       endDate: { [Sequelize.Op.gte]: now },
  //       raw: true,
  //       nest: true,
  //     });

  //     for (const i in reminder) {
  //       previous.setDate(date.getDate() - reminder[i].categoryId);
  //       let previousDate = moment(previous).format("YYYY-MM-DD");

  //       const result = await db.tasksToDo.update(
  //         {
  //           completedDate: null,
  //           isCompleted: 0,
  //         },
  //         { where: { taskId: reminder[i].taskId } }
  //       );

  //       await db.tasks.update(
  //         {
  //           isCompleted: 0,
  //         },
  //         { where: { id: reminder[i].taskId } }
  //       );
  //     }
  //     return;
  //     // let taskDetails;
  //     // taskDetails = await db.tasksToDo.findAll({
  //     //   where: { taskId: reminder.taskId },
  //     // });

  //     // for (const i in taskDetails) {
  //     // var newDate;
  //     // switch (reminder.categoryId) {
  //     //   case 1:
  //     //     // const previous = new Date(date.getTime());

  //     //     newDate = moment(date).format("YYYY-MM-DD");

  //     //     break;
  //     //   case 2:
  //     //     previous.setDate(date.getDate() + 2);
  //     //     newDate = moment(previous).format("YYYY-MM-DD");

  //     //     break;
  //     //   case 7:
  //     //     previous.setDate(date.getDate() + 7);
  //     //     newDate = moment(previous).format("YYYY-MM-DD");

  //     //     break;
  //     //   case 15:
  //     //     previous.setDate(date.getDate() + 15);
  //     //     newDate = moment(previous).format("YYYY-MM-DD");

  //     //     break;
  //     //   case 30:
  //     //     previous.setDate(date.getDate() + 30);
  //     //     newDate = moment(previous).format("YYYY-MM-DD");
  //     // }
  //     // }
  //     return;
  //     for (const i in taskDetails) {
  //       var day;
  //       switch (taskDetails[i].categoryId) {
  //         case 1:
  //           // const previous = new Date(date.getTime());
  //           previous.setDate(date.getDate() - 1);
  //           day = moment(previous).format("YYYY-MM-DD");

  //           break;
  //         case 2:
  //           previous.setDate(date.getDate() - 2);
  //           day = moment(previous).format("YYYY-MM-DD");

  //           break;
  //         case 7:
  //           previous.setDate(date.getDate() - 7);
  //           day = moment(previous).format("YYYY-MM-DD");

  //           break;
  //         case 15:
  //           previous.setDate(date.getDate() - 15);
  //           day = moment(previous).format("YYYY-MM-DD");

  //           break;
  //         case 30:
  //           previous.setDate(date.getDate() - 30);
  //           day = moment(previous).format("YYYY-MM-DD");
  //       }
  //       await db.tasksToDo.update(
  //         { isCompleted: false, completedDate: date },
  //         { where: { taskId: taskDetails[i].taskId } }
  //       );
  //       await db.tasks.update(
  //         { isCompleted: false },
  //         { where: { id: taskDetails[i].taskId } }
  //       );
  //     }
  //     return;
  //     await db.tasksToDo.update(
  //       { isCompleted: false, completedDate: date },
  //       { where: { taskId: taskDetails.taskId } }
  //     );
  //     await db.tasks.update(
  //       { isCompleted: false },
  //       { where: { id: taskDetails.taskId } }
  //     );
  //   } catch (error) {
  //     console.log(error);
  //   }
  // },
};

// const client = require("twilio")(accountSid, authToken, {
//   lazyLoading: true,
// });
// client.messages
//   .create({
//     to: "+15555555555",
//     from: "+15555555551",
//     body: "Ahoy, custom requestClient!",
//   })
//   .then((message) => console.log(`Message SID ${message.sid}`))
//   .catch((error) => console.error(error));

// sequelize-auto -h localhost -d ship_advisor -u newuser -x password --dialect mysql -c config/config.json -o models -t bookingSlots
