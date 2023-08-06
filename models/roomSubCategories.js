const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const roomSubCategories = sequelize.define(
    "roomSubCategories",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: 1,
      },
      roomCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "roomSubCategories",
      timestamps: true,
    }
  );
  roomSubCategories.associate = function (models) {
    // associations can be defined here
    roomSubCategories.belongsTo(models.roomCategories, {
      foreignKey: "roomCategoryId",
      as: "roomCat",
    });
    // roomSubCategories.belongsTo(models.users, {
    //   foreignKey: "trainerId",
    //   as: "trainer",
    // });
  };
  return roomSubCategories;
};
