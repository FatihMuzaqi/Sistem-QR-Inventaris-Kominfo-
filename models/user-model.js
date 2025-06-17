import { Sequelize } from "sequelize";
import db from "../configs/db.js";

const { DataTypes } = Sequelize;

const Users = db.define("users", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("Admin", "Operator", "User"),
        allowNull: false,
        defaultValue: "user",
    },
}, {
    freezeTableName: true,
});

export default Users;
