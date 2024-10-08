const express = require("express");
const auth =  require(__dirname + "/../auth/auth");
const User = require("../models/user");
const bcrypt = require("bcrypt");

let router = express.Router();

router.get("/me", auth.protegerRuta, (req, res) => {
    const userEmail = req.user;
    // Busca al usuario en la base de datos usando el email
    User.findOne({ email: userEmail }).then(user => {
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        } else {
        // Si se encuentra el usuario, devuélvelo como respuesta
        res.status(200).json({ user });
        }
    }).catch(error => {
        // Si ocurre algún error durante la búsqueda en la base de datos
        res.status(500).json({ error: "Error interno del servidor" });
    });
});

router.put("/me/avatar", auth.protegerRuta, (req, res) => {
    const userEmail = req.user;
    const newAvatar = req.body.avatar;

    if(!newAvatar) {
        return res.status(400).json({ error: "Debe proporcionar un nuevo avatar" });
    }

    User.findOneAndUpdate({ email: userEmail }, { avatar: newAvatar }, { new: true })
    .then(user => {
        if(!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        } else {
            res.status(200).json({ user });
        }
    }).catch(error => {
        res.status(500).json({ error: "Error interno del servidor" });
    });
});


router.put("/me/info", auth.protegerRuta, (req, res) => {
    const userEmail = req.user;
    const newName = req.body.name;
    const newEmail = req.body.email;

    if((newName === undefined || newName === "") && (newEmail === undefined || newEmail === "")) {
        return res.status(400).json({ error: "Debe proporcionar un nuevo nombre o correo electrónico" });
    }

    let newDates = {};

    if(newName && newName.trim() !== "") {
        newDates.name = newName;
    }
    if(newEmail && newEmail.trim() !== "") {
        newDates.email = newEmail;
    }

    User.findOneAndUpdate({ email: userEmail }, newDates, { new: true })
    .then( response => {
        if(!response) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        } else {
            let token;
            if(newEmail) {
                token = auth.generarToken(newEmail);
            }
            console.log("token???")
            res.status(200).json({ accessToken: token });
        }
    }).catch(error => {
        res.status(500).json({ error: "Error interno del servidor" });
    });
});

router.put("/me/password", auth.protegerRuta, (req, res) => {
    const userEmail = req.user;
    const hashPassword = bcrypt.hashSync(req.body.password, 10);

    if(!hashPassword) {
        return res.status(400).json({ error: "Debe proporcionar una nueva contraseña" });
    }

    User.findOneAndUpdate({ email: userEmail }, { password: hashPassword }, { new: true })
    .then(user => {
        if(!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        } else {
            res.status(200).json({ user });
        }
    }).catch(error => {
        res.status(500).json({ error: "Error interno del servidor" });
    });
});

module.exports = router;