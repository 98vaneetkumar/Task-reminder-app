const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const notifications = sequelize.define(
    "notifications",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
      },
      taskId: {
        type: DataTypes.INTEGER,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      isSent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: "notifications",
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
  notifications.associate = function (models) {
    // associations can be defined here
    notifications.belongsTo(models.users, {
      foreignKey: "senderId",
      as: "sender",
      // sourceKey: "id",
    });
    notifications.belongsTo(models.users, {
      foreignKey: "receiverId",
      as: "receiver",
      // sourceKey: "categoryId",
    });
  };
  return notifications;
};
