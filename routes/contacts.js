const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
const Knex = require('knex');
var postmark = require("postmark");
dotenv.config();
const verifyAuthToken = require('../verify/verifyToken');
const verifyApiToken = require('../verify/verifyApiToken');
const contacts_table = `${process.env.DB_PREFIX}_contacts`;

// Your Postmark API key
const postmarkApiKey = 'b34d12dd-a354-437d-be9c-195c2f333624';


//Get all contacts
router.get('/', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {
        knex.from(contacts_table)
            .whereNull('deleted_at')
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all contacts by ID
router.get('/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {
        knex.from(contacts_table)
            .where({ id: req.params.id })
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Add contacts
router.post('/', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {
        knex(contacts_table)
            .insert({
                "name": req.body.name,
                "tel": req.body.tel,
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

    } catch (err) {
        res.status(500).json({ message: err });
    }

});

//Update contacts by ID
router.patch('/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {
        knex(contacts_table)
            .where({ id: req.params.id })
            .update({
                "name": req.body.name,
                "tel": req.body.tel,
                "email": req.body.email,
                "company": req.body.company,
                "info": req.body.info,
                "subject": req.body.subject,
                "source": req.body.source,
                "placement": req.body.placement,
                "updated_at": knex.fn.now()
            })
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Delete contacts by ID
router.delete('/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {
        knex(contacts_table)
            .where({ id: req.params.id })
            .del()
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//send email
router.post('/send', verifyApiToken, async (req, res) => {

    const {
        first_name,
        last_name,
        email,
        phone,
        message
    } = req.body;

    var client = new postmark.ServerClient(postmarkApiKey);

    client.sendEmailWithTemplate({
        "From": "contact@villanium.com",
        "To": "contact@villanium.com",
        "ReplyTo": email,
        "TemplateAlias": "contact",
        "TemplateModel": {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "phone": phone,
            "message": message
        }
    }).then(response => {
        console.log("Email sent: ", response.To);
        res.status(200).json(response);
    }
    ).catch(error => {
        console.error("Unable to send via postmark: " + error.message);
        res.status(500).json({ message: error });
    });

});

//callback
router.post('/callback', verifyApiToken, async (req, res) => {

    const { phone } = req.body;

    var client = new postmark.ServerClient(postmarkApiKey);

    client.sendEmailWithTemplate({
        "From": "contact@villanium.com",
        "To": "contact@villanium.com",
        "TemplateAlias": "callback",
        "TemplateModel": {
            "phone": phone,
        }
    }).then(response => {
        console.log("Email sent: ", response.To);
        res.status(200).json(response);
    }
    ).catch(error => {
        console.error("Unable to send via postmark: " + error.message);
        res.status(500).json({ message: error });
    });

});

//send email
router.post('/request', verifyApiToken, async (req, res) => {

    const {
        arrivalDate,
        departureDate,
        firstName,
        lastName,
        email,
        phone,
        numberOfNights,
        price,
        total,
        propertyHours,
        propertyPaiement,
        propertyInterieur,
        propertyAnnulation,
        propertyImage,
        propertyName,
        lang,
        guestAdults,
        guestChildren,
        guestBabies
    } = req.body;

    let emailError = false;

    var client = new postmark.ServerClient(postmarkApiKey);

    // Send an email to host:
    let hostEmailTemplate = 'host_new_reservation_contact_request_en';
    let guestEmailTemplate = 'guest_reservation_contact_request_en';

    if (lang === 'fr') {
        hostEmailTemplate = 'host_new_reservation_contact_request';
        guestEmailTemplate = 'guest_reservation_contact_request';
    }

    let emailData = {
        "date_arriver": arrivalDate,
        "date_depart": departureDate,
        "first_name": firstName,
        "last_name": lastName,
        "email": email,
        "phone": phone,
        "number_of_night": numberOfNights,
        "price": price,
        "total": total,
        "conditions_horaire": propertyHours,
        "conditions_paiement": propertyPaiement,
        "conditions_reglement": propertyInterieur,
        "conditions_annulation": propertyAnnulation,
        "property_image": propertyImage,
        "property_name": propertyName,
        "guest_adults": guestAdults,
        "guest_children": guestChildren,
        "guest_babies": guestBabies,
    }

    // send email to admin
    client.sendEmailWithTemplate({
        "From": "reservation@villanium.com",
        "To": "reservation@gmail.com",
        "ReplyTo": email,
        "TemplateAlias": hostEmailTemplate,
        "TemplateModel": emailData
    }).then(response => {
        // console.log("Email sent: ", response.To);
    }
    ).catch(error => {
        // console.error("Unable to send via postmark: " + error.message);
        emailError = true;
    });

    // send email to guest
    client.sendEmailWithTemplate({
        "From": "reservation@villanium.com",
        "To": email,
        "ReplyTo": email,
        "TemplateAlias": guestEmailTemplate,
        "TemplateModel": emailData
    }).then(response => {
        // console.log("Email sent: ", response.To);
    }
    ).catch(error => {
        // console.error("Unable to send via postmark: " + error.message);
        emailError = true;
    });


    if (!emailError) {
        res.status(200).json({ message: 'Email sent' });
    } else {
        res.status(500).json({ message: 'Email not sent' });
    }

});

module.exports = router;