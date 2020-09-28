var express = require('express');
var router = express.Router();
var fs = require("fs");
var emailCheck = require("email-check");


/* GET home page. */
router.get('/', async function(req, res, next) {
  var pass = "1223455";
	if (req.query.email) {
    if (req.query.pass !== pass) return res.end('access deny');
    var r = await verifyEmail(req.query.email);
		res.end(JSON.stringify({verify: r}));
		return;
	}
  res.render('index', { title: 'Express' });
});


function verifyEmail(email) {
  return new Promise(resolve => {

    emailCheck(email)
  .then(function (res) {
    // Returns "true" if the email address exists, "false" if it doesn't.
    resolve(res);
  })
  .catch(function (err) {
    console.log('error: ', err);
    if (err.message === 'refuse') {
      // The MX server is refusing requests from your IP address.
      resolve(false);
      console.log('err1')
    } else {
      // Decide what to do with other errors.
      console.log('err2');
      resolve('un');
    }
  });

  });
}

(async function () {
  console.log('testing');
  console.log(await verifyEmail('samer6955@gmail.com'));
  console.log(await verifyEmail('samer1020399@gmail.com'));
})();




module.exports = router;