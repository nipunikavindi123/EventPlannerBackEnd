const debug = require('eyes').inspector({styles: {all: 'cyan'}});
const jwt = require("jsonwebtoken");

const {languageHelper} = require('../helpers/language.js');
const api_config = require("../config/api.js");
const { use } = require('../routes/app.js');

function  authentication_verifier(request, response, next) {
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
        }
        request.user = user;
        next();
    });
};

//usage  access_level_verifier('admin')
function access_level_verifier(...allowed) {
    const isAllowed = role => allowed.indexOf(role) > -1;
    return function (request, response, next) {
        if (request.user.user.role  && isAllowed(request.user.user.role)){ 
            next();
        }else {
            response.status(403).json({
                type : 'error',
                message : languageHelper().__("Permission Error")
            });
            return;
        }
    };
}

module.exports = {
    authentication_verifier,
    access_level_verifier,
};

