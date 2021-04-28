const express = require('express');
const router = express.Router();
const {check, checkBody} = require('express-validator');
const {authentication_verifier} = require('../libraries/authentication.js');
const {SharedController} = require('../controllers');
const {languageHelper} = require('../helpers/language.js');

const uploader = require("../libraries/uploader");

router.get('/*',  authentication_verifier, function(request, response, next){
    next();
});

router.post('/*',  authentication_verifier, function(request, response, next){
    next();
});

router.put('/*',  authentication_verifier, function(request, response, next){
    next();
});

router.post('/file_uploader', uploader.single('attachment'), SharedController.attachment_uploader);

router.get('/get_current_user_details', SharedController.get_current_user_details);

router.get('/get_supplier_details/:user_id', SharedController.get_supplier_details);

router.get('/get_customer_order_details/:order_id', SharedController.get_customer_order_details);

router.post('/update_user_profile', 
[   
	check('first_name', languageHelper().__("First Name Is Required")).not().isEmpty().trim(),
	check('last_name', languageHelper().__("Last Name Is Required")).not().isEmpty().trim(),
    check('nic', languageHelper().__("NIC Is Required")).not().isEmpty().trim(),
    check('address1', languageHelper().__("Address Is Required")).not().isEmpty().trim(),
    check('address2', languageHelper().__("Address Is Required")).not().isEmpty().trim(),
    check('address3', languageHelper().__("Address Is Required")).not().isEmpty().trim(),
	check('email', languageHelper().__("Email Error")).not().isEmpty().isEmail().normalizeEmail(),
    check("phone", languageHelper().__("Phone Number Is Required"))
	.not().isEmpty()
    .isLength({
      min: 10
    })
    .withMessage(languageHelper().__("Phone Number Must Contain At Least 10 Characters"))
    .isLength({
        max: 10
    })
	.withMessage(languageHelper().__("Phone Number Can Contain Max 10 Characters"))
], SharedController.update_user_profile);


module.exports = router;
