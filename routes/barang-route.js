import express from "express";
import { deleteBarang, getBarangById, saveBarang, SaveLaporan, updateBarang, UpdateLaporan, updateStatusLaporan } from "../controllers/barang-controller.js";

const routeBarang = express.Router();

routeBarang.post('/laporkanBarang/:id', SaveLaporan);
routeBarang.post('/update-status-laporan/:id', updateStatusLaporan);


//////////////////////////////  ROUTE BARANG //////////////////////////////////////////
routeBarang.post('/inventaris/create', saveBarang);
routeBarang.get('/inventaris/:id', getBarangById);
routeBarang.post('/inventaris/:id/update', updateBarang);
routeBarang.post('/inventaris/:id/delete', deleteBarang);


export default routeBarang