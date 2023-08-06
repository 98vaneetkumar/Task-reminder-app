const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const tasks = sequelize.define(
    "tasks",
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
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false,
      },
      type: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "roomCategoryId",
      },
    },
    {
      sequelize,
      tableName: "tasks",
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
  tasks.associate = function (models) {
    // associations can be defined here
    tasks.belongsTo(models.roomCategories, {
      foreignKey: "type",
      as: "roomCat",
    });
    tasks.hasMany(models.tasksToDo, {
      foreignKey: "taskId",
      as: "task",
    });
    tasks.hasMany(models.tasksToDo, {
      foreignKey: "taskId",
      as: "roomSubCategory",
    });
    tasks.belongsTo(models.category, {
      foreignKey: "categoryId",
      sourceKey: "id",
      as: "category",
    });
    tasks.belongsTo(models.users, {
      foreignKey: "createdBy",
      as: "user",
    });
  };
  return tasks;
};
