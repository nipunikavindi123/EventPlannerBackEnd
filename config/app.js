
require('dotenv').config();

if(process.env.APP_ENVIRONMENT === 'production'){
    module.exports = {
        app: {
            environment : "production",
            base_url    :  "http://localhost:3030/",
            fileSizeLimit : 10485760,
            allowedMimeType : ['image/jpeg', 'image/png', 'image/gif'],
            database_uri : "mongodb://localhost:27017/event_planner",
        }
    };
}else{
    module.exports = {
        app: {
            environment : "development",
            base_url    :  "http://localhost:3030/",
            fileSizeLimit : 10485760,
            allowedMimeType : ['image/jpeg', 'image/png', 'image/gif'],
            database_uri : "mongodb://localhost:27017/event_planner",  
        }
    };  
}
  