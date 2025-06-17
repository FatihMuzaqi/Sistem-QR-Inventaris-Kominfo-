import express from "express";
import { approvePeminjaman, postPeminjaman, rejectPeminjaman } from "../controllers/peminjaman-controller.js";

const routePeminjaman = express.Router();

routePeminjaman.post('/add-peminjaman', postPeminjaman);
routePeminjaman.get('/approve/:id', approvePeminjaman);
routePeminjaman.get('/reject/:id', rejectPeminjaman);

export default routePeminjaman