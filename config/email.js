const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

const SMTPTransport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, 
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
});

const ViewForgotPasswordOption = (transport, hbs) => {
    transport.use('compile', hbs({
        viewEngine: {
            extName: '.handlebars',
            partialsDir: path.resolve('./views/partials'),
            layoutsDir: path.resolve('./views/layouts'),
            defaultLayout: '',
        },
        viewPath: path.resolve('./views'),
        extName: '.handlebars',
    }));
}

module.exports = {
    SMTPTransport,
    ViewForgotPasswordOption
};
