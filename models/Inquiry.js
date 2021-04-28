const mongoose = require('mongoose');

const _document_name = "Inquiry";

let InquirySchema = mongoose.Schema({
    name: {
		type: String,
		required : true
	},
	email: {
		type: String,
		required : true
	},
	comment: {
		type: String,
		required : true
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model(_document_name, InquirySchema);