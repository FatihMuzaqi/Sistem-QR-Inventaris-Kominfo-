import { Sequelize } from "sequelize";
import db from '../configs/db.js';

const { DataTypes } = Sequelize;

const InventarisBarang = db.define('inventaris_barang', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_barang: {
        type: DataTypes.STRING,
        allowNull: false
    },
    kode_barang: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    kategori: {
        type: DataTypes.ENUM('Elektronik')
    },
    tanggal_masuk: {
        type: DataTypes.DATEONLY
    },
    kondisi: {
        type: DataTypes.ENUM('Baik', 'Rusak', 'Perlu Perbaikan')
    },
    status: {
        type: DataTypes.ENUM('Tersedia', 'Dipinjam', 'Hilang'),
        defaultValue: 'Tersedia'
    },
    stok: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    image: {
        type: DataTypes.STRING, // bisa diisi path atau nama file gambar
        allowNull: true
    },
    penanggungJawabId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'penanggung_jawab',
            key: 'id'
        }
    }
}, {
    freezeTableName: true,
    timestamps: false 
});


export default InventarisBarang;
