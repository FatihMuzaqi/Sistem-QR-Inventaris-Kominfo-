import InventarisBarang from "./data-barang.js";
import Report from "./report-barang.js";

// Relasi antara Report dan InventarisBarang
InventarisBarang.hasMany(Report, {
    foreignKey: "inventarisId",
    as: "reports"  // Pastikan alias yang sesuai
});

Report.belongsTo(InventarisBarang, {
    foreignKey: "inventarisId",
    as: "inventaris"  // Alias yang konsisten
});

export { InventarisBarang, Report };
