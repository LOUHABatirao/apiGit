const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
dotenv.config();

const verifyApiToken = require('../verify/verifyApiToken');

// Note: Assuming a payments table exists. If not, create migration for it.

const table_payments = `${process.env.DB_PREFIX}_payments`;

// Initiate payment
router.post('/initiate-payement', async (req, res) => {
    try {
        // Basic validation
        const { amount, currency, description, user_id } = req.body;

        if (!amount || !currency) {
            return res.status(400).json({ message: 'Amount and currency are required' });
        }

        // Insert payment record
        const paymentData = {
            amount,
            currency,
            description: description || '',
            user_id: user_id || null,
            status: 'initiated',
            created_at: knex.fn.now()
        };

        const inserted = await knex(table_payments).insert(paymentData);

        res.status(200).json({
            message: 'Payment initiated successfully',
            payment_id: inserted[0]
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;