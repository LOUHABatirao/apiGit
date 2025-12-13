const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

require('dotenv/config');


app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Import Routes

const usersRoute = require('./routes/users');
const rolesRoute = require('./routes/roles');
const permissionsRoute = require('./routes/permissions');
const optionsRoute = require('./routes/options');
const recherche_formsRoute = require('./routes/recherche_forms');
const langsRoute = require('./routes/langs');
const post_typeRoute = require('./routes/post_type');
const postsRoute = require('./routes/posts');
const menusRoute = require('./routes/menus');
const menu_itemsRoute = require('./routes/menu_items');
const categoriesRoute = require('./routes/categories');
const categoryItemsRoute = require('./routes/category_items');
const post_fieldsRoute = require('./routes/post_fields');
const files_managerRoute = require('./routes/files_manager');
const post_templatesRoute = require('./routes/post_templates');
const auth = require('./routes/auth');
const authorizedApps = require('./routes/authorizedApps');
const email = require('./routes/email');
const locos = require('./routes/locos');
const locos_bo = require('./routes/locos_bo');
const reservations = require('./routes/reservations');
const contacts = require('./routes/contacts');
const payment = require('./routes/payment');
const path = require('path');


//Middlewares

app.use('/api/users', usersRoute);
app.use('/api/roles', rolesRoute);
app.use('/api/permissions', permissionsRoute);
app.use('/api/options', optionsRoute);
app.use('/api/rechercheforms', recherche_formsRoute);
app.use('/api/langs', langsRoute);
app.use('/api/post_type', post_typeRoute);
app.use('/api/posts', postsRoute);
app.use('/api/menus', menusRoute);
app.use('/api/menu_items', menu_itemsRoute);
app.use('/api/categories', categoriesRoute);
app.use('/api/category-items', categoryItemsRoute);
app.use('/api/post_fields', post_fieldsRoute);
app.use('/api/files_manager', files_managerRoute);
app.use('/api/post_templates', post_templatesRoute);
app.use('/api/authorized-apps', authorizedApps);
app.use('/api/email', email);
app.use('/api/locos', locos);
app.use('/api/reservations', reservations);
app.use('/api/contacts', contacts);
app.use('/api/locos-bo', locos_bo);
app.use('/api/payement', payment);


// auth Middlewares 

app.use('/api/auth', auth);


//Routes

app.get('/', (req, res) => {

    res.send('Api MAP');

});


app.use(express.static('public'));


// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Listning
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});