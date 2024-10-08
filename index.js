//Importación de módulos
const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const cors = require('cors');
const bodyParser = require('body-parser');

//Rutas
const colors = require(__dirname + "/routes/colors");
const palettes = require(__dirname + "/routes/palettes");
const auth = require(__dirname + "/routes/auth");
const user = require(__dirname + "/routes/users");

//Configuración de variables de entorno
dotenv.config();

//Conexión a la base de datos MongoDB
mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        console.log("Conectado a la base de datos");
    })
    .catch((error) => {
        console.log("Error al conectar a la base de datos:", error);
    });

//Configuración de la aplicación Express
let app = express();
// app.use(express.json());

// Configuración del body parser para manejar cuerpos de solicitud JSON grandes
app.use(express.json({ limit: '50mb' }));

// Configuración del body parser para manejar cuerpos de solicitud codificados URL grandes
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Habilitar CORS para todas las solicitudes
app.use(cors());

//Asignación de rutas a la aplicación
app.use("/colors", colors);
app.use("/palettes", palettes);

// Configuración de la solicitud pre-flight para la ruta '/auth'
app.options('/auth', cors());
app.use("/auth", auth);
app.use("/users", user);

//Inicio del servidor
app.listen(process.env.PORT);