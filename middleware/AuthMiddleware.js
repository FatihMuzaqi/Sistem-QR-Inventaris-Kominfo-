export const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next(); 
    } else {
        res.redirect("/");
    }
}

export const ensureAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }

    // Simpan URL tujuan sebelum login
    req.session.returnTo = req.originalUrl;
    return res.redirect('/');
};
