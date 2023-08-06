const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "users",
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
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      countryCode: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      mobile: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("0", "1", "2"),
        allowNull: false,
        defaultValue: "2",
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: "1",
      },
      notifyStatus: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
      },
      is_otp_verify: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      deviceType: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "0=ios , 1=android,2=web",
      },
      deviceToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      loginTime: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      forgotPasswordToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      otp: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      socialId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "0=facebook, 1=google, 2=apple",
      },
      socialType: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      idDelete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      firstTimeLogin: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "users",
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
};
