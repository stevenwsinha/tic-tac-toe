const express = require('express');
const pug = require('pug');
const parser = require('body-parser')
const app = express();
const port = 3003;

app.set('views', './views');
app.set('view engine', 'pug');

app.use(parser.urlencoded({extended: true}) )
app.use(express.static('./'));

app.get("/ttt/", function(req, res) {
    res.set('X-CSE356', '61f9cee64261123151824fcd');
    res.render('index', {name: ""});
});

app.post("/ttt/", function(req, res) {
    res.set('X-CSE356', '61f9cee64261123151824fcd');
    res.render('index', {name: req.body.name});
});

app.listen(port, ()=> {
    console.log(`Example app listening at http://localhost:${port}`);
})
