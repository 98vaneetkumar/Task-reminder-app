const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const roomCategories = sequelize.define(
    "roomCategories",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      catId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    },
    {
      sequelize,
      tableName: "roomCategories",
      timestamps: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );
  roomCategories.associate = function (models) {
    roomCategories.hasMany(models.roomSubCategories, {
      foreignKey: "roomCategoryId",
      as: "roomSubCategory",
    });
    roomCategories.belongsTo(models.category, {
      as: "category",
      foreignKey: "catId",
    });
    // roomCategories.hasMany(models.roomSubCategories, {
    //   foreignKey: "roomCatId",
    //   // as: "roomCat",
    // });
  };

  return roomCategories;
};
