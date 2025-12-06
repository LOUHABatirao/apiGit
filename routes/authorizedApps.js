const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const verifyAuthToken = require('../verify/verifyToken');
const verifyApiToken = require('../verify/verifyApiToken');
const { createValidation } = require('../validation/authorizedApps')
dotenv.config();


const table_authorized_apps = `${process.env.DB_PREFIX}_authorized_apps`;

//Get all apps
router.get('/', verifyAuthToken, verifyApiToken, async (req, res) => {

    try {

        knex.from(table_authorized_apps)
            .whereNull('deleted_at')
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get trashed  apps
router.get('/trashed', verifyAuthToken, verifyApiToken, async (req, res) => {

    try {

        knex.from(table_authorized_apps)
            .whereNotNull('deleted_at')
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all apps by ID
router.get('/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {

        knex.from(table_authorized_apps)
            .where({ id: req.params.id })
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});


//Add app
router.post('/', verifyAuthToken, verifyApiToken, async (req, res) => {

    try {
        const { error } = createValidation(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
        const { name, host, is_allowed } = req.body;
        const token = jwt.sign({ host: host }, process.env.TOKEN_SECRET, {});

        knex(table_authorized_apps)
            .insert({
                "name": name,
                "host": host,
                "is_allowed": is_allowed,
                "token": token
            })
            .then(id => {
                res.status(200).json(id);
            }).catch((err => {
                res.status(400).json({ message: err });
            }));
    } catch (err) {
        res.status(500).json({ message: err });
    }

});

//Update apps by ID
router.patch('/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {
        const { error } = createValidation(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
        const { name, host, is_allowed } = req.body;
        const token = jwt.sign({ host: host }, process.env.TOKEN_SECRET, {});
        knex(table_authorized_apps)
            .where({ id: req.params.id })
            .update({
                "name": name,
                "host": host,
                "is_allowed": is_allowed,
                "token": token
            })
            .then(id => {
                res.status(200).json(id);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});


//Restor apps by ID
router.post('/restore/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {
        knex(table_authorized_apps)
            .where({ id: req.params.id })
            .update({
                "deleted_at": null,
            })
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Trash apps by ID
router.delete('/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {
        knex(table_authorized_apps)
            .where({ id: req.params.id })
            .update({
                "deleted_at": knex.fn.now(),
            })
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Delete apps by ID
router.delete('/destroy/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {
        knex(table_authorized_apps)
            .where({ id: req.params.id })
            .del()
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

module.exports = router;