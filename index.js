import express from "express"
import route from "./routes/user-route.js"
import Users from "./models/user-model.js"
import db from "./configs/db.js"
import session from "express-session"
import expressEjsLayouts from "express-ejs-layouts"
import ejs from "ejs"
import routeView from "./routes/view-route.js"
import InventarisBarang from "./models/data-barang.js"
import fileUpload from "express-fileupload"
import flash from "express-flash"
import Jabatan from "./models/jabatan-model.js"
import Report from "./models/report-barang.js"
import routeBarang from "./routes/barang-route.js"
import PeminjamanBarang from "./models/peminjaman_barang.js"
import routePeminjaman from "./routes/peminjaman-route.js"
import PenanggungJawab from "./models/penanggung-jawab.js"
import routePenanggungJawab from "./routes/penanggung-jawab-route.js"
import dotenv from "dotenv"

const app = express();
const port = 3000;

dotenv.config()

try {
    await db.authenticate();
    console.log('Database Connect...')
    // await db.sync({alter:true});
    // await InventarisBarang.sync({alter:true})
    // await Report.sync()
    // await PeminjamanBarang.sync();
    // await PenanggungJawab.sync()
    // await Jabatan.sync();
    // await Users.sync();
} catch (error) {
    console.log(error)
}

app.use(flash());

app.use(session({
    secret: 'ahsbhdveiuewndinxwjubvucbechbewnckewoxmwinsoq',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60
    }
}))

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.flash = req.flash();
    next();
});

app.set('view engine', 'ejs')
app.use(expressEjsLayouts);
app.set('layout', 'layouts/main');
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(route);
app.use(routeView);
app.use(routeBarang);
app.use(routePeminjaman);
app.use(routePenanggungJawab);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})