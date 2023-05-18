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
require('dotenv').config()


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

let invoices = Array.from({ length: 100 }, (_, i) => `Invoice${i + 1}.pdf`);


app.post('/', (req, response) => {
    console.log("sendgrid " + process.env.sendgrid)  // myValue

    let content = req.body.html;
    let email = req.body.email;
    let title = req.body.title;
    let filenameReq = req.body.fileName;
    let data = {};

    getTemplateHtml()
        .then(async (res) => {
            // Now we have the html code of our template in res object
            // you can check by logging it on console
            // console.log(res)

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
            let randomInvoice = invoices[Math.floor(Math.random() * invoices.length)];
            console.log(randomInvoice);

            // we Use pdf function to generate the pdf in the same folder as this file.
            await page.pdf({ path: randomInvoice, format: 'A4' })

            await browser.close();
            console.log("PDF Generated")
            sgMail.setApiKey(process.env.sendgrid);


            const msg = {
                to: email,
                // from: 'contact@coq-chauffeur.site',
                from: 'contact@allocoq.fr',
                subject: title,
                text: 'Hello plain world!',
                html: content,
                attachments: [
                    {
                        // content: fs.readFileSync(invoicePath2).toString('base64'),
                        content: fs.readFileSync(randomInvoice).toString('base64'),
                        filename: filenameReq,
                        type: 'application/pdf',
                        disposition: 'attachment'
                    }
                ]
            };
            sgMail
                .send(msg)
                .then(() => {
                    console.log('Mail sent successfully')
                    // Check if the file exists
                    if (fs.existsSync(randomInvoice)) {
                        // Remove the file
                        fs.unlink(randomInvoice, (err) => {
                            if (err) {
                                console.error('Error deleting the file:', err);
                            } else {
                                console.log('File deleted successfully.');
                            }
                        });
                    } else {
                        console.log('File does not exist.');
                    }
                })
                .catch(error => console.error(error.toString()));
            response.status(200).json({
                message: "succes"
            });

        })
        .catch(err => {
            console.error(err)
        });
})


//assign port
var port = process.env.PORT || 3000;
app.listen(port, () => console.log('server run at port ' + port));