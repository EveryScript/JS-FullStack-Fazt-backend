'use strict'
 // Import Express
var express = require('express');

// Import UserController from controllers
var UserController = require('../controllers/user.js');

// Metodos de prueba
var router = express.Router();

// Middlewares
var md_auth = require('../middlewares/autenticated');

// Cargar el modulo Multipart para envio de archivos 2021
//var multipart = require('connect-multiparty');
//var md_upload = multipart({
    // Dirección de destino de archivos
//    uploadDir: './uploads/users'
//});

// Cargar el Modulo Multer para envio de archivos 2022
const multer = require('multer');
const my_storage = multer.diskStorage({
    destination: function(req, file, call_back) {
        call_back(null, './uploads/users/')
    },
    filename: function(req, file, call_back) {
        call_back(null, "user" + Date.now() + file.originalname);
    }
});
const upload = multer({ storage: my_storage,  })

// Rutas de metodos de usuario
router.post('/register', UserController.save);
router.post('/login', UserController.login);
router.put('/update', md_auth.authenticated, UserController.update);
router.post('/upload-avatar', [md_auth.authenticated, upload.single('file0')], UserController.uploadAvatar);
router.get('/avatar/:file_name', UserController.avatar);
router.get('/users', UserController.getUsers);
router.get('/user/:user_id', UserController.getUser);

module.exports = router; 