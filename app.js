var express = require('express');
var bodyParser = require('body-parser');
var pdf = require('html-pdf');
var fs = require('fs');
var options = { format: 'A4' };
const util = require('util');
//init app
var app = express();

//set the templat engine
app.set('view engine', 'ejs');

//fetch data from the request
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.render('home')
});

app.post('/', (req, res) => {

    res.render('demopdf', { data: req.body.article }, function (err, html) {


        const filePath = './public/uploads/demopdf.pdf';

        pdf.create(html, options).toFile(filePath, (err, result) => {
          if (err) {
            console.error('PDF conversion error:', err);
            res.status(400).json({
              message: 'Error converting HTML to PDF'
            });
          } else {
            console.log('PDF conversion completed:', result);
      
            const datafile = fs.readFileSync(filePath).toString('base64');
            res.status(200).json({
              message: datafile
            });
          }
        });
    })
})



//assign port
var port = process.env.PORT || 3000;
app.listen(port, () => console.log('server run at port ' + port));

