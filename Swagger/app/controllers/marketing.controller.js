const nodemailer = require('nodemailer');

exports.sendMarketingEmail = async (req, res) => {
    const { email, subject, message } = req.body;
    const transporter = nodemailer.createTransport({
        host: 'mail.ultimateoutsourcing.co.uk',
        port: 587,
        secure:false,
        auth: {
            user: 'test@ultimateoutsourcing.co.uk',
            pass: 'devxpert@123',
        },
        tls: {
            rejectUnauthorized: false
          }
    });

    const mailOptions = {
        from: 'test@ultimateoutsourcing.co.uk',
        to: email,
        subject: subject,
        text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });

}

// target email fawad@ultimateoutsourcing.co.uk
// source test@ultimateoutsourcing.co.uk
// server or hostname: mail.ultimateoutsourcing.co.uk