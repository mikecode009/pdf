var express = require('express');
var bodyParser = require('body-parser');
var pdf = require('html-pdf');
var fs = require('fs');
var options = { format: 'A4' };

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
        pdf.create(html, options).toFile('./public/uploads/demopdf.pdf', function (err, result) {
            if (err) {
          //      return console.log(err);
                res.status(400).json({
                    message: "error"
                });
                return true;
            }
            else {
                console.log(res);
                var datafile = fs.readFileSync('./public/uploads/demopdf.pdf').toString('base64');
                // res.header('content-type', 'application/pdf');
                // res.send(datafile);

                res.status(200).json({
                    message: datafile
                });
                return true;
            }
        });
    })
})


const puppeteer = require('puppeteer');
const util = require('util');

async function convertHtmlToPdfString(htmlString) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the HTML content of the page
    await page.setContent(htmlString);

    // Generate PDF buffer
    const pdfBuffer = await page.pdf({ format: 'A4' });

    // Close the browser
    await browser.close();

    // Convert PDF buffer to Base64 string
    const pdfBase64 = pdfBuffer.toString('base64');

    return pdfBase64;
}
app.post('/test', (req, res) => {
    // Example usage
    const htmlString = req.body.htmlString;//'<html><body><h1>Hello, World!</h1></body></html>';

    convertHtmlToPdfString(htmlString)
        .then(pdfString => {
            //   console.log(pdfString);
            res.status(200).json({
                message: pdfString
            });
            return true;
        })
        .catch(err => {
            console.error('Error:', err);
            res.status(400).json({
                message: "error"
            });
            return false;
        });

})

var pdf = require('html-pdf');
var options = { format: 'A4' };


app.post('/email', (req, res) => {

    const content = req.body.htmlString;//'<html><body><h1>Hello, World!</h1></body></html>';
    pdf.create(content, options).toFile('./BonDeCommande.pdf', function (err, result) {
        if (err) {
            console.log("error");
            res.status(400).json({
                message: "error"

            });
            return true;
        }
        else {
            console.log("succes");
            res.status(200).json({
                message: fs.readFileSync('./BonDeCommande.pdf').toString('base64')

            });
            return true;
        }
    });




})

//assign port
var port = process.env.PORT || 3000;
app.listen(port, () => console.log('server run at port ' + port));

