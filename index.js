const app = require('./app/app.js');
const mongoose = require('mongoose');

/**
 * https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment#4-listen-on-the-correct-port
 */
const port = process.env.PORT || 8080;


/**
 * Configure mongoose
 * process.env.DB_URL
 */ 
// mongoose.Promise = global.Promise; 
/*app.locals.db = mongoose.connect("mongodb+srv://Gruppo19:Gruppo19@cluster0.ajech77.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {useNewUrlParser: true, useUnifiedTopology: true})
.then ( () => {
    
    console.log("Connected to Database");
    
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
    
});*/

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});