import db from "../configs/db.js"
import InventarisBarang from "./data-barang.js";
import PenanggungJawab from "./penanggung-jawab.js";
import {Sequelize} from "sequelize"

const { DataTypes } = Sequelize;

const PeminjamanBarang = db.define("peminjaman_barang", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    inventarisBarangId: {
        type: DataTypes.INTEGER,
        references: {
            model: InventarisBarang,
            key: 'id'
        },
        allowNull: false
    },
    penanggungJawabId:{
        type: DataTypes.INTEGER,
        references: {
            model: PenanggungJawab,
            key: 'id'
        },
        allowNull: false
    },
    nama_peminjam: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email_peminjam: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    tanggal_pinjam: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    
    tanggal_kembali: {
        type: DataTypes.DATEONLY
    },
    keperluan: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status_peminjaman: {
        type: DataTypes.ENUM('Tersedia', 'Dipinjam', 'Hilang', 'Ditolak', 'Pending'),
        defaultValue: 'Dipinjam'
    }
    
}, {
    tableName: "peminjaman_barang",
    timestamps: true
});


export default PeminjamanBarang;


InventarisBarang.hasMany(PeminjamanBarang, { foreignKey: "inventarisBarangId" });
PeminjamanBarang.belongsTo(InventarisBarang, { foreignKey: "inventarisBarangId" });
PenanggungJawab.hasMany(PeminjamanBarang, { foreignKey: "penanggungJawabId" });
PeminjamanBarang.belongsTo(PenanggungJawab, { foreignKey: "penanggungJawabId" });