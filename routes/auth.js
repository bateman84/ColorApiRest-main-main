//enrutador relacionadas con el user y el token

const express = require("express");
const bcrypt = require("bcrypt");
const auth = require(__dirname + "/../auth/auth");
const User = require("../models/user");
const { Palette } = require("../models/color");

let router = express.Router();

router.post('/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({email: email}).then(
        resultado => {
            if(resultado && bcrypt.compareSync(password, resultado.password)) {
                const token = auth.generarToken(email);
                res.status(200).send({ accessToken: token });
            }else
                res.status(401).send({ error: "Credenciales incorrectas" });
        },
        error => {
            res.status(500).send({ error: "Error en el servidor" });
        }
    )
});

router.post("/register", (req, res) => {
    const hashPassword = bcrypt.hashSync(req.body.password, 10);
    
    const nuevoUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
        avatar: req.body.avatar,
    });

    nuevoUser.save()
        .then(resultado => {
            res.status(200).send({ mensaje: "Registro exitoso", usuario: resultado });
        })
        .catch(error => {
            // Verifica si el error es debido a la violación de unicidad del campo email 
            // tipo 11000, que es el código de error específico de MongoDB para violaciones de unicidad (clave duplicada)
            if (error && error.code === 11000 && error.keyPattern && error.keyPattern.email) {
                res.status(400).send({ error: "El correo electrónico ya está en uso." });
            } else {
                // Otro tipo de error
                res.status(400).send({ error: "Error de registro" });
            }
        });
});

router.get('/validate', auth.protegerRuta, (req, res) => {
    //Esta ruta solo se puede acceder si el token es válido
    let token = req.headers.authorization;
    if (token && token.startsWith("Bearer "))
        token = token.slice(7);
    if (auth.validarToken(token)) {
        res.status(200).send({ message: "Ruta protegida accesible correctamente" });
    } else {
        res.status(401).send({ error: "No autorizado" });
    }

    res.status(200).send({ message: "Ruta protegida accesible correctamente" });

    
    
});

router.get('/modo', auth.protegerRuta, async (req, res) => {
    try {
        const token = req.headers.authorization.slice(7);
        
        const modoUsuario = await auth.obtenerModoUsuario(token);

        res.status(200).send({ modo: modoUsuario });
    } catch (error) {
        console.error("Error al obtener el modo de usuario:", error);
        res.status(500).send({ error: "Error al obtener el modo de usuario" });
    }
});

router.get('/allusers', auth.protegerRuta, auth.obtenerUsuarioYComprobarAdmin, async (req, res) => {
    try{
        const users = await User.find();
        if (!users || users.length === 0) {
            res.status(404).send({ error: "No hay usuarios en la aplicación" });
        } else {
            res.status(200).send({ users: users });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error al obtener los usuarios" });
    }
});

router.delete('/delete/:id', auth.protegerRuta, auth.obtenerUsuarioYComprobarAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        await Palette.deleteMany({ idUser: userId });
        
        const resultado = await User.findByIdAndDelete(userId);
        if (!resultado) {
            return res.status(400).send({ error: 'Error eliminando el usuario' });
        }
        res.status(200).send({ resultad: resultado });
    } catch (error) {
        res.status(400).send({ error: 'Error eliminando el usuario' });
    }
});

router.put('/mode/:id', auth.protegerRuta, auth.obtenerUsuarioYComprobarAdmin, async (req, res) => {
    try{
        const userId = req.params.id;
        const modo = req.body.modo;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }
        user.modo = modo;
        await user.save();
        console.log(user.modo);
        res.status(200).send({ user: user});
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error al actualizar el modo de usuario' });
    }
});


module.exports = router;