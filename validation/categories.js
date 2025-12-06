const Joi = require('@hapi/joi');

const createValidation = data => {
    schema = Joi.object({
        categories_title: Joi.string().min(3).required(),
        categories_slug: Joi.string().required(),
        id_lang: Joi.required()
    })
    return schema.validate(data, {
        allowUnknown: true
    });
}

module.exports = { createValidation }