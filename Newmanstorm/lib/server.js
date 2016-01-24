//server thingie
var express = require('express');
var app = express();
app.use(express.static("../html"));
require('./routes.js')(app);

function run_server() {
  var server = app.listen(3000, function() {
      console.log("We have started our server on port 3000");
    });
}
/* istanbul ignore if */
if (require.main === module) {
  run_server();
}
else module.exports = run_server;
