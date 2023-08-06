const helper = require("../helper/helper");
const { Validator } = require("node-input-validator");
// var aes256 = require("aes256");
var CryptoJS = require("crypto-js");
const moment = require("moment");
const db = require("../models");
const fileUpload = require("express-fileupload");
const { Op } = require("sequelize");
const env = require("dotenv").config();
const ffmpeg = require("fluent-ffmpeg");
module.exports = {
  videosList: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      let title = "Videos List";
      const videos = await db.videos.findAll({
        // include: [
        //   {
        //     model: db.category,
        //     as: "category",
        //   },
        // ],
        order: [["id", "DESC"]],
        raw: true,
        nest: true,
      });
      console.log(
        "🚀 ~ file: videoControllers.js:27 ~ videosList: ~ videos:",
        videos
      );

      res.render("dashboard/video/list", { videos, title });
    } catch (error) {
      console.log(error);
    }
  },

  addVideo: async (req, res) => {
    try {
      let title = "Add Videos";
      if (!req.session.user) return res.redirect("/admin/login");
      const category = await db.category.findAll({ raw: true, nest: true });
      res.render("dashboard/video/add", { category, title });
    } catch (error) {
      console.log(error);
    }
  },

  editVideo: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      const category = await db.category.findAll({ raw: true, nest: true });
      const data = await db.videos.findOne({ where: { id: req.params.id } });
      //   res.json(data);
      let title = "editCategory";

      res.render("dashboard/video/add", { data, category, title });
    } catch (error) {
      console.log(error);
    }
  },
  addVideos: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      // return;
      let finalThumbnailVideo;
      var videos = Array.isArray(req.files.videos)
        ? req.files.videos
        : [req.files.videos];

      if (req.files && req.files.videos) {
        var videos = req.files.videos;
        console.log(videos, "videos");

        if (videos) {
          var videoName = await helper.fileUpload(videos, "videos");

          ffmpeg(process.cwd() + `/public/images/videos/${videoName}`)
            .screenshots({
              timestamps: ["05%"],
              filename: `${videoName}` + "thumbnail.jpg",
              folder: process.cwd() + "/public/images/videos/",
              size: "320x240",
            })
            .on("end", async function () {
              finalThumbnailVideo.push(`${videoName}` + "thumbnail.jpg");
            });

          var thumbnail = `${videoName}thumbnail.jpg`;
        }
      }
console.log("req.body====>",req.body)
      await db.videos.create({
        // categoryId: req.body.catId,
        // categoryId:null,
        video: videoName,
        thumbnail: thumbnail,
        title: req.body.title,
        description: req.body.description,
      });

      res.redirect("/admin/videos_list");
    } catch (error) {
      console.log(error);
    }
  },
  updateVideo: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      // return;
      let finalThumbnailVideo;
      // var videos = Array.isArray(req.files.videos)
      //   ? req.files.videos
      //   : [req.files.videos];

      if (req.files && req.files.videos) {
        var videos = req.files.videos;
        console.log(videos, "videos");

        if (videos) {
          var videoName = await helper.fileUpload(videos, "videos");

          ffmpeg(process.cwd() + `/public/images/videos/${videoName}`)
            .screenshots({
              timestamps: ["05%"],
              filename: `${videoName}` + "thumbnail.jpg",
              folder: process.cwd() + "/public/images/videos/",
              size: "320x240",
            })
            .on("end", async function () {
              finalThumbnailVideo.push(`${videoName}` + "thumbnail.jpg");
            });

          var thumbnail = `${videoName}thumbnail.jpg`;
        }
      }

      await db.videos.update(
        {
          // catId: req.body.catId,
          video: videoName,
          title: req.body.title,
          thumbnail: thumbnail,
          description: req.body.description,
        },
        { where: { id: req.body.id } }
      );

      res.redirect("/admin/videos_list");
    } catch (error) {
      console.log(error);
    }
  },

  deleteVideo: async (req, res) => {
    try {
      const result = await db.videos.destroy({ where: { id: req.body.id } });

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
