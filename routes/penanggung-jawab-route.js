import express from "express"
import { deletePenanggungJawab, postPenanggungJawab, updatePenanggungJawab } from "../controllers/penanggung-jawab-controller.js";

const routePenanggungJawab = express.Router();

routePenanggungJawab.post('/penanggung-jawab', postPenanggungJawab);
routePenanggungJawab.post('/penanggung-jawab/update/:id', updatePenanggungJawab); // Update
routePenanggungJawab.post('/penanggung-jawab/delete/:id', deletePenanggungJawab); // Delete

export default routePenanggungJawab;