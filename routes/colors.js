//enrutador relacionadas con los colores

const express = require("express");
const {Color} = require("../models/color");
const auth = require(__dirname + "/../auth/auth");
let router = express.Router();

function calcularDistancia(color1, color2) {
    const rDiff = color1[0] - color2.red;
    const gDiff = color1[1] - color2.green;
    const bDiff = color1[2] - color2.blue;

    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}


function calcularNivelSemejanza(colorBase, colores) {
    // Calcula la distancia euclidiana entre el color base y cada uno de los colores de la lista
    colores.forEach(color => {
        const distancia = calcularDistancia(colorBase, color);
        // Normaliza la distancia para obtener un valor entre 0 y 100
        // Utilizamos 441.672 como la máxima distancia posible entre dos colores RGB (255 * sqrt(3))
        color.simil = Math.max(0, 100 - (distancia / 441.672) * 100);
    });

    // Ordena los colores por nivel de semejanza (de mayor a menor)
    colores.sort((a, b) => b.simil - a.simil);

    return colores;
}

router.get("/random", async (req, res) => {
    res.status(200).send("ok");
})

router.get("/", async (req, res) => {
    try {
        const datosRgb = req.query.colorData.split(',').map(Number);
        // const datosRgb = req.body; // Accede a los datos RGB enviados en el cuerpo de la solicitud
        const colores = await Color.find();
        if (!colores || colores.length === 0)
            res.status(500).send({ error: "No hay colores en la aplicación" });
        else {
            const coloresOrdenados = calcularNivelSemejanza(datosRgb, colores);
            res.status(200).send({ colors: coloresOrdenados });
        } 
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error al obtener los colores" });
    }
});

router.get("/all", async (req, res) => {
    try {
        const colores = await Color.find();
        if (!colores || colores.length === 0) {
            res.status(404).send({ error: "No hay colores en la aplicación" });
        } else {
            res.status(200).send({ colors: colores });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error al obtener los colores" });
    }
});

router.post('/', auth.protegerRuta, auth.obtenerUsuarioYComprobarAdmin, (req, res) =>{
    const nuevoColor = new Color({
        name: req.body.name,
        gama: req.body.gama,
        company: req.body.company,
        red: req.body.red,
        green: req.body.green,
        blue: req.body.blue,
        code: req.body.code,
        feature: req.body.feature
    });
    nuevoColor.save().then(resultado => {
        res.status(200).send({ mensaje: "Color creado correctamente", color: resultado });
    }).catch(error => {
        res.status(400).send({ error: "Error al crear el color" });
    })
});


router.put('/edit/:id', auth.protegerRuta, auth.obtenerUsuarioYComprobarAdmin, async (req, res) => {
    try {
        const resultado = await Color.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            gama: req.body.gama,
            company: req.body.company,
            red: req.body.red,
            green: req.body.green,
            blue: req.body.blue,
            code: req.body.code,
            feature: req.body.feature
        }, {new: true, runValidators: true});

        if(!resultado) {
            return res.status(400).send({ error: 'Error actualizando los datos del color'});
        }
        res.status(200).send({resultad: resultado});
    } catch(error) {
        res.status(400).send({ error: 'Error actualizando los datos del color'});
    }
});

router.delete('/:id', auth.protegerRuta, auth.obtenerUsuarioYComprobarAdmin, async (req, res) => {
    try {
        const resultado = await Color.findByIdAndDelete(req.params.id);
        if(!resultado) {
            return res.status(400).send({ error: 'Error eliminando el color'});
        }
        res.status(200).send({resultad: resultado});
    } catch(error) {
        res.status(400).send({ error: 'Error eliminando el color'});
    }
});

module.exports = router;