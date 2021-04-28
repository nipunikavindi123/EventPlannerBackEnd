
require('dotenv').config();

if(process.env.APP_ENVIRONMENT === 'production'){
    module.exports = {
        app: {
            environment : "production",
            base_url    :  "https://boiling-wave-30400.herokuapp.com/",
            fileSizeLimit : 10485760,
            allowedMimeType : ['image/jpeg', 'image/png', 'image/gif'],
            database_uri : "mongodb+srv://admin:admin@eventplanner.3n4uf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
        }
    };
}else{
    module.exports = {
        app: {
            environment : "development",
            base_url    :  "https://boiling-wave-30400.herokuapp.com/",
            fileSizeLimit : 10485760,
            allowedMimeType : ['image/jpeg', 'image/png', 'image/gif'],
            database_uri : "mongodb+srv://admin:admin@eventplanner.3n4uf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",  
        }
    };  
}
  