const app = require('./app/app.js');
const mongoose = require('mongoose');
require('dotenv').config();

/**
 * https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment#4-listen-on-the-correct-port
 */
const port = process.env.PORT || 8080;


/**
 * Configure mongoose
 * process.env.DB_URL
 */ 
// mongoose.Promise = global.Promise; 
app.locals.db = mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
.then ( () => {
    
    console.log("Connected to Database");
    
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
    
});

/*app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});*/