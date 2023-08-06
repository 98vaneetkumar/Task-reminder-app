var DataTypes = require("sequelize").DataTypes;
var _notifications = require("./notifications");

function initModels(sequelize) {
  var notifications = _notifications(sequelize, DataTypes);


  return {
    notifications,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
