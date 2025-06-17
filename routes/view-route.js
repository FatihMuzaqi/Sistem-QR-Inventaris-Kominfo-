import express from "express"
import { dataPeminjamanBarang, generateQR, getAjuanPeminjaman, getDashboard, getDashboardUser, getData, getDataUser, getDetilLaporanUser, getEditStatusLaporan, getFormLaporan, getFromPeminjaman, getLaporanUser, getLogin, getPenanggungJawab, getProfil, getRegister, getReport, showData } from "../controllers/view-controller.js";
import { ensureAuthenticated, isAuthenticated } from "../middleware/AuthMiddleware.js";

const routeView = express.Router();

routeView.get('/dashboard', isAuthenticated, getDashboard);
routeView.get('/dashboard-user', isAuthenticated, getDashboardUser);
routeView.get('/', getLogin);
routeView.get('/data-inventaris', getData);
routeView.get('/register', getRegister);
routeView.get('/data-user', getDataUser);
routeView.get('/generate/:id', generateQR);
routeView.get('/data/:id', showData);
routeView.get('/form-laporan/:id', getFormLaporan);
routeView.get('/data-laporan', getReport);
routeView.get('/data-laporan-user', getLaporanUser);
routeView.get('/detil-laporan/:id', getDetilLaporanUser);
routeView.get('/edit-status-laporan/:id', getEditStatusLaporan);
routeView.get('/data-peminjaman', dataPeminjamanBarang);
routeView.get('/form-peminjaman/:id', ensureAuthenticated, getFromPeminjaman);
routeView.get('/data-penanggung-jawab', getPenanggungJawab);
routeView.get('/data-ajuan-peminjaman',getAjuanPeminjaman);
routeView.get('/profil', getProfil)

export default routeView;