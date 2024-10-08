//Esquema y modelo del user

const mongoose = require("mongoose");
const validator = require("validator");

let userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: (value) => validator.isEmail(value),
            message: "Email no válido."
        }
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        type: String,
        trim: true
    },
    modo: {
        type: String,
        enum: ["administrador", "user"],
        default: "user"
    }
});

let User = mongoose.model("users", userSchema);
module.exports = User;