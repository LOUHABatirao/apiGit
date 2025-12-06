const Joi = require('@hapi/joi');

const createValidation = data => {
    schema = Joi.object({
        langs_title: Joi.string().required(),
        langs_code: Joi.string().min(2).required(),
        langs_default: Joi.required(),
        langs_direction: Joi.string().required(),
    })
    return schema.validate(data, {
        allowUnknown: true
    });
}

module.exports = { createValidation }