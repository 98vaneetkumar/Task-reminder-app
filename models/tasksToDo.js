const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const tasksToDo = sequelize.define(
    "tasksToDo",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      roomCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      whatToDo: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      startTime: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      endTime: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      currentState: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      completedDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "tasksToDo",
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
  tasksToDo.associate = function (models) {
    // associations can be defined here
    tasksToDo.belongsTo(models.roomCategories, {
      foreignKey: "roomCategoryId",
      sourceKey: "id",
      as: "roomCategory",
    });
  };
  return tasksToDo;
};
