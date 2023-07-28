import { config } from "dotenv";
config();
import nodemailer from 'nodemailer'

const sendEmail = async function (email, subject, message){

    // create reusable transporter object using the default STMP transport
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other port
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        },
    });


    // send mail with defined transport object
    await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL, // sender address
        to: email,  // user email
        subject: subject,   // subject line
        html: message,  // html body
    });
};

export default sendEmail;