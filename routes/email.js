const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
const Knex = require('knex');
dotenv.config();
var MailConfig = require('../config/email');
var hbs = require('nodemailer-express-handlebars');
var smtpTransport  = MailConfig.SMTPTransport ;
const verifyApiToken = require('../verify/verifyApiToken');

const leads_table = `${process.env.DB_PREFIX}_leads`;


router.post('/', async (req, res) => {

    // const { error } = forgotPasswordValidation(req.body);
   // if (error) return res.status(400).send(error.details[0].message);

   
   // send mail 
   try {

    knex(leads_table)
    .insert({
        "name": req.body.name,
        "tel": req.body.phone,
        "email": req.body.email,
        "company": req.body.company,
        "info": req.body.info,
        "subject": req.body.subject,
        "source": req.body.source,
        "placement": req.body.placement,
    })

    .then(rows => {
        res.status(200).json(rows);
    });

    /*
    MailConfig.ViewForgotPasswordOption(smtpTransport, hbs);
    let HelperOptions = {
        from: "contact@evonativ.com",
        // to: "contact@evonativ.com",
        to: "mehdi.bwsdigital@gmail.com",
        subject: "New Message Evonativ webSite",
        template: 'contactTemplate',
        context: {
            ...req.body
        }

    };

    return await smtpTransport.verify(async (error, success) => {
        if (error) {
             res.status(400).json({ output: 'error', message: error })
        } else {
            return await smtpTransport.sendMail(HelperOptions, (error, info) => {
                if (error) {
                    res.status(400).json({ output: 'error', message: error })
                }
                res.status(200).json({ output: 'success', message: info});
            });
        }

    })
    */

   } catch (error) {
    res.status(400).send(err);  
   }

});



module.exports = router;