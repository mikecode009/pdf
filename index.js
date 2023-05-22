const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const hb = require('handlebars');
const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

var app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

let invoices = Array.from({ length: 100 }, (_, i) => `Invoice${i + 1}.pdf`);

async function handlePost(req, res, sendgridApiKey) {
    try {
        const content = req.body.html;
        const email = req.body.email;
        const emailSender = req.body.emailSender || 'contact@allocoq.fr';
        const title = req.body.title;
        const filenameReq = req.body.fileName || 'attachment.pdf';
        const data = {};

        const template = hb.compile(content, { strict: true });
        const result = template(data);
        const html = result;
        console.log("puppeteer.launch ");
        const browser = await puppeteer.launch();
        console.log("browser.newPage ");
        const page = await browser.newPage();
        console.log("page.setConten");
        await page.setContent(html);
        let randomInvoice = invoices[Math.floor(Math.random() * invoices.length)];

        await page.pdf({ path: randomInvoice, format: 'A4' });
        await browser.close();
        console.log("content " + content);
        console.log("email " + email);
        console.log("title " + title);
        console.log("filenameReq " + filenameReq);
        console.log("emailSender " + emailSender);
        sgMail.setApiKey(sendgridApiKey);
        const msg = {
            to: email,
            from: "contact@allocoq.fr",
            subject: title,
            text: 'Hello plain world!',
            html: content,
            attachments: [
                {
                    content: fs.readFileSync(randomInvoice).toString('base64'),
                    filename: filenameReq,
                    type: 'application/pdf',
                    disposition: 'attachment',
                },
            ],
        };

        sgMail.send(msg).then(() => {
            console.log('Email sent successfully.');
        })
            .catch((error) => {
                console.error('Failed to send email.', error);
            })
            .finally(() => {
                if (fs.existsSync(randomInvoice)) {
                    fs.unlinkSync(randomInvoice);
                    console.log('File deleted successfully.');
                } else {
                    console.log('File does not exist.');
                }
            });

        res.status(200).json({
            message: 'success',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred' });
    }
}

app.post('/', (req, res) => {
    console.log('/ coq');

    handlePost(req, res, process.env.sendgrid);
});

app.post('/move', (req, res) => {
    console.log('/move');

    handlePost(req, res, process.env.sendgrid2);
});


app.get('/test', (req, res) => {
    console.log('/test');
    res.send('Hello, World!');
});
var port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server run at port ' + port));
