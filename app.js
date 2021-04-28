const http       = require("http");
const path       = require("path");
const express    = require("express");
const bodyParser = require("body-parser");
const logger     = require('morgan');
const flash      = require('express-flash');
const helmet     = require('helmet');
const cors       = require('cors');
const fs         = require('fs');
const moment     = require('moment');
const CronJob    = require('cron').CronJob;
const htmlEscape = require('secure-filters').html;
require('express-async-errors');

const config_app             = require('./config/app.js');
const  {databaseInitializer} = require('./libraries/database.js');
const {languageHelper}       = require('./helpers/language.js');

const {app_route, customer_route, supplier_route, admin_route, shared_route}    = require('./routes');

var app = express();

let dir_base = __dirname;

let app_root = '/';

app.use(helmet());


if(config_app.app.environment == "development"){
  app.use(logger('dev'));
}

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
	extended: true
}));


app.use(flash());

app.use(cors());


databaseInitializer(config_app.app.database_uri);

app.use(express.static(path.join(dir_base, 'public')));

let helper = {
	language : function (value) {
		return languageHelper().__(value);
	},
	app_root : function(){
		return app_root;
	},
	base_url : function(){
		return config_app.app.base_url;
	},
	initial_capitalizer : function(string){
	  return string[0].toUpperCase() +  string.slice(1); 
	},
	date_format : function(date, format='MM/DD/YYYY'){
	  return moment(date).format(format);
	},
	truncate : function(str, len){
		if (str.length > len){
           return str.substring(0,5) + '...';
		}else{
	      return str;
		}
	},
	htmlEscaper : function (str){
		return htmlEscape(str);
	}

};

app.use(function (request, response, next) {;
    request.helper   = helper;
	next();
});

app.use(function(request, response, next) {
	//response.locals.session = request.session;
	response.setHeader('Cache-Control', 'no-cache, no-store');
	next();
});

// const job = new CronJob('1 * * * * *', function() {
// 	 console.log('You will see this message every 1 second');
// 	 ///
//  }, null, true, 'Asia/Colombo');
// job.start();


app.use('/api/v1/', app_route);
app.use('/api/v1/customer', customer_route);
app.use('/api/v1/supplier', supplier_route);
app.use('/api/v1/admin', admin_route);
app.use('/api/v1/shared', shared_route);

app.disable('x-powered-by');

// app.use((request, response, next) => {
//     const err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

app.set('port', process.env.PORT || 3030);

http.createServer(app).listen(app.get('port'), function () {
	console.log("Express server listening on port " + app.get('port'));
});

module.exports = app;

