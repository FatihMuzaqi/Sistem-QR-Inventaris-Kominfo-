import { Sequelize } from "sequelize";
import db from '../configs/db.js';
import Jabatan from "./jabatan-model.js";
import InventarisBarang from "./data-barang.js";
import Users from "./user-model.js";

const { DataTypes } = Sequelize;

const PenanggungJawab = db.define("penanggung_jawab", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nip: {
        type: DataTypes.STRING,
        allowNull: true
    },
    jabatan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Jabatan,
            key: 'id'
        }
    },
    departemen: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
        isEmail: true
        }
    },
    telepon: {
        type: DataTypes.STRING,
        allowNull: true
    },
    alamat: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Users,
            key: 'id'
        }
}

    }, {
        tableName: "penanggung_jawab",
        timestamps: true  
});

    Users.hasOne(PenanggungJawab, { foreignKey: 'userId' });
    PenanggungJawab.belongsTo(Users, { foreignKey: 'userId' });



    PenanggungJawab.hasMany(InventarisBarang, {
        foreignKey: 'penanggungJawabId',
        as: 'barang'
    });
    
    InventarisBarang.belongsTo(PenanggungJawab, {
        foreignKey: 'penanggungJawabId',
        as: 'penanggungJawab'
    });

export default PenanggungJawab
