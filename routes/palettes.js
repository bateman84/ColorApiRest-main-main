const expiress = require("express");
const auth = require(__dirname + "/../auth/auth");
const { Palette, Color } = require("../models/color");
let router = expiress.Router();



router.get("/detail/:paletteId", auth.protegerRuta, (req, res) => {
    const paletteId = req.params.paletteId;

    // Buscar la paleta por su ID
    Palette.findById(paletteId)
        .then(palette => {
            if (!palette) {
                return res.status(404).json({ error: "La paleta no fue encontrada" });
            }
            res.status(200).json({ palette: palette });
        })
        .catch(error => {
            res.status(400).json({ error: 'Error obteniendo la paleta' });
        });
});


// Obtener todas las paletas asociadas a un idUser
router.get("/:idUser", auth.protegerRuta, (req, res) => {
  const idUser = req.params.idUser;

  // Filtrar las paletas por idUser
  Palette.find({ idUser: idUser })
      .then(palettes => {
          res.status(200).json({ palettes: palettes });
      })
      .catch(error => {
          res.status(400).json({ error: 'Error obteniendo las paletas' });
      });
});

router.post("/", auth.protegerRuta, (req, res) => {
    let colors = req.body.colors;

    const paletteData = {
        name: req.body.name,
        idUser: req.body.idUser,
        colors: Array.isArray(colors) ? colors : (colors ? [colors] : []) // Incluye el color si está presente, de lo contrario, establece un array vacío
    };

    // Crear una nueva instancia de Palette con los datos proporcionados en la solicitud
    const palette = new Palette(paletteData);

    // Guardar la paleta en la base de datos
    palette.save()
    .then(paletteSaved => {
      res.status(201).json({ palette: paletteSaved });
    })
    .catch(error => {
      res.status(400).json({ error: 'Error creando la paleta' });
    });
});

router.put("/:paletteId/colors", auth.protegerRuta, async (req, res) => {
    try {
      const paletteId = req.params.paletteId;
      const colorData = new Color(req.body.color);
  
      // Buscar la paleta por su ID
      const palette = await Palette.findById(paletteId);
      if (!palette) {
        return res.status(404).json({ error: "La paleta no fue encontrada" });
      }
  
      // Comprobar si el color ya está en la paleta
      const colorExists = palette.colors.some(
        existingColor => existingColor._id.toString() === colorData._id.toString()
      );
  
      if (colorExists) {
        return res.status(400).json({ error: "El color ya está en la paleta" });
      }
  
      // Crear un nuevo color con los datos proporcionados
      const newColor = new Color(colorData);
  
      // Agregar el nuevo color a la paleta
      palette.colors.push(newColor);
  
      // Guardar la paleta actualizada
      const updatedPalette = await palette.save();
  
      res.status(201).json({ palette: updatedPalette });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(400).json({ error: error.message });
    }
  });

  router.put("/edit/:paletteId", auth.protegerRuta, async (req, res) => {
    try {
      const paletteId = req.params.paletteId;
      const newName = req.body.name;
  
      // Verificar si se proporcionó un nuevo nombre
      if (!newName) {
        return res.status(400).json({ error: "Debe proporcionar un nuevo nombre para la paleta" });
      }
  
      // Buscar la paleta por su ID y actualizar el nombre
      const updatedPalette = await Palette.findByIdAndUpdate(paletteId, { name: newName }, { new: true });
  
      if (!updatedPalette) {
        return res.status(404).json({ error: "La paleta no fue encontrada" });
      }
  
      res.status(200).json({ palette: updatedPalette });
    } catch (error) {
      console.error("Error:", error.message);
      res.status(400).json({ error: error.message });
    }
  });

router.delete("/:paletteId", auth.protegerRuta, (req, res) => {
    const paletteId = req.params.paletteId;

    // Buscar y eliminar la paleta por su ID
    Palette.findByIdAndDelete(paletteId)
        .then(deletedPalette => {
            if (!deletedPalette) {
                return res.status(404).json({ error: "La paleta no fue encontrada" });
            }
            res.status(200).json({ message: "Paleta eliminada exitosamente" });
        })
        .catch(error => {
            res.status(400).json({ error: 'Error al eliminar la paleta' });
        });
});

router.delete("/:paletteId/colors/:colorId", auth.protegerRuta, (req, res) => {
    const { paletteId, colorId } = req.params;

    // Buscar la paleta por su ID
    Palette.findById(paletteId)
        .then(palette => {
            if (!palette) {
                return res.status(404).json({ error: "La paleta no fue encontrada" });
            }

            // Encontrar y eliminar el color de la paleta
            const colorIndex = palette.colors.findIndex(color => color._id.toString() === colorId);
            if (colorIndex === -1) {
                return res.status(404).json({ error: "El color no fue encontrado en la paleta" });
            }

            palette.colors.splice(colorIndex, 1);

            // Guardar la paleta actualizada
            return palette.save();
        })
        .then(updatedPalette => {
            res.status(200).json({ message: "Color eliminado exitosamente", palette: updatedPalette });
        })
        .catch(error => {
            res.status(400).json({ error: "Error al eliminar el color de la paleta" });
        });
});

module.exports = router;