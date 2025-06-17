import PeminjamanBarang from "../models/peminjaman_barang.js";
import transporter from "../utils/mailer.js";
import InventarisBarang from "../models/data-barang.js";
import PenanggungJawab from "../models/penanggung-jawab.js";

export const postPeminjaman = async (req, res) => {

    const produks = await InventarisBarang.findOne({
        where:{
            id: req.body.inventarisBarangId
        },
        include:[{
            model:PenanggungJawab,
            as:'penanggungJawab',
        }]
    })

    const {
        inventarisBarangId,
        penanggungJawabId,
        nama_peminjam,
        email_peminjam,
        tanggal_pinjam,
        tanggal_kembali,
        keperluan,
        status_peminjaman
    } = req.body;
    
    try {
        const newPeminjaman = await PeminjamanBarang.create({
            inventarisBarangId,
            penanggungJawabId,
            nama_peminjam,
            email_peminjam,
            tanggal_pinjam,
            tanggal_kembali,
            keperluan,
            status_peminjaman
        });

        const email = produks.penanggungJawab.email;

        try {
            await transporter.sendMail({
                from: '"Peminjaman Barang Inventaris" <fatih.muzaqi123@gmail.com>',
                to: email,
                subject: "Notifikasi Peminjaman Barang Inventaris",
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2c3e50;">Notifikasi Peminjaman Barang Inventaris</h2>
                    <p>Halo,</p>
                    <p>Berikut adalah detail permintaan peminjaman barang inventaris dari <strong>${nama_peminjam}</strong>:</p>

                    <table style="border-collapse: collapse; width: 100%; margin-top: 10px;">
                        <tr>
                        <td style="padding: 8px; border: 1px solid #ccc;">Nama</td>
                        <td style="padding: 8px; border: 1px solid #ccc;">${nama_peminjam}</td>
                        </tr>
                        <tr>
                        <td style="padding: 8px; border: 1px solid #ccc;">Email</td>
                        <td style="padding: 8px; border: 1px solid #ccc;">${email_peminjam}</td>
                        </tr>
                        <tr>
                        <td style="padding: 8px; border: 1px solid #ccc;">Tanggal Pinjam</td>
                        <td style="padding: 8px; border: 1px solid #ccc;">${tanggal_pinjam}</td>
                        </tr>
                        <tr>
                        <td style="padding: 8px; border: 1px solid #ccc;">Tanggal Kembali</td>
                        <td style="padding: 8px; border: 1px solid #ccc;">${tanggal_kembali}</td>
                        </tr>
                        <tr>
                        <td style="padding: 8px; border: 1px solid #ccc;">Keperluan</td>
                        <td style="padding: 8px; border: 1px solid #ccc;">${keperluan || '-'}</td>
                        </tr>
                    </table>

                    <p style="margin-top: 20px;">Silakan pilih tindakan:</p>

                    <div style="margin-top: 15px;">
                        <a href="http://localhost:3000/approve/${newPeminjaman.id}"
                        style="background-color: #27ae60; color: #fff; padding: 12px 18px;
                        text-decoration: none; border-radius: 5px; font-weight: bold;
                        margin-right: 10px; display: inline-block;">
                        ✅ Setujui
                        </a>

                        <a href="http://localhost:3000/reject/${newPeminjaman.id}"
                        style="background-color: #c0392b; color: #fff; padding: 12px 18px;
                        text-decoration: none; border-radius: 5px; font-weight: bold;
                        display: inline-block;">
                        ❌ Tolak
                        </a>
                    </div>

                    <p style="margin-top: 30px; font-size: 12px; color: #888;">
                        Email ini dikirim otomatis oleh sistem Peminjaman Barang Inventaris.
                        Harap tidak membalas email ini.
                    </p>
                    </div>
                `
});

            console.log('Email berhasil dikirim ke', emailTujuan);
        } catch (emailErr) {
            console.error('Gagal mengirim email:', emailErr);
        }

        req.flash("success", "Ajuan Peminjaman Berhasil di Kirim");
        res.redirect("/dashboard-user");
    } catch (error) {
        console.log(error);
    }
};

export const approvePeminjaman = async (req, res) => {
    try {
        const peminjaman = await PeminjamanBarang.findOne({
            where: { id: req.params.id }
        });

        if (!peminjaman) {
            return res.status(404).send("Data peminjaman tidak ditemukan.");
        }

        const inventaris = await InventarisBarang.findOne({
            where: { id: peminjaman.inventarisBarangId }
        });

        if (!inventaris) {
            return res.status(404).send("Barang inventaris tidak ditemukan.");
        }

        // Update status peminjaman dan inventaris
        await peminjaman.update({ status_peminjaman: "Dipinjam" });
        await inventaris.update({ status: "Dipinjam" });

        res.send(`
            <h2>Berhasil Menyetujui Peminjaman</h2>
            <p>Status barang dan peminjaman sudah diperbarui menjadi <strong>Dipinjam</strong>.</p>
        `);
    } catch (error) {
        console.error("Terjadi kesalahan saat menyetujui peminjaman:", error);
        res.status(500).send("Terjadi kesalahan server.");
    }
};

export const rejectPeminjaman = async (req, res) => {
    try {
        const peminjaman = await PeminjamanBarang.findOne({
            where: { id: req.params.id }
        });

        if (!peminjaman) {
            return res.status(404).send("Data peminjaman tidak ditemukan.");
        }

        await peminjaman.update({ status_peminjaman: "Ditolak" });

        res.send(`
            <h2>Peminjaman Ditolak</h2>
            <p>Status peminjaman telah diubah menjadi <strong>Ditolak</strong>.</p>
        `);
    } catch (error) {
        console.error("Terjadi kesalahan saat menolak peminjaman:", error);
        res.status(500).send("Terjadi kesalahan server.");
    }
};
