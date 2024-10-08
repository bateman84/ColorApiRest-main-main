//Funciones para generación de token en api rest

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/user");
dotenv.config();

const secreto = process.env.SECRET_KEY;

let generarToken = login => {
    return jwt.sign({ login }, secreto,
        { expiresIn: "365d" });
};

let validarToken = token => {
    try {
        let resultado = jwt.verify(token, secreto);
        return resultado;
    } catch (error) {
        return false;
    }
};

let protegerRuta = (req, res, next) => {
    let token = req.headers.authorization;
    if (token && token.startsWith("Bearer ")) {
        token = token.slice(7);
        const decodedToken = validarToken(token);
        if (decodedToken) {
            req.user = decodedToken.login;
            next();
        } else {
            res.status(401).json({ error: "Token inválido" });
        }
    } else {
        res.status(401).json({ error: "Token no proporcionado" });
    }
};

let obtenerModoUsuario = async token => {
    try {
        const decodedToken = jwt.verify(token, secreto);
        const userEmail = decodedToken.login;

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            throw new Error("Usuario no encontrado");
        }
        return user.modo;
    } catch (error) {
        console.error("Error al decodificar token:", error);
        throw new Error("Error al decodificar el token");
    }
};

let obtenerUsuarioYComprobarAdmin = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (token && token.startsWith("Bearer ")) {
            token = token.slice(7);
            const modoUsuario = await obtenerModoUsuario(token);
            if (modoUsuario === "administrador") {
                next();
            } else {
                res.status(403).json({ error: "Acceso denegado. Se requieren privilegios de administrador" });
            }
        } else {
            res.status(401).json({ error: "Token no proporcionado" });
        }
    } catch (error) {
        console.error("Error:", error.message);
        res.status(401).json({ error: error.message });
    }
};



module.exports = {
    generarToken,
    validarToken,
    protegerRuta,
    obtenerModoUsuario,
    obtenerUsuarioYComprobarAdmin
};