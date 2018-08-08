const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');


const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_port,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    }
});

exports.send = async (options) => {
    const mailOptions = {
        from: `Zuber Ab <noreply@zuber.com>`,
        to: options.user.email,
        subject: options.subject,
        html: 'this wil',
        text: 'this wil',
    };
    const sendMail = promisify(transport.sendMail, transport);
    return sendMail(mailOptions);
}

// transport.sendMail({
//     from: 'zuber <zuber1077@yahoo.com>',
//     to: 'randome@example.com',
//     subject: 'try',
//     html: 'hey i <strong>love</strong> u',
//     text: 'Hey i **love you**'
// });
