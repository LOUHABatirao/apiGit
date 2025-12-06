const Joi = require('@hapi/joi');

const createValidation = data => {
    schema = Joi.object({
        name: Joi.string().required(),
        host: Joi.string().required(),
        is_allowed: Joi.required(),
    })
    return schema.validate(data, {
        allowUnknown: true
    });
}

module.exports = { createValidation }