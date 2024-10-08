//Esquema y modelo de colors y palette

const mongoose = require("mongoose");

let colorSchema = new mongoose.Schema({
    //marca del fabricante de la pintura
    company: {
        type: String,
        required: true
    },
    //colección o gama del color
    gama: {
        type: String,
        required: true
    },
    //name del color
    name: {
        type: String,
        required: true
    },
    //valores RGB
    red: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    green: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    blue: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    //código de pintura
    code: {
        type: String,
        required: false,
    },
    //tipo de pintura
    feature: {
        type: String,
        required: true,
        enum: ["Base", "Contrast", "Layer", "Shade", "Metal", "Acrílica"]
    },
    simil: {
        type: Number,
        required: false,
    }
});

let paletteSchema = new mongoose.Schema({

    //autor de la palette
    idUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    //name de la palette
    name: {
        type: String,
        required: true
    },
    //attay de colors de la palette
    colors: [colorSchema]
});

let Color = mongoose.model('colors', colorSchema);
let Palette = mongoose.model('palettes', paletteSchema);

module.exports = {
    Color: Color,
    Palette: Palette
};


