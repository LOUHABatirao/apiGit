const Joi = require('@hapi/joi');

const createValidation = data => {
    schema = Joi.object({
        users_email: Joi.string().min(6).required().email(),
        users_password: Joi.string().min(8).required(),
        id_role: Joi.required()
    })
    return schema.validate(data, {
            allowUnknown: true
    });
}

const updateValidation = data => {
    schema = Joi.object({
        users_email: Joi.string().min(6).required().email()
    })
    return schema.validate(data, {
            allowUnknown: true
    });
}

module.exports = { createValidation, updateValidation }