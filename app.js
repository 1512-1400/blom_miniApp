const express = require(`express`)
const path = require(`path`)
const body_parser = require(`body-parser`)
const userRoutes = require(`./routes/userRoutes`)
const multer = require(`multer`)
const fs = require(`fs`)
const sequelize = require('./config/database');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const reminderRoutes = require(`./routes/reminderRoutes`)
const inlineKeyboardRoutes = require(`./routes/inlineKeyboardRoutes`)
const adminRoutes = require(`./routes/admin`);



const app = express();


app.set(`view engine`, `pug`)
app.set(`views`, path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));

app.use(body_parser.urlencoded({ extended: true }))


const imageFolderPath = path.join(__dirname, 'images');

if (!fs.existsSync(imageFolderPath)) {
    fs.mkdirSync(imageFolderPath);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imageFolderPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
app.use(multer({ storage: storage }).single(`image`))


const sessionStore = new SequelizeStore({
    db: sequelize,
});
app.use(session({
    secret: 'your_secret_key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
}));

app.use(userRoutes);
app.use(reminderRoutes);
app.use(inlineKeyboardRoutes);
app.use(`/admin`,adminRoutes);


sequelize.authenticate().then(()=>{
    app.listen(3000, ()=>{
        console.log(`Server Running!`)
    })
})
