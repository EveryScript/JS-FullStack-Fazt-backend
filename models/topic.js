'use strict'

// Import Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Import Mongoose Paginate para hacer paginaciones
var mongoose_paginate = require('mongoose-paginate-v2');

// Define Model Comments
var CommentsSchema = Schema({
	content: String,
	date: { type: Date, default: Date.now },
	user: { type: Schema.ObjectId, ref: 'User' },
});

var Comment = mongoose.model('Comment', CommentsSchema);

// Define Model Topic
var TopicSchema = Schema({
	title: String,
	content: String,
	code: String,
	lang: String,
	date: { type: Date, default: Date.now },
	user: { type: Schema.ObjectId, ref: 'User' },
	comments: [CommentsSchema]
});

// Cargar paginación en el esquema
TopicSchema.plugin(mongoose_paginate);

// Export schema
module.exports = mongoose.model('Topic', TopicSchema);