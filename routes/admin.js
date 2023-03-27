var express = require('express');
var router = express.Router();

const usersRepo = require('../users');  
const questionsRepo = require('../questions');  

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin', { title: 'Admin Painel' });
});


router.get('/users', function(req, res, next) {
  res.json(usersRepo.getAll()); 
});

router.get('/users/:email', function(req, res, next) {
  res.json(usersRepo.getByEmail(req.params.email)); 
});

router.get('/sortudos', function(req, res, next) {
  res.json(usersRepo.sortudos()); 
});

router.get('/questions', function(req, res, next) {
  res.json(questionsRepo.getAll()); 
});


router.get('/questions/:id', function(req, res, next) {
  res.json(questionsRepo.getById(req.params.id)); 
});



module.exports = router;