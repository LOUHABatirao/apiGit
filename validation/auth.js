const Joi = require('@hapi/joi');

const loginValidation = data =>{
    schema = Joi.object({
        users_email: Joi.string().min(6).required().email(),
        users_password: Joi.string().min(6).required()
    })
    return schema.validate(data, {
        allowUnknown: true
    });
}

const forgotPasswordValidation = data =>{
    schema = Joi.object({
        users_email: Joi.string().min(6).required().email()
    })
    return schema.validate(data, {
        allowUnknown: true
    });
}

const verifyResetPasswordValidation = data =>{
    schema = Joi.object({
        iv: Joi.string().required(),
        content: Joi.string().required()
    })
    return schema.validate(data, {
        allowUnknown: true
    });
}

const resetPasswordValidation = data =>{
    schema = Joi.object({
        email: Joi.string().min(6).required().email(),
        users_password: Joi.string().required(),
        confirm_users_password: Joi.any()
        .valid(Joi.ref('users_password'))
        .required()
            .label('Confirmez le mot de passe')
            .options({ messages: { 'any.only': '{{#label}} Les deux mots de passe doivent être identiques' } })
    })
    return schema.validate(data, {
        allowUnknown: true
    });
}

module.exports = { loginValidation, forgotPasswordValidation, verifyResetPasswordValidation, resetPasswordValidation}