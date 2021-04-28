const express = require('express');
const router = express.Router();
const {check, checkBody} = require('express-validator');

const {authentication_verifier} = require('../libraries/authentication.js');
const { AppController } = require('../controllers');
const {languageHelper} = require('../helpers/language.js');
const {User_Model} = require('../models');
const uploader = require("../libraries/uploader");


router.get('/', authentication_verifier, AppController.index);

router.post('/login', 
[
	check('email', languageHelper().__("Email Error")).not().isEmpty(),
	check('email', languageHelper().__("Invalid Email Format")).isEmail(),
	check('password',  languageHelper().__("Password Error")).not().isEmpty()
], AppController.login);

router.post('/file_uploader', uploader.single('attachment'), AppController.attachment_uploader);

router.post('/registration', 
[   
	check('first_name', languageHelper().__("First Name Is Required")).not().isEmpty().trim(),
	check('last_name', languageHelper().__("Last Name Is Required")).not().isEmpty().trim(),
  check('nic', languageHelper().__("NIC Is Required")).not().isEmpty().trim(),
  check('address1', languageHelper().__("Address Is Required")).not().isEmpty().trim(),
  check('address2', languageHelper().__("Address Is Required")).not().isEmpty().trim(),
  check('address3', languageHelper().__("Address Is Required")).not().isEmpty().trim(),
	check('email', languageHelper().__("Email Error")).not().isEmpty().isEmail().normalizeEmail(),
  check('email').custom(function (value) {
        return User_Model.findUserByEmail(value).then(function (email) {
          if (email) {
            return Promise.reject(value + languageHelper().__("Already Exists, Please Choose Another"));
          }
        });
  }),
  check("phone", languageHelper().__("Phone Number Is Required"))
	.not().isEmpty()
    .isLength({
      min: 10
    })
    .withMessage(languageHelper().__("Phone Number Must Contain At Least 10 Characters"))
    .isLength({
        max: 10
    })
	.withMessage(languageHelper().__("Phone Number Can Contain Max 10 Characters")),
	check('phone').custom(function (value) {
        return User_Model.findUserByPhone(value).then(function (phone) {
          if (phone) {
            return Promise.reject(value +  '  already exists, please choose another');
          }
        });
	}),
  check('role', languageHelper().__("User Role Is Required")).not().isEmpty().isIn(['supplier', 'customer'])
    .withMessage(languageHelper().__("Invalid User Type")),
	check("password", languageHelper().__("Password Error")).not().isEmpty()
    .isLength({
      min: 6
    })
    .withMessage(languageHelper().__("Password Must Contain At Least 6 Characters"))
    .isLength({
        max: 12
    })
    .withMessage(languageHelper().__("Password Can Contain Max 12 Characters")),
], AppController.registration);

router.get('/refresh_token/', AppController.refresh_token);

router.get('/revoke', authentication_verifier, AppController.revoke);

router.get('/check_role_access', AppController.check_role_access);

router.post('/add_contactus', 
[   
  check('name', languageHelper().__("Name Is Required")).not().isEmpty().trim(),
  check('email', languageHelper().__("Email Is Required")).not().isEmpty().trim(),
  check('comment', languageHelper().__("Comment Is Required")).not().isEmpty().trim(),
  
], AppController.add_contactus);


module.exports = router;