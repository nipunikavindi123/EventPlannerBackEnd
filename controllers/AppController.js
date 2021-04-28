const { check, validationResult } = require('express-validator');
const debug = require('eyes').inspector({styles: {all: 'cyan'}});
const mongoose = require('mongoose');
const async = require('async');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const {User_Model, Inquiry_Model} = require('../models');
const {languageHelper} = require('../helpers/language.js');
const api_config = require("../config/api");
const app_config = require('../config/app');

const AppController = {

    async index(request, response, next){
      return response.status(200).json({
        'code': 'auth/token-notfound',
        'message': 'Authorization header is not found'
      });
    },

    async login(request, response, next){
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
          return response.status(422).json({
            type : 'error',
            message:  errors.array()
          });
      }else{
        const { email, password } = request.body;
        let user = await User_Model.findOne({email : email});
        if (!user) {
          return response.status(403).json({
            type   : 'error',
            //message:  'No account is found associated with the email provided'
            message:  'Invalid credentials'
          });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return response.status(403).json({
              type : 'error',
              message:  'Invalid credentials'
          });
        }

        if(user.isActive === "0"){
          return response.status(403).json({
            type : 'error',
            message:  'This account has been deactivated '
          });
        }

        const payload = {
          user: {
            id: user.id,
            role : user.role
          }
        };

        jwt.sign(
          payload,
          api_config.api.jwt_secret,
          {expiresIn: '1h' },
         // {expiresIn: '8h' },
          (function (err, token){
            if (err) throw err;
            console.log(token);
            const refreshToken = uuidv4();
            User_Model.findByIdAndUpdate({_id: user.id },{refreshToken : refreshToken},{new: true, useFindAndModify : false }, function(err, res){
              if(err){
                response.status(403).json({
                  type : 'error',
                  message:  'Something went wrong, please try again later'
                });
              }

              response.status(200).json({
                  type : 'success',
                  message:  {
                    accessToken : token,
                    refreshToken : refreshToken,
                    role : user.role,
                    expiresIn : Math.floor(Date.now() / 1000) + (60 * 60)
                  }
              });
            });
          })
        );
      }
    },

    async registration(request, response, next){
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
          response.status(422).json({
            type : 'error',
            message:  errors.array()
          });
      }else{

        const {first_name, last_name, password, email, phone, address1, address2, address3, role, nic, nic_pic_url, avatar_url, amount, supplier_type} = request.body;

        let Query_builder = {};
        Query_builder.first_name = first_name;
        Query_builder.last_name = last_name;
        Query_builder.email = email;
        Query_builder.role = role;
        Query_builder.phone = phone;
        Query_builder.password = password;
        Query_builder.isActive = '1';
        Query_builder.nic = nic;
        Query_builder.avatar   = {};
        Query_builder.avatar.url = avatar_url;
        Query_builder.nic_pic = {};
        Query_builder.nic_pic.url = nic_pic_url;
        Query_builder.address = {};
        Query_builder.address.address1 = address1;
        Query_builder.address.address2 = address2;
        Query_builder.address.address3 = address3;

        if(amount){
          Query_builder.amount = amount;
        }

        if(supplier_type){
          Query_builder.supplier_type = supplier_type;
        }


        let User = new User_Model(Query_builder);
        
        User.save().then(function(user){
          return response.status(200).json({
            type : 'success',
            message:  'You have been registered successfully'
          });
        });
        
      }

    },

    async refresh_token(request, response, next){
      var refreshTokenHeader =  request.headers['refreshtoken'];
      const token = refreshTokenHeader && refreshTokenHeader.split(' ')[1];
      if (token == null){ 
        return response.status(403).json({
            type: "error",
            message : languageHelper().__("Refresh Token Is Not A Valid Format")
        });  
      }

      User_Model.findOne({refreshToken: token}, function(err, user) {
        if(err){
          response.status(401).json({
            type : 'error',
            message:  'Something went wrong, please try again later'
          });
        }

        const payload = {
          user: {
            id: user._id,
            role : user.role
          }
        };

        jwt.sign(
          payload,
          api_config.api.jwt_secret,
          {expiresIn: '1h' },
          (err, token) => {
            if (err) throw err;
            response.status(200).json({
              type : 'success',
              message:  token
            });
          }
        );

      });

    },


    async revoke(request, response, next){
      const authHeader = request.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token == null){ 
          return response.status(401).json({
              type: "error",
              message : languageHelper().__("Refresh Token Is Not A Valid Format")
          });  
      }

      const payload = {
        user: {
          id: '',
          role : ''
        }
      };

      jwt.sign(
        payload,
        api_config.api.jwt_secret,
        {expiresIn: '5s' },
        (err, tokenFresh) => {
          if (err) throw err;
          response.status(200).json({
            type : 'success',
            message:  tokenFresh
          });
        }
      );

    },

    async attachment_uploader(request, response, next){
      if (!request.file) {
         response.status(400).json({
          type : 'error',
          message: "Something went wrong please try again"
        });
        return
      } else {
        let image_url = app_config.app.base_url + "bucket/" + request.file.filename;
        response.status(200).json({
          type : 'success',
          message:  {
             avatar_name  : request.file.filename,
             avatar_url : image_url
          }
        });
      }
    },

    async check_role_access(request, response, next){
        const authHeader = request.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token == null){ 
            response.status(401).json({
                type: "error",
                message : languageHelper().__("User Not Logged In")
            });  
            return;
        }

        jwt.verify(token, api_config.api.jwt_secret, function(err, user) {    
            if(err){
                response.status(401).json({
                    type: "error",
                    message : languageHelper().__("User Not Logged In")
                });  
                return;
            }else{
              return response.status(200).json({
                  type: "success",
                  message : user
              }); 
            } 
        });
    },
    
    async add_contactus(request, response, next){
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
          response.status(422).json({
            type : 'error',
            message:  errors.array()
          });
      }else{

        const {name, email, comment} = request.body;

        let Inquiry = new Inquiry_Model({'name' : name, 'email' : email, 'comment' : comment});
        
        Inquiry.save().then(function(user){
          if(user){
            return response.status(200).json({
              type : 'success',
              message:  'Inquiry have been added successfully'
            });
          }else{
            response.status(400).json({
                type : 'error',
                message: "Something went wrong please try again"
            });
            return
          }

        });

      }
    },
    
  
  };
  
  module.exports = AppController;