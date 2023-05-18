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
        const title = req.body.title;
        const filenameReq = req.body.fileName || 'attachment.pdf';;
        const data = {};

        const template = hb.compile(content, { strict: true });
        const result = template(data);
        const html = result;

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);
        let randomInvoice = invoices[Math.floor(Math.random() * invoices.length)];

        await page.pdf({ path: randomInvoice, format: 'A4' });
        await browser.close();

        sgMail.setApiKey(sendgridApiKey);
        const msg = {
            to: email,
            from: 'contact@allocoq.fr',
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

        await sgMail.send(msg);

        if (fs.existsSync(randomInvoice)) {
            fs.unlinkSync(randomInvoice);
            console.log('File deleted successfully.');
        } else {
            console.log('File does not exist.');
        }

        res.status(200).json({
            message: 'success',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred' });
    }
}

app.post('/', (req, res) => {
    handlePost(req, res, process.env.sendgrid);
});

app.post('/move', (req, res) => {
    handlePost(req, res, process.env.sendgrid2);
});

var port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server run at port ' + port));
