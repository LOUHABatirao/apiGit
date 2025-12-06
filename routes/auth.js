const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();
const { loginValidation, verifyResetPasswordValidation, resetPasswordValidation, forgotPasswordValidation } = require('../validation/auth')
const users_table = `${process.env.DB_PREFIX}_users`;
const roles_table = `${process.env.DB_PREFIX}_roles`;
const roles_users_table = `${process.env.DB_PREFIX}_roles_users`;
const bcrypt = require('bcrypt');
var MailConfig = require('../config/email');
var hbs = require('nodemailer-express-handlebars');
var smtpTransport = MailConfig.SMTPTransport;
const { encrypt, decrypt } = require('./crypto');
// login 
router.post('/login', async (req, res) => {

    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    knex
        .select("*").from(users_table)
        .where({ users_email: req.body.users_email })
        .then(user => {
            if (!user.length) {
                res.status(400).json({ message: 'password or email invalid !' });
            }
            bcrypt.compare(req.body.users_password, user[0].users_password, function (err, validPassword) {
                if (err) {
                    return res.status(400).json({ message: "general error detected please try later :(" });
                }
                if (!validPassword) {
                    return res.status(400).json({ message: 'password or email invalid !' });
                }
                const expiresIn = req.body.remember_me ? {} : { expiresIn: process.env.SESSION_EXPIRES_IN };
                const token = jwt.sign({ user_id: user[0].id }, process.env.TOKEN_SECRET, expiresIn);
                res.header('auth-token', token).send({
                    token: token,
                    remember_me: req.body.remember_me
                });
            })


        }).catch(err => {
            return res.status(400).send(err);
        });
});


router.post('/verify-token', async (req, res) => {
    try {
        const verified = jwt.verify(req.body.token, process.env.TOKEN_SECRET);
        if (verified) {
            knex.select(users_table + '.id', "users_name", "users_email", "users_image", "users_last_connection", "roles_name")
                .from(users_table)
                .innerJoin(roles_users_table, users_table + '.id', roles_users_table + '.id_user')
                .innerJoin(roles_table, roles_table + '.id', roles_users_table + '.id_role')
                .where(users_table + '.id', '=', verified.user_id)
                .then(user => {
                    if (user.length) {
                        res.status(200).send({
                            isValide: true,
                            authUser: user[0],
                            token: verified,
                            error: null
                        });
                    } else {
                        res.status(400).send({
                            isValide: false,
                            token: null,
                            error: error
                        });
                    }
                }).catch(err => { throw new Error(err.message) })
        } else {
            res.status(400).send({
                isValide: false,
                token: null,
                error: error
            });
        }
    } catch (error) {
        res.status(400).send({
            isValide: false,
            token: null,
            error: error
        });
    }
});


router.post('/forgot-password', async (req, res) => {
    const { error } = forgotPasswordValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    knex
        .select("*").from(users_table)
        .where({ users_email: req.body.users_email })
        .then(user => {
            if (!user.length) {
                res.status(400).json({ message: 'Email invalid !' });
            }
            const user_mail = user[0].users_email;
            let hash = encrypt(user_mail);
            // send mail 
            MailConfig.ViewForgotPasswordOption(smtpTransport, hbs);
            let HelperOptions = {
                from: `${process.env.APP_NAME} <ultime-manager@ultime-web.com>`,
                to: user_mail,
                subject: `Réponse à votre demande de réinitialisation de votre mot de passe dans * ${process.env.APP_NAME} *`,
                template: 'forgotPassword',
                context: {
                    resetLink: req.protocol + '://' + req.header('client-host') + '/verify-forgot-password-link/' + hash.iv + '/' + hash.content,
                }
            };

            smtpTransport.verify((error, success) => {
                if (error) {
                    return res.status(400).json({ output: 'error', message: error })
                } else {
                    smtpTransport.sendMail(HelperOptions, (error, info) => {
                        if (error) {
                            return res.status(400).json({ output: 'error', message: error })
                        }
                        return res.status(200).json({ output: 'success', message: hash });
                    });
                }
            })


        }).catch(err => {
            res.status(400).send(err);
        });
});


router.post('/verify-reset-password-link', async (req, res) => {
    const { error } = verifyResetPasswordValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let decryptResp = decrypt(req.body);
    const { output, content } = decryptResp;
    if (output == "success") {
        knex
            .select("users_name", "users_email").from(users_table)
            .where({ users_email: content })
            .then(user => {
                if (!user.length) {
                    return res.status(400).json({ alowUserToReset: false });
                }
                return res.status(200).json({ alowUserToReset: true, user: user[0] });

            }).catch(err => {
                return res.status(400).send(err);
            });
    } else {
        return res.status(400).json({ alowUserToReset: false });
    }

});


router.post('/reset-password', async (req, res) => {
    const { error } = resetPasswordValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const { users_password, confirm_users_password, email } = req.body;


    try {
        bcrypt.genSalt(parseInt(process.env.SLATE_HASH), function (err, salt) {
            if (err) {
                return res.status(400).json({ message: "general error detected please try later :(" });
            }
            bcrypt.hash(users_password, salt, async function (err, hash) {
                if (err) {
                    return res.status(400).json({ message: "general error detected please try later :(" });
                }
                knex(users_table)
                    .where({ users_email: email })
                    .update({
                        "users_password": hash,
                        "updated_at": knex.fn.now()
                    })
                    .then(user => {
                        res.status(200).json({
                            output: "success",
                            data: user,
                            message: "Le mot de passe a été modifé avec succès"
                        });
                    });

            });
        });

    } catch (err) {
        res.status(500).json({ message: err });
    }


});

module.exports = router;