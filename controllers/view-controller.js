import InventarisBarang from "../models/data-barang.js"
import QRCode from "qrcode"
import Report from "../models/report-barang.js"
import PenanggungJawab from "../models/penanggung-jawab.js"
import PeminjamanBarang from "../models/peminjaman_barang.js"
import Jabatan from "../models/jabatan-model.js"
import Users from "../models/user-model.js"
import { fn, col, Sequelize } from "sequelize";

export const getDashboard = async (req, res) => {
  try {
    const dataBarang = await InventarisBarang.findAll();
    const dataReport = await Report.findAll();
    const dataPenanggungjawab = await PenanggungJawab.findAll();

    const bulanList = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    // === Laporan per bulan ===
    const reportPerBulan = await Report.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("tanggal_laporan")), "bulan"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "jumlah"]
      ],
      group: [Sequelize.fn("MONTH", Sequelize.col("tanggal_laporan"))],
      order: [[Sequelize.fn("MONTH", Sequelize.col("tanggal_laporan")), "ASC"]]
    });

    const chartDataLaporan = new Array(12).fill(0);
    reportPerBulan.forEach(item => {
      const indexBulan = item.dataValues.bulan - 1;
      chartDataLaporan[indexBulan] = parseInt(item.dataValues.jumlah);
    });

    // === Peminjaman per bulan ===
    const peminjamanPerBulan = await PeminjamanBarang.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("tanggal_pinjam")), "bulan"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "jumlah"]
      ],
      group: [Sequelize.fn("MONTH", Sequelize.col("tanggal_pinjam"))],
      order: [[Sequelize.fn("MONTH", Sequelize.col("tanggal_pinjam")), "ASC"]]
    });

    const chartDataPeminjaman = new Array(12).fill(0);
    peminjamanPerBulan.forEach(item => {
      const indexBulan = item.dataValues.bulan - 1;
      chartDataPeminjaman[indexBulan] = parseInt(item.dataValues.jumlah);
    });

    // === Render ke EJS ===
    res.render("dashboard", {
      hideNavbar: false,
      title: "Dashboard",
      dataBarang,
      dataPenanggungjawab,
      dataReport,
      chartLabels: bulanList,
      chartDataLaporan,
      chartDataPeminjaman,
    });

  } catch (error) {
    console.error("Gagal memuat dashboard:", error);
    res.status(500).send("Internal Server Error");
  }
};


export const getLogin = async (req, res) => {
    const siteKey = process.env.SITE_KEY;
    res.render('Auth/login', {
        hideNavbar: true,
        title: "Login",
        siteKey
    })
}


export const getDashboardUser = async (req, res) => {
    const currentUser = req.session.user;

    try {
        if (currentUser.role === 'Admin') {
        return res.status(403).send("Akses dilarang untuk admin di endpoint ini");
        }

        const pj = await PenanggungJawab.findOne({
        where: { userId: currentUser.id }
        });

        if (!pj) {
        return res.status(404).send("Penanggung Jawab tidak ditemukan");
        }

        const dataAjuan = await PeminjamanBarang.findAll({
            include: {
                model: InventarisBarang,
                where: { penanggungJawabId: pj.id }
            }
        });


        const reportBarang = await Report.findAll({
            where: { penanggungJawabId: pj.id }
        });

        const barang = await InventarisBarang.findOne({
        where: { penanggungJawabId: pj.id },
        include: {
            model: PenanggungJawab,
            as: 'penanggungJawab',
            include: {
            model: Users,
            attributes: ['name', 'email']
            }
        }
    });

        res.render('dashboard-user', {
            hideNavbar: false,
            title: "Dashboard User",
            datas: barang,
            currentUser,
            reportBarang,
            penanggung: [],
            dataAjuan
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
}

export const getData = async (req, res) => {
    
    const data = await InventarisBarang.findAll({
        include: {
            model: PenanggungJawab,
            as: 'penanggungJawab'
        }
    })

    const dataPenanggungjawab = await PenanggungJawab.findAll();
    res.render('Backend/inventaris/data-inventaris', {
        hideNavbar: false,
        title: "Data Inventaris",
        datas: data,
        penanggung : dataPenanggungjawab
    })
}

export const getRegister = (req, res) => {
    res.render('Auth/register', {
        hideNavbar: true,
        title: "Register"
    })
}

export const getDataUser = async (req, res) => {
    const data = await Users.findAll();
    res.render('Backend/inventaris/data-user', {
        hideNavbar:false,
        title: "Data User",
        datas: data
    })
}

export const generateQR = async (req, res) => {
    const { id } = req.params;
    const data = await InventarisBarang.findOne({
        where:{
            id: id 
        }
    })
    const url = `http://localhost:3000/data/${id}`;

    try {
        const qrCode = await QRCode.toDataURL(url);
        res.render('Frontend/qr', {
            qrCode, id ,
            hideNavbar: true,
            title: "QR Code",
            datas: data
        });
    } catch (error) {
        res.status(500).send('Gagal membuat QR Code');
    }
};

export const showData = async (req, res) => {
    const { id } = req.params;
    const data = await InventarisBarang.findOne({
        include:{
            model: PenanggungJawab,
            as: 'penanggungJawab'
        },
        where:{
            id: id 
        }
    })

    if (data) {
        res.render('Frontend/qr-detil', {
            datas: data ,
            hideNavbar: true,
            title: "QR Code"
        });
    } else {
        res.status(404).send('Data tidak ditemukan');
    }
};



export const getReport = async (req, res) => {
    const data = await Report.findAll({
        include:[
            {
                model: PenanggungJawab,
                as: 'penanggungJawab' 
            },
            {
                model: InventarisBarang,
                as: 'inventaris'
            }
    ]
    
    });
    res.render('Backend/reporting/laporan-kerusakan', {
        hideNavbar: false,
        title : "Laporan Kerusakan",
        datas: data
    })
}


export const getFormLaporan = async (req, res) => {
    const id = req.params.id;
    const data = await InventarisBarang.findOne({
        where:{
            id:id
        }, 
        include:{
            model:PenanggungJawab,
            as:'penanggungJawab'
        }
    })
    res.render('Backend/reporting/form-laporan', {
        hideNavbar:true,
        title:"Form Laporan",
        datas: data

    })
}

export const getDetilLaporanUser = async (req, res) => {
    const id = req.params.id;
    const data = await Report.findOne({
        where:{
            id:id
        },
        include:[
            {
                model: InventarisBarang,
                as: 'inventaris'
            },
            {
                model: PenanggungJawab,
                as: 'penanggungJawab'
            }
        ]
    })

    res.render('Backend/reporting/detil-laporan-user', {
        hideNavbar: true,
        title:" Detil Laporan",
        datas: data
    })
}

export const getEditStatusLaporan = async (req, res) => {
    const laporan = await Report.findOne({
        where:{
            id:req.params.id
        }
    })
    res.render('Backend/reporting/edit-status-laporan', {
        hideNavbar: true,
        title:"Edit Status Laporan",
        laporan: laporan
    })
}

export const dataPeminjamanBarang = async (req, res) => {
    const peminjaman = await PeminjamanBarang.findAll();
    res.render('Backend/peminjaman/data-peminjaman', {
        hideNavbar: false,
        title: "Ajuan Peminjaman",
        datas: peminjaman
    })
}

export const getFromPeminjaman = async (req, res) => {

    const users = req.session.user;

    const produks = await InventarisBarang.findOne({
        where:{
            id:req.params.id
        },
        include:[{
            model:PenanggungJawab,
            as:'penanggungJawab',
        }]
    })

    // const penanggung = await PenanggungJawab.findOne({
    //     where:{
    //         id:req.params.id
    //     }
    // })

    res.render('Backend/peminjaman/form-peminjaman', {
        hideNavbar: true,
        title :"From Peminjaman",
        users,
        produks
    })
}


export const getPenanggungJawab = async (req, res) => {
    const response = await PenanggungJawab.findAll();
    const jabatans = await Jabatan.findAll();
    const users = await Users.findAll({
    where: {
        role: 'user'
    },
});
    res.render('Backend/inventaris/data-penanggung-jawab', {
        hideNavbar: false,
        title :"Data Penanggung Jawab",
        datas: response,
        jabatans: jabatans,
        users: users
    })
}   

export const getLaporanUser = async (req, res) => {
    const currentUser = req.session.user;
    console.log("👤 Current user session:", currentUser);

    try {
        const pj = await PenanggungJawab.findOne({
            where: { userId: currentUser.id }
        });

        if (!pj) {
            console.warn("⚠️ Penanggung jawab tidak ditemukan untuk user ID:", currentUser.id);
            return res.status(404).send("Penanggung Jawab tidak ditemukan");
        }

        const reportBarang = await Report.findAll({
            where: { penanggungJawabId: pj.id },
            include: [
                {
                    model: PenanggungJawab,
                    as: 'penanggungJawab',
                    include: {
                        model: Users,
                        attributes: ['name', 'email']
                    }
                },
                {
                    model: InventarisBarang,
                    as: 'inventaris',
                    attributes: ['nama_barang', 'kode_barang']
                }
            ]
        });

        console.log("📦 Data laporan ditemukan:", reportBarang.length);

        res.render('Backend/reporting/user-laporan-kerusakan', {
            hideNavbar: false,
            title: "Laporan Kerusakan User",
            datas: reportBarang,
        });

    } catch (error) {
        console.error("💥 Error di getLaporanUser:", error.message);
        console.error(error.stack);
        res.status(500).send("Terjadi kesalahan pada server");
    }
};

export const getAjuanPeminjaman = async (req, res) => {
    const currentUser = req.session.user;
    console.log("👤 Current user session:", currentUser);

    try {
        // Cari penanggung jawab berdasarkan userId dari session
        const pj = await PenanggungJawab.findOne({
            where: { userId: currentUser.id }
        });

        if (!pj) {
            console.warn("⚠️ Penanggung jawab tidak ditemukan untuk user ID:", currentUser.id);
            return res.status(404).send("Penanggung Jawab tidak ditemukan");
        }

        // Cari data peminjaman barang berdasarkan inventaris yang dimiliki oleh penanggung jawab
        const dataPeminjaman = await PeminjamanBarang.findAll({
            include: [
                {
                    model: InventarisBarang,
                    where: { penanggungJawabId: pj.id },
                    include: [
                        {
                            model: PenanggungJawab,
                            as: 'penanggungJawab',
                            include: {
                                model: Users,
                                attributes: ['name', 'email']
                            }
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        console.log("📦 Data peminjaman ditemukan:", dataPeminjaman.length);

        res.render('Backend/peminjaman/user-ajuan-peminjaman', {
            hideNavbar: false,
            title: "Ajuan Peminjaman User",
            datas: dataPeminjaman
        });

    } catch (error) {
        console.error("💥 Error di getAjuanPeminjaman:", error.message);
        console.error(error.stack);
        res.status(500).send("Terjadi kesalahan pada server");
    }
}


//MASIH PEMERIKSAAN
export const getPeminjamanByUserLogin = async (req, res) => {
try {
    const dataPeminjaman = await PeminjamanBarang.findAll({
        include: [
            {
            model: InventarisBarang,
            include: [
                {
                model: PenanggungJawab,
                required: true,
                where: {
                    userId: req.user.id 
                },
                include: [
                    {
                    model: Users,
                    attributes: ['id', 'name', 'email']
                    }
                ],
                attributes: ['id', 'nama', 'email']
                }
            ],
            attributes: ['id', 'nama_barang', 'kode_barang', 'status']
            }
        ],
        attributes: [
            'id',
            'nama_peminjam',
            'email_peminjam',
            'telp_peminjam',
            'tanggal_pinjam',
            'tanggal_kembali',
            'keperluan',
            'status_peminjaman'
        ]
        });

    res.status(200).json({
        status: "success",
        total: dataPeminjaman.length,
        data: dataPeminjaman
    });
    } catch (error) {
        console.error("Gagal mengambil data peminjaman:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil data peminjaman." });
    }
};


export const getProfil = async (req, res) => {
    res.render('Backend/Profile/profil', {
        hideNavbar: false,
        title: "Profile",
    })
}