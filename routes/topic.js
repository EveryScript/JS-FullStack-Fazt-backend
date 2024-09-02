    'use strict'
 // Import Express
var express = require('express');

// Import TopicController from controllers
var TopicController = require('../controllers/topic');

// Metodos de prueba
var router = express.Router();

// Middlewares (autenticación de cabeceras - token)
var md_auth = require('../middlewares/autenticated');

// Rutas de metodos de topic
router.post('/topic', md_auth.authenticated, TopicController.save);
router.get('/topics/:page?', TopicController.getTopics);
router.get('/user-topics/:user_id', TopicController.getTopicsByUser);
router.get('/topic/:id', TopicController.getTopic);
router.put('/topic/:id', md_auth.authenticated, TopicController.update);
router.delete('/topic/:id', md_auth.authenticated, TopicController.delete);
router.get('/search/:search', TopicController.search);

module.exports = router; 