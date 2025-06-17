import InventarisBarang from "../models/data-barang.js";
import Report from "../models/report-barang.js"
import path from "path"
import fs from "fs"
import PenanggungJawab from "../models/penanggung-jawab.js";
import crypto from "crypto"


export const SaveLaporan = async (req, res) => {
    try {
        const data = await InventarisBarang.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!data) return res.status(404).json({ msg: "Data inventaris tidak ditemukan" });

        if (!req.files || !req.files.images) {
            return res.status(400).json({ msg: "File tidak ditemukan" });
        }

        const { kondisi_laporan, deskripsi, tanggal_laporan } = req.body;
        const file = req.files.images;
        const ext = path.extname(file.name).toLowerCase();
        const fileName = file.md5 + ext;
        const allowedTypes = ['.png', '.jpg', '.jpeg'];

        if (!allowedTypes.includes(ext)) {
            return res.status(422).json({ msg: "File harus PNG, JPG, atau JPEG" });
        }

        if (file.size > 5 * 1024 * 1024) {
            return res.status(422).json({ msg: "Ukuran file maksimal 5MB" });
        }

        file.mv(`./public/images/${fileName}`, async (err) => {
            if (err) return res.status(500).json({ msg: err.message });

            try {
                const newData = await Report.create({
                    nama_barang: data.nama_barang,
                    kode_barang: data.kode_barang,
                    inventarisId: data.id,
                    penanggungJawabId: data.penanggungJawabId,
                    kondisi_laporan,
                    deskripsi,
                    tanggal_laporan,
                    status_laporan: "Dalam Proses",
                    status:data.status,
                    images: fileName,
                });

                await newData.save();

                req.flash('success', 'Laporan berhasil dikirim');
                return res.redirect(`/detil-laporan/${newData.id}`);
            } catch (error) {
                console.error("Gagal menyimpan laporan:", error.message);
                return res.status(500).json({ msg: "Gagal menyimpan laporan", error: error.message });
            }
        });
    } catch (error) {
        console.error("Terjadi kesalahan:", error.message);
        return res.status(500).json({ msg: "Internal server error", error: error.message });
    }
};


export const UpdateLaporan = async (req, res) => {
    try {
        const data = await InventarisBarang.findOne({
            where: {
                id: req.params.id
            }
        });

        const kodeBarang = 'BRG' + crypto.randomInt(100, 999);

        if (!data) return res.status(404).json({ msg: "Laporan tidak ditemukan" });

        let fileName = data.images;
        const {nama_barang, kondisi_laporan, tanggal_laporan, deskripsi, status} = req.body;
        if (req.files && req.files.file) {
            const file = req.files.file;
            const ext = path.extname(file.name).toLowerCase();
            const allowedExt = [".png", ".jpg", ".jpeg"];

            if (!allowedExt.includes(ext)) {
                return res.status(422).json({ msg: "Format file harus PNG, JPG, atau JPEG" });
            }

            if (file.size > 5 * 1024 * 1024) {
                return res.status(422).json({ msg: "Ukuran file maksimal 5MB" });
            }

            if (data.images) {
                const oldPath = `./public/images/${data.images}`;
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            fileName = `${file.md5}${ext}`;
            await file.mv(`./public/images/${fileName}`);
        }

        try {
            const data = await Report.create({
                nama_barang,
                kode_barang: kodeBarang,
                penanggung_jawab,
                kondisi_laporan,
                tanggal_laporan,
                deskripsi,
                status,
                images: fileName,
            });

            await data.save();

            req.flash('success', 'Data laporan di kirim')
            res.redirect('/form-laporan');

        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ msg: "Gagal menyimpan laporan", error: error.message });
        }

        await data.save();

        return res.redirect('/data-laporan');
    } catch (error) {
        console.error("Gagal memperbarui laporan:", error);
        return res.status(500).json({ msg: "Terjadi kesalahan saat memperbarui laporan" });
    }
};

//  UPDATE STATUS LAPORAN 
export const updateStatusLaporan = async (req, res) => {
    const { id } = req.params;
    const { status_laporan } = req.body;

    try {
        // Cari laporan berdasarkan ID
        const laporan = await Report.findOne({
            where: { id }
        });

        if (!laporan) {
            return res.status(404).json({ msg: "Laporan tidak ditemukan" });
        }

        laporan.status_laporan = status_laporan;

        await laporan.save();

        if (status_laporan === "Diterima") {
            await InventarisBarang.update(
                { kondisi: "Baik" },
                { where: { id: laporan.inventarisId } }
            );
        } else {
            await InventarisBarang.update(
                { kondisi: laporan.kondisi_laporan || "Rusak" },
                { where: { id: laporan.inventarisId } }
            );
        }

        req.flash('success', 'Status Berhasil di Update')
        return res.redirect('/data-laporan');

    } catch (error) {
        console.error("Error saat memperbarui status laporan:", error);
        return res.status(500).json({ msg: "Terjadi kesalahan saat memperbarui laporan", error: error.message });
    }
};


export const DeleteLaporan =  async(req, res) => {
    const produks = await InventarisBarang.findOne({
        where:{
            id:req.params.id
        }
    })
    if(!produks) return res.status(400).json({msg:"no data found"});
    try {
        const filePath = `./public/images/${produks.image}`
        fs.unlinkSync(filePath)
        await Produks.destroy({
            where:{
                id:req.params.id
            }
        })
        res.status(200).json({msg:"Produk berhasil di hapus"})
    } catch (error) {
        console.log(error)
    }
}



///////////////////////////////////////// BARANG INVENTARIS //////////////////////////////////////////////////////// 

export const saveBarang = async (req, res) => {
  try {
    const {
      nama_barang,
      kategori,
      kondisi,
      tanggal_masuk,
      status,
      penanggungJawabId,
      stok
    } = req.body;

    const kodeBarang = 'BRG' + crypto.randomInt(100, 999);
    let imageName = null;

    // Validasi dan proses file gambar
    if (req.files && req.files.image) {
      const image = req.files.image;

      // Validasi ekstensi
      const allowedTypes = ['.png', '.jpg', '.jpeg'];
      const ext = path.extname(image.name).toLowerCase();

      if (!allowedTypes.includes(ext)) {
        req.flash('error', 'Format file tidak didukung. Hanya PNG, JPG, dan JPEG.');
        return res.redirect('/data-inventaris');
      }

      // Validasi ukuran maksimal 5 MB
      const maxSize = 5 * 1024 * 1024; // 5 MB
      if (image.size > maxSize) {
        req.flash('error', 'Ukuran file terlalu besar. Maksimal 5 MB.');
        return res.redirect('/data-inventaris');
      }

      // Simpan file ke folder public/uploads
      const fileName = `IMG-${Date.now()}${ext}`;
      const uploadPath = path.join('./public/uploads', fileName);
      await image.mv(uploadPath);
      imageName = fileName;
    }

    // Simpan ke database
    await InventarisBarang.create({
      nama_barang,
      kode_barang: kodeBarang,
      kategori,
      tanggal_masuk,
      kondisi,
      status,
      stok,
      image: imageName,
      penanggungJawabId
    });

    req.flash('success', 'Tambah Data Berhasil');
    res.redirect('/data-inventaris');

  } catch (error) {
    console.error(error);
    req.flash('error', 'Gagal menambahkan data');
    res.redirect('/data-inventaris');
  }
};


export const updateBarang = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      nama_barang,
      kategori,
      kondisi,
      tanggal_masuk,
      status,
      penanggungJawabId,
      stok
    } = req.body;

    // Ambil data lama berdasarkan ID
    const barang = await InventarisBarang.findByPk(id);
    if (!barang) {
      req.flash('error', 'Data tidak ditemukan');
      return res.redirect('/data-inventaris');
    }

    let imageName = barang.image; // default: gambar lama

    // Jika ada file baru diunggah
    if (req.files && req.files.image) {
      const image = req.files.image;
      const allowedTypes = ['.png', '.jpg', '.jpeg'];
      const ext = path.extname(image.name).toLowerCase();
      const maxSize = 5 * 1024 * 1024; // 5 MB

      if (!allowedTypes.includes(ext)) {
        req.flash('error', 'Format gambar tidak didukung (hanya PNG, JPG, JPEG)');
        return res.redirect('/data-inventaris');
      }

      if (image.size > maxSize) {
        req.flash('error', 'Ukuran gambar maksimal 5 MB');
        return res.redirect('/data-inventaris');
      }

      // Hapus gambar lama jika ada
      if (barang.image) {
        const oldImagePath = path.join('./public/uploads', barang.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Simpan gambar baru
      const newFileName = `IMG-${Date.now()}${ext}`;
      const uploadPath = path.join('./public/uploads', newFileName);
      await image.mv(uploadPath);
      imageName = newFileName;
    }

    // Update data di database
    await barang.update({
      nama_barang,
      kategori,
      tanggal_masuk,
      kondisi,
      status,
      stok,
      image: imageName,
      penanggungJawabId
    });

    req.flash('success', 'Data berhasil diperbarui');
    res.redirect('/data-inventaris');

  } catch (error) {
    console.error(error);
    req.flash('error', 'Gagal memperbarui data');
    res.redirect('/data-inventaris');
  }
};

export const deleteBarang = async (req, res) => {
    const { id } = req.params;

    try {
        await InventarisBarang.destroy({
            where: { id: id }
        });

        req.flash('success', 'Hapus Data Berhasil');
        res.redirect('/data-inventaris');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Hapus Data Gagal');
        res.redirect('/data-inventaris');
    }
};

export const getBarangById = async (req, res) => {
    const { id } = req.params;

    try {
        const barang = await InventarisBarang.findOne({
            where: { id: id },
            include: [{ model: PenanggungJawab }] // jika ada relasi
        });

        if (!barang) {
            req.flash('error', 'Data tidak ditemukan');
            return res.redirect('/data-inventaris');
        }

        res.render('detailBarang', { barang }); // atau bisa juga `res.json(barang);` jika API
    } catch (error) {
        console.error(error);
        req.flash('error', 'Gagal mengambil data');
        res.redirect('/data-inventaris');
    }
};
