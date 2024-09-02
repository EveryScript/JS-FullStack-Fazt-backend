'use strict'

// Requires
var express = require('express');
var bodyParser = require('body-parser');

// Ejecutar Express
var app = express();

// Cargar archivos de rutas
var user_routes = require('./routes/user');
var topic_routes = require('./routes/topic');
var comment_routes = require('./routes/comment');

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS
// Para que el FrontEnd haga peticiones al BackEnd (ApiRest) es necesario configurar el CORS (Acceso cruzado entre dominios)
// de modo que cualeuir origen sea admitido por nuestra nueva ApiRest
// las siguientes lineas de codigo son obtenidas desde: https://victorroblesweb.es/2018/01/31/configurar-acceso-cors-en-nodejs/
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// Reescribir rutas
app.use('/api', user_routes);
app.use('/api', topic_routes);
app.use('/api', comment_routes);

// Exportar el módulo
module.exports = app;