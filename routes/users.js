const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const verifyAuthToken = require('../verify/verifyToken');
const verifyApiToken = require('../verify/verifyApiToken');
const jwt = require('jsonwebtoken');

dotenv.config();

const { createValidation, updateValidation } = require('../validation/users');

const users_table = `${process.env.DB_PREFIX}_users`;
const roles_users_table = `${process.env.DB_PREFIX}_roles_users`;
const roles_table = `${process.env.DB_PREFIX}_roles`;
const table_permissions = `${process.env.DB_PREFIX}_permissions`;
const table_permissions_roles = `${process.env.DB_PREFIX}_permissions_roles`;

//Get all users
router.get('/', verifyAuthToken, verifyApiToken, async (req, res) => {

    try {

        knex.select(users_table + '.*', roles_users_table + '.id_role').from(users_table)
            .leftJoin(roles_users_table, users_table + '.id', '=', roles_users_table + '.id_user')
            .leftJoin(roles_table, roles_table + '.id', '=', roles_users_table + '.id_role')
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

// Get all user permissions
router.get('/auth/permissions', async (req, res) => {

    const token = req.header('auth-token');
    if (!token || token == null || token == 'null') return res.status(401).send('Access Denied');
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    const authUserId = verified.user_id;

    knex.select(
        table_permissions + '.permissions_name',
        table_permissions + '.key',
        table_permissions + '.create',
        table_permissions + '.delete',
        table_permissions + '.update',
        table_permissions + '.show'
    ).from(table_permissions)
        .join(table_permissions_roles, table_permissions_roles + '.id_permission', '=', table_permissions + '.id')
        .join(roles_table, roles_table + '.id', '=', table_permissions_roles + '.id_role')
        .join(roles_users_table, roles_users_table + '.id_role', '=', roles_table + '.id')
        .where('id_user', authUserId)
        .then(rows => {
            res.status(200).json(rows);
        }).catch(err => {
            res.status(400).json(err);
        });


});

//Get all users by ID
router.get('/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {

        knex.select(users_table + '.*', roles_users_table + '.id_role').from(users_table)
            .join(roles_users_table, users_table + '.id', '=', roles_users_table + '.id_user')
            .join(roles_table, roles_table + '.id', '=', roles_users_table + '.id_role')
            .where(users_table + '.id', '=', req.params.id)
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Add user
router.post('/', verifyAuthToken, verifyApiToken, async (req, res) => {

    try {
        const { users_image, users_name, users_email, users_password, id_role } = req.body;
        bcrypt.genSalt(parseInt(process.env.SLATE_HASH), function (err, salt) {
            if (err) {
                return res.status(400).json({ message: "general error detected please try later :(" });
            }
            bcrypt.hash(users_password, salt, async function (err, hash) {
                if (err) {
                    return res.status(400).json({ message: "general error detected please try later :(" });
                }
                const { error } = createValidation(req.body);
                if (error) return res.status(400).json({ message: error.details[0].message });
                knex(users_table)
                    .insert({
                        "users_image": users_image,
                        "users_name": users_name,
                        "users_email": users_email,
                        "users_password": hash,
                    })
                    .then(rows => {
                        knex(roles_users_table)
                            .insert({
                                "id_role": id_role,
                                "id_user": rows[0],
                            })
                            .then(rows => {
                                return res.status(200).json(rows);
                            }).catch(err => {
                                return res.status(400).json({ message: err });
                            });
                    });
            });
        });
    } catch (error) {
        return res.status(400).json({ message: error });
    }

});

//Update users by ID
router.patch('/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    const { users_image, users_name, users_email, id_role } = req.body;
    try {
        const { error } = updateValidation(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        knex(users_table)
            .where({ id: req.params.id })
            .update({
                "users_image": users_image,
                "users_name": users_name,
                "users_email": users_email,
                "updated_at": knex.fn.now()
            })
            .then(rows => {
                if (id_role) {
                    knex(roles_users_table)
                        .where({ id_user: req.params.id })
                        .del()
                        .then(rows => {
                            knex(roles_users_table)
                                .insert({
                                    "id_role": id_role,
                                    "id_user": req.params.id,
                                })
                                .then(rows => {
                                    return res.status(200).json(rows);
                                }).catch(err => {
                                    return res.status(400).json({ message: err });
                                });
                        });
                } else {
                    return res.status(200).json(rows);
                }

            });


    } catch (err) {
        res.status(500).json({ message: err });
    }
});


//Delete users by ID
router.delete('/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {
        knex(users_table)
            .where({ id: req.params.id })
            .del()
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

/*************************************************/

//Update users roles by ID
router.patch('/role/:id_user', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {
        knex(roles_users_table)
            .where('id_user', '=', req.params.id_user)
            .update({
                "id_role": req.body.id_role
            })
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

module.exports = router;