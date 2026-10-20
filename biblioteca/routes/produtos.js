var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index_produtos', { title: 'Produtos' });
});

router.get('/chocolate', function(req, res, next) {
  res.render('index_chocolate', { title: 'Chocolate' });
});

router.get('/pirulito', function(req, res, next) {
  res.render('index_pirulito', { title: 'Pirulito' });
});

module.exports = router;
