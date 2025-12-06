const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
const Knex = require('knex');
dotenv.config();

const nodemailer = require('nodemailer');

const verifyAuthToken = require('../verify/verifyToken');
const verifyApiToken = require('../verify/verifyApiToken');

const reservations_table = `${process.env.DB_PREFIX}_reservations`;

//Get all reservations

router.get('/', verifyAuthToken, verifyApiToken, async (req, res) => {

    try {

        knex.from(reservations_table)
            .whereNull('deleted_at')
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});


//Get all reservations by ID
router.get('/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {

        knex.from(reservations_table)
            .where({ id: req.params.id })
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Add reservations
router.post('/', verifyAuthToken, verifyApiToken, async (req, res) => {

    try {

        knex(reservations_table)
            .insert({
                "product": req.body.product,
                "arrival_date": req.body.arrival_date,
                "depart_date": req.body.depart_date,
                "adults": req.body.adults,
                "kids": req.body.kids,
                "babies": req.body.babies,
                "phone": req.body.phone,
                "email": req.body.email,
                "message": req.body.message,
            })
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }

});


//Update reservations by ID
router.patch('/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {
        knex(reservations_table)
            .where({ id: req.params.id })
            .update({
                "product": req.body.product,
                "arrival_date": req.body.arrival_date,
                "depart_date": req.body.depart_date,
                "adults": req.body.adults,
                "kids": req.body.kids,
                "babies": req.body.babies,
                "phone": req.body.phone,
                "email": req.body.email,
                "message": req.body.message,
                "updated_at": knex.fn.now()
            })
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});


//Delete reservations by ID
router.delete('/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {
        knex(reservations_table)
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