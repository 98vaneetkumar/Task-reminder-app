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

module.exports = {};
