import { config } from "dotenv";
config();
import nodemailer from 'nodemailer'

const sendEmail = async function (email, subject, message){

    // create reusable transporter object using the default STMP transport
    let transporter = nodemailer.createTransport({
        service: "gmail",
        // port: process.env.SMTP_PORT,
        // secure: false, // true for 465, false for other port
        auth: {
            user: "uniquetechexplorer7@gmail.com",
            pass: "paeu ingq isdr dzik",
        },
    });


    // send mail with defined transport object
    await transporter.sendMail({
        from: "rishavunique23@gmail.com", // sender address
        to: email,  // user email
        subject: subject,   // subject line
        html: message,  // html body
    });
};

export default sendEmail;