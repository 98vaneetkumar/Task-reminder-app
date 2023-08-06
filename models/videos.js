const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const videos = sequelize.define(
    "videos",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      video: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      thumbnail: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "videos",
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
  videos.associate = function (models) {
    // associations can be defined here
    videos.hasOne(models.category, {
      foreignKey: "id",
      sourceKey: "categoryId",
    });
  };
  return videos;
};
