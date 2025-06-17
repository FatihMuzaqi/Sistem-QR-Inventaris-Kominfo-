import PenanggungJawab from "../models/penanggung-jawab.js";

export const postPenanggungJawab = async (req, res) => {
    const {nama, nip, jabatan_id, departemen, email, telepon, alamat, userId} = req.body;

    try {
        await PenanggungJawab.create({
            nama,
            nip,
            jabatan_id,
            departemen,
            email,
            telepon,
            alamat,
            userId
        })

        req.flash("success", "Data berhasil di tambahkan")
        return res.redirect('/data-penanggung-jawab')
        
    } catch (error) {
        console.log(error)
    }
}


// UPDATE
export const updatePenanggungJawab = async (req, res) => {
    const { id } = req.params;
    const { nama, nip, jabatan_id, departemen, email, telepon, alamat } = req.body;

    try {
        await PenanggungJawab.update({
            nama, nip, jabatan_id, departemen, email, telepon, alamat
        }, {
            where: { id }
        });
        req.flash("success", "Data berhasil diupdate");
        res.redirect('/data-penanggung-jawab');
    } catch (error) {
        console.log(error);
        req.flash("error", "Gagal mengupdate data");
        res.redirect('/data-penanggung-jawab');
    }
};

// DELETE
export const deletePenanggungJawab = async (req, res) => {
    const { id } = req.params;

    try {
        await PenanggungJawab.destroy({ where: { id } });
        req.flash("success", "Data berhasil dihapus");
        res.redirect('/data-penanggung-jawab');
    } catch (error) {
        console.log(error);
        req.flash("error", "Gagal menghapus data");
        res.redirect('/data-penanggung-jawab');
    }
};

// SHOW DETAIL
export const showPenanggungJawab = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await PenanggungJawab.findByPk(id);
        res.render('penanggung-jawab/show', { data });
    } catch (error) {
        console.log(error);
    }
};
