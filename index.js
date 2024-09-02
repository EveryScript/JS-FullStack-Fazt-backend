'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3999;

// Configuración extra a Mongoose
// mongoose.set('useFindAndModify', false);

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_node', { useNewUrlParser: true })
		.then(() => {
			console.log('La conexion a la base de datos de MongoDB se ha realizado correctamente!');

			// Crear el sevidor
			app.listen(port, () => {
				console.log("El servidor http://localhost:3999 funciona bien");
			});
		})
		.catch (error => console.log(error));