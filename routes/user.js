var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  // res.send('respond with a resource');
  res.render('user', { title: "MyEnquete", nome: req.query.nome, email: req.query.email });
});

module.exports = router;
