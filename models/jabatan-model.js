import db from "../configs/db.js"
import {Sequelize} from "sequelize"

const { DataTypes } = Sequelize;
const Jabatan = db.define("jabatan", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    jabatan: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
        tableName: "jabatan",
        timestamps: true  
});

export default Jabatan