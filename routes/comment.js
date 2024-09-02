'use strict'
 // Import Express
var express = require('express');

// Import TopicController from controllers
var CommentController = require('../controllers/comment');

// cargar el Router
var router = express.Router();

// Middlewares (autenticación de cabeceras - token)
var md_auth = require('../middlewares/autenticated');

// --- RUTAS ---
// Añadir comentario a un Topic
router.post('/comment/topic/:topicId', md_auth.authenticated, CommentController.add);
// Editar comentario segun su Id
router.put('/comment/:commentId', md_auth.authenticated, CommentController.update);
// Eliminar comentario de un Topic
router.delete('/comment/:topicId/:commentId', md_auth.authenticated, CommentController.delete);

module.exports = router; 