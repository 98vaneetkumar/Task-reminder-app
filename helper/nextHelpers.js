const { Validator } = require("node-input-validator");
const helper = require("../helper/helper");
const db = require("../models");
var jwt = require("jsonwebtoken");
const secretKey = process.env.secretKey;
const SECRET_KEY =
  "U2FsdGVkX19aDKvxj/Nr/Cp6cb70gK7mBnJzVQ0WYNand9iM1LlcvIRe8qzC44RdN4VPefFG5o2/Q031Mxwv7A==";
const PUBLISH_KEY =
  "U2FsdGVkX1/vYsCHDLw74pt+ZfQPJuOWK2w+l9AMgUfMNVXCXpvz7TDpx6xKd0T1PG8WRFgYy5aaawoo2IDO/g==";

module.exports = {
  authenticateHeader: async function (req, res, next) {
    // console.log(req.headers, "--------in header check------------");
    const v = new Validator(req.headers, {
      secret_key: "required|string",
      publish_key: "required|string",
    });

    let errorsResponse = await helper.checkValidation(v);

    if (errorsResponse) {
      return helper.failed(res, errorsResponse);
    }

    if (
      req.headers.secret_key !== SECRET_KEY ||
      req.headers.publish_key !== PUBLISH_KEY
    ) {
      return helper.failed(res, "Key not matched!");
    }
    next();
  },

  authenticateJWT: async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];

      jwt.verify(token, secretKey, async (err, user) => {
        if (err) {
          return res.status(403).json({
            success: false,
            code: 403,
            body: {},
          });
        }

        const existingUser = await db.users.findOne({
          where: {
            id: user.data.id,
            loginTime: user.data.loginTime,
          },
          attributes: [
            "id",
            "name",
            "email",
            "image",
            "loginTime",
            "mobile",
            "countryCode",
          ],
          raw: true,
          nest: true,
        });

        if (!existingUser) {
          return res.status(403).json({
            success: false,
            code: 403,

            body: {},
          });
        }
        req.user = existingUser;

        next();
      });
    } else {
      res.sendStatus(401);
    }
  },

  verifyUser: async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      console.log("object");
      jwt.verify(token, secretKey, async (err, payload) => {
        if (err) {
          return res.sendStatus(403);
        }
        console.log("object,,,,,,,,", payload.data.id);
        const existingUser = await db.users.findOne({
          where: {
            id: payload.data.id,
            login_time: payload.data.login_time,
          },
        });
        console.log("existingUser,,,,,,,,,,,,,,,,,", existingUser);

        // const existingUser = await db.users.findOne({
        //   where: {
        //     id: payload.id,
        //     login_time: payload.login_time,
        //   },
        // });
        if (existingUser) {
          req.user = existingUser;
          next();
        } else {
          res.sendStatus(401);
        }
      });
    } else {
      res.sendStatus(401);
    }
  },
};
