const Joi = require('joi');
const joiObjectId = require('joi-objectid')(Joi);

const userValidation = Joi.object({
    username: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
            "string.empty": "Username is required",
            "string.min": "3 characters minimum for username",
            "string.max": "30 characters maximum for username",
            "any.required": "Username is required",
        }),

    password: Joi.string()
        .min(6)
        .required()
        .messages({
            "string.empty": "Password is required",
            "string.min": "6 characters minimum for password",
            "any.required": "Password is required",
        }),

    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.email": "Email format invalid",
            "any.required": "Email is required",
            "string.empty": "Email is required",
        }),

    gender: Joi.string()
        .valid("Male", "Female", "Other")
        .required()
        .messages({
            "any.only": "Gender must be one of these : Male, Female, Other",
            "any.required": "Gender is required",
            "string.empty": "Gender is required",
        }),

    region: Joi.string()
        .required()
        .messages({
            "string.empty": "Region is required",
            "any.required": "Region is required",
        }),

    role: Joi.string()
        .valid("Admin", "Player")
        .required()
        .messages({
            "any.only": "Role must be either Admin or Player",
            "any.required": "Role is required",
            "string.empty": "Role is required",
        }),

    diamond: Joi.number()
        .min(0)
        .default(0)
        .messages({
            "number.base": "Diamond must be a number",
            "number.min": "Diamond cannot be negative",
        }),

    starlight: Joi.boolean()
        .default(false)
        .messages({
            "boolean.base": "Starlight must be a boolean",
        }),

    battle_point: Joi.number()
        .min(0)
        .messages({
            "number.base": "Battle point must be a number",
            "number.min": "Battle point must be at least 0",
        }),

    owned_heroes: Joi.array()
        .items(joiObjectId())
        .messages({
            "array.base": "Owned heroes must be an array",
            "string.pattern.name": "Invalid hero ID format",
        }),

    owned_skins: Joi.array()
        .items(joiObjectId())
        .messages({
            "array.base": "Owned skins must be an array",
            "string.pattern.name": "Invalid skin ID format",
        }),
});

module.exports = userValidation;