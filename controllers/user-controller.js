import Users from "../models/user-model.js"
import bcrypt from "bcrypt"
import axios from 'axios';

export const postData = async (req, res) => {
    const data = await Users.findAll()
    res.status(200).json({
        status:"success",
        data: data
    })
}

export const Register = async (req, res) => {
    const {name, email, password, confPassword} = req.body;

    const user = await Users.findOne({
        where: {
            email: email
        }
    })

    if(user){
        req.flash('error', 'Email Sudah ada')
        return res.redirect('/register');
    }

    if(confPassword !== password){
        req.flash('error', 'Password Tidak Sama')
        return res.redirect('/register');
    }

    const salt = await bcrypt.genSalt();
    const hashpassword = await bcrypt.hash(password, salt);

    Users.create({
        name: name,
        email: email,
        role: 'User',
        password: hashpassword
    })

    req.flash('success', 'Laporan berhasil dikirim');
    res.redirect('/');
}


export const Login = async (req, res) => {
    const { email, password, 'g-recaptcha-response': recaptchaToken } = req.body;

    // Verifikasi reCAPTCHA dulu
    if (!recaptchaToken) {
        req.flash('error', 'Silakan centang reCAPTCHA');
        return res.redirect('/');
    }

    try {
        const secretKey = process.env.SECREAT_KEY; // simpan di .env
        const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

        const { data } = await axios.post(verifyURL);

        if (!data.success) {
            req.flash('error', 'Verifikasi reCAPTCHA gagal');
            return res.redirect('/');
        }
    } catch (err) {
        console.error('reCAPTCHA error:', err);
        req.flash('error', 'Gagal memverifikasi reCAPTCHA');
        return res.redirect('/');
    }

    // Lanjut proses login
    const user = await Users.findOne({ where: { email: email } });

    if (!user) {
        req.flash('error', 'Email tidak ditemukan');
        return res.redirect('/');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        req.flash('error', 'Password tidak sesuai');
        return res.redirect('/');
    }

    req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    req.flash('success', 'Login berhasil!');

    let redirectTo;

    if (req.session.returnTo) {
        redirectTo = req.session.returnTo;
        delete req.session.returnTo;
    } else {
        redirectTo = user.role === 'User' ? '/dashboard-user' : '/dashboard';
    }

    return res.redirect(redirectTo);
};



export const Logout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                status: "error",
                message: "Gagal logout, coba lagi"
            });
        }
        res.clearCookie("connect.sid");
        return res.redirect('/')
    });
}

export const postAdminUser = async (req, res) => {
    const {name, email, password, confPassword} = req.body;

    const user = await Users.findOne({
        where: {
            email: email
        }
    })

    if(user){
        req.flash('error', 'Email Sudah ada')
        return res.redirect('/data-user')
    }

    if(confPassword !== password){
        req.flash('error', 'Password Tidak Sama')
        return res.redirect('/data-user')
    }

    const salt = await bcrypt.genSalt();
    const hashpassword = await bcrypt.hash(password, salt);

    Users.create({
        name: name,
        email: email,
        role: 'User',
        password: hashpassword
    })

    req.flash('success', 'Laporan berhasil dikirim');
    res.redirect('/data-user');
}



export const updateUser = async (req, res) => {
    const { name, email, role } = req.body;
    const user = await Users.findOne({ where: { id: req.params.id } });

    if (!user) {
        req.flash('error', 'User tidak ditemukan');
        return res.redirect('/users');
    }

    await Users.update(
        { name, email, role },
        { where: { id: req.params.id } }
    );

    req.flash('success', 'Data user diperbarui');
    res.redirect('/data-user');
};


export const deleteUser = async (req, res) => {
    const user = await Users.findOne({ where: { id: req.params.id } });

    if (!user) {
        req.flash('error', 'User tidak ditemukan');
        return res.redirect('/data-user');
    }

    await Users.destroy({ where: { id: req.params.id } });

    req.flash('success', 'User berhasil dihapus');
    res.redirect('/data-user');
};
