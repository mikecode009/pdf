const fs = require('fs')
const path = require('path')
const utils = require('util')
const puppeteer = require('puppeteer')
const hb = require('handlebars')
const readFile = utils.promisify(fs.readFile)
var express = require('express');
var bodyParser = require('body-parser');
var pdf = require('html-pdf');
var options = { format: 'A4' };
var app = express();
const sgMail = require('@sendgrid/mail')

//set the templat engine
app.set('view engine', 'ejs');

//fetch data from the request
app.use(bodyParser.urlencoded({ extended: false }));

async function getTemplateHtml() {

    console.log("Loading template file in memory")
    try {
        const invoicePath = path.resolve("./invoice.html");
        return await readFile(invoicePath, 'utf8');
    } catch (err) {
        return Promise.reject("Could not load html template");
    }
}



app.post('/', (req, response) => {
    let content = req.body.html;
    let email = req.body.email;
    let title = req.body.title;
    let data = {};

    getTemplateHtml()
        .then(async (res) => {
            // Now we have the html code of our template in res object
            // you can check by logging it on console
            // console.log(res)

            console.log("res " + res)

            console.log("Compiing the template with handlebars")
            const template = hb.compile(content, { strict: true });
            // we have compile our code with handlebars
            const result = template(data);
            // We can use this to add dyamic data to our handlebas template at run time from database or API as per need. you can read the official doc to learn more https://handlebarsjs.com/
            const html = result;

            // we are using headless mode 
            const browser = await puppeteer.launch();
            const page = await browser.newPage()

            // We set the page content as the generated html by handlebars
            await page.setContent(html)

            // we Use pdf function to generate the pdf in the same folder as this file.
            await page.pdf({ path: 'invoice.pdf', format: 'A4' })

            await browser.close();
            console.log("PDF Generated")
            let invoicePath2 = path.resolve("./invoice.pdf");
            sgMail.setApiKey("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");

            const msg = {
                to: email,
                from: 'contact@you-move.fr',
                subject: title,
                text: 'Hello plain world!',
                html: content,
                attachments: [
                    {
                        content: fs.readFileSync(invoicePath2).toString('base64'),
                        // content:  readFile(invoicePath2, 'utf8').toString('base64'),
                        filename: 'BonDeCommande.pdf',
                        type: 'application/pdf',
                        disposition: 'attachment'
                    }
                ]
            };
            sgMail
                .send(msg)
                .then(() => console.log('Mail sent successfully'))
                .catch(error => console.error(error.toString()));
            response.status(200).json({
                message: "succes"
            });
        }).catch(function (error) {
            console.error(error);
            res.status(400).json({
                message: "error"
            });
            return true;

        })
        .catch(err => {
            console.error(err);
            res.status(400).json({
                message: "error"
            });
            return true;
        });

})

app.post('/coqmail', (req, response) => {
    let content = req.body.html;
    let email = req.body.email;
    let title = req.body.title;
    let data = {};

    getTemplateHtml()
        .then(async (res) => {
            // Now we have the html code of our template in res object
            // you can check by logging it on console
            // console.log(res)

            console.log("res " + res)

            console.log("Compiing the template with handlebars")
            const template = hb.compile(content, { strict: true });
            // we have compile our code with handlebars
            const result = template(data);
            // We can use this to add dyamic data to our handlebas template at run time from database or API as per need. you can read the official doc to learn more https://handlebarsjs.com/
            const html = result;

            // we are using headless mode 
            const browser = await puppeteer.launch();
            const page = await browser.newPage()

            // We set the page content as the generated html by handlebars
            await page.setContent(html)

            // we Use pdf function to generate the pdf in the same folder as this file.
            await page.pdf({ path: 'invoice.pdf', format: 'A4' })

            await browser.close();
            console.log("PDF Generated")
            let invoicePath2 = path.resolve("./invoice.pdf");
            sgMail.setApiKey("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");

            const msg = {
                to: email,
                from: 'contact@coq-chauffeur.site',
                subject: title,
                text: 'Hello plain world!',
                html: content,
                attachments: [
                    {
                        content: fs.readFileSync(invoicePath2).toString('base64'),
                        // content:  readFile(invoicePath2, 'utf8').toString('base64'),
                        filename: 'BonDeCommande.pdf',
                        type: 'application/pdf',
                        disposition: 'attachment'
                    }
                ]
            };
            sgMail
                .send(msg)
                .then(() => console.log('Mail sent successfully'))
                .catch(error => console.error(error.toString()));
            response.status(200).json({
                message: "succes"
            });
        }).catch(function (error) {
            console.error(error);
            res.status(400).json({
                message: "error"
            });
            return true;

        })
        .catch(err => {
            console.error(err);
            res.status(400).json({
                message: "error"
            });
            return true;
        });

})


//assign port
var port = process.env.PORT || 3000;
app.listen(port, () => console.log('server run at port ' + port));