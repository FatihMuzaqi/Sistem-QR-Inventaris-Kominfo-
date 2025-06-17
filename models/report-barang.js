// models/report.js
import { Sequelize } from "sequelize";
import db from "../configs/db.js";
import InventarisBarang from "./data-barang.js";
import PenanggungJawab from "./penanggung-jawab.js";

const { DataTypes } = Sequelize;

const Report = db.define("report", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    inventarisId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: "inventaris_barang",
        key: "id"
        },
        onDelete: "CASCADE"
    },
    penanggungJawabId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: "penanggung_jawab",
        key: "id"
        },
        onDelete: "CASCADE"
    },
    kondisi_laporan: {
        type: DataTypes.ENUM("Baik", "Rusak", "Perlu Perbaikan"),
        allowNull: false
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    tanggal_laporan: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    status_laporan:{
        type: DataTypes.ENUM("Diterima", "Ditolak", "Dalam Proses"),
        defaultValue:"Dalam Proses",
        allowNull:false
    },
    images:{
        type: DataTypes.STRING
    }
    }, {
    tableName: "report",
    freezeTableName: true,
    timestamps: false
    }); 

// Hook afterCreate untuk memperbarui kondisi barang saat laporan baru dibuat
Report.afterCreate(async (report) => {
    try {
        // Update kondisi di InventarisBarang setelah laporan dibuat
        await InventarisBarang.update({ 
            kondisi: report.kondisi_laporan 
        },{ 
            where: 
            { 
                id: report.inventarisId 
            } 
        }
        );
    } catch (error) {
        console.error("Gagal mengupdate kondisi barang: ", error);
    }
    });

// Hook afterUpdate untuk memperbarui kondisi barang jika laporan diperbarui
Report.afterUpdate(async (report) => {
    try {
        // Update kondisi di InventarisBarang setelah laporan diperbarui
        await InventarisBarang.update(
        { kondisi: report.kondisi_laporan },
        { where: { id: report.inventarisId } }
        );
    } catch (error) {
        console.error("Gagal mengupdate kondisi barang setelah update laporan: ", error);
    }
    });

    Report.belongsTo(InventarisBarang, {
        foreignKey: "inventarisId",
        as: "inventaris"
    });

    Report.belongsTo(PenanggungJawab, {
        foreignKey: "penanggungJawabId",
        as: "penanggungJawab"
    })


    
    //SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS

    Report.afterUpdate(async (report) => {
        try {
            // Jika status laporan berubah menjadi "Diterima", set kondisi menjadi "Baik"
            if (report.status_laporan === "Diterima") {
                await InventarisBarang.update(
                    { kondisi: "Baik" },
                    { where: { id: report.inventarisId } }
                );
            } else {
                // Jika tidak, update sesuai kondisi_laporan dari report
                await InventarisBarang.update(
                    { kondisi: report.kondisi_laporan },
                    { where: { id: report.inventarisId } }
                );
            }
        } catch (error) {
            console.error("Gagal mengupdate kondisi barang setelah update laporan: ", error);
        }
    });
    

    Report.afterUpdate(async (report) => {
        try {
            let kondisiBaru;
    
            if (report.status_laporan === "Diterima") {
                kondisiBaru = "Baik";
    
                // Update kondisi_laporan di Report menjadi "Baik" juga
                if (report.kondisi_laporan !== "Baik") {
                    await Report.update(
                        { kondisi_laporan: "Baik" },
                        { where: { id: report.id } }
                    );
                }
    
            } else {
                kondisiBaru = report.kondisi_laporan;
            }
    
            // Update kondisi barang di InventarisBarang
            await InventarisBarang.update(
                { kondisi: kondisiBaru },
                { where: { id: report.inventarisId } }
            );
    
        } catch (error) {
            console.error("Gagal mengupdate kondisi barang dan laporan setelah update:", error);
        }
    });
    

export default Report;