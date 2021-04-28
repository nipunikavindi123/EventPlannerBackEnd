const express = require('express');
const router = express.Router();
const {check, checkBody} = require('express-validator');

const {authentication_verifier, access_level_verifier} = require('../libraries/authentication.js');
const {languageHelper} = require('../helpers/language.js');
const {User_Model} = require('../models');
const {AdminController} = require('../controllers');

router.get('/*',  authentication_verifier, access_level_verifier('admin'), function(request, response, next){
    next();
});

router.post('/*',  authentication_verifier, access_level_verifier('admin'), function(request, response, next){
    next();
});

router.put('/*',  authentication_verifier, access_level_verifier('admin'), function(request, response, next){
    next();
});

router.get('/get_user_details/:user_id', AdminController.get_user);

router.delete('/delete_user/:user_id', AdminController.delete_user);

router.post('/update_user_profile/:user_id', 
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
], AdminController.update_user_profile);

router.put('/update_user_status/:user_id',  
[
    check('status', languageHelper().__("Status Is Required")).not().isEmpty()
],
AdminController.update_user_status);

router.get('/get_admin_order_count', AdminController.get_admin_order_count);

router.get('/get_admin_users', AdminController.get_admin_users);

router.get('/get_inquiries', AdminController.get_inquiries);

router.delete('/delete_inquiries/:inquiry_id', AdminController.delete_inquiries);

module.exports = router;