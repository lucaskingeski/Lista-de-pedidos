var express = require('express');
const { get } = require('.');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('filmes', { title: 'Página de Filmes' });
});

router.get('/drama', function(req, res, next) {
  res.render('filmes', { title: 'Página de Filmes de Drama' });
});

router.get('/comedia', function(req, res, next) {
  res.render('filmes', { title: 'Página de Filmes de Comédia' });
});

router.get('/acao', function(req, res, next) {
  res.render('filmes', { title: 'Página de Filmes de Ação' });
});

module.exports = router;