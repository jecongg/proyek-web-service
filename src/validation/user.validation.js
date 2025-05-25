const Joi = require('joi');
const joiObjectId = require('joi-objectid')(Joi);

const userValidation = Joi.object({
    username: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
            "string.empty": "Username wajib diisi",
            "string.min": "Username minimal 3 karakter",
            "string.max": "Username maksimal 30 karakter",
            "any.required": "Username wajib diisi",
        }),

    password: Joi.string()
        .min(6)
        .required()
        .messages({
            "string.empty": "Password wajib diisi",
            "string.min": "Password minimal 6 karakter",
            "any.required": "Password wajib diisi",
        }),

    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.email": "Format email tidak valid",
            "any.required": "Email wajib diisi",
            "string.empty": "Email wajib diisi",
        }),

    gender: Joi.string()
        .valid("Male", "Female", "Other")
        .required()
        .messages({
            "any.only": "Gender harus salah satu dari: Male, Female, atau Other",
            "any.required": "Gender wajib diisi",
            "string.empty": "Gender wajib diisi",
        }),

    region: Joi.string()
        .required()
        .messages({
            "string.empty": "Region wajib diisi",
            "any.required": "Region wajib diisi",
        }),

    role: Joi.string()
        .valid("Admin", "Player")
        .required()
        .messages({
            "any.only": "Role harus Admin atau Player",
            "any.required": "Role wajib diisi",
            "string.empty": "Role wajib diisi",
        }),

    diamond: Joi.number()
        .min(0)
        .default(0)
        .messages({
            "number.base": "Diamond harus berupa angka",
            "number.min": "Diamond tidak boleh negatif",
        }),

    starlight: Joi.boolean()
        .default(false)
        .messages({
            "boolean.base": "Starlight harus berupa true atau false",
        }),

    battle_point: Joi.number()
        .min(0)
        .messages({
            "number.base": "Battle point harus berupa angka",
            "number.min": "Battle point tidak boleh negatif",
        }),

    owned_heroes: Joi.array()
        .items(joiObjectId())
        .messages({
            "array.base": "Owned heroes harus berupa array",
            "string.pattern.name": "ID hero tidak valid",
        }),

    owned_skins: Joi.array()
        .items(joiObjectId())
        .messages({
            "array.base": "Owned skins harus berupa array",
            "string.pattern.name": "ID skin tidak valid",
        }),
});

module.exports = userValidation;