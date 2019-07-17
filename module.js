  var nodemailer = require('nodemailer');
  export function sendEmail()
  {
      var transporter = nodemailer.createTransport(
      {
        service: 'gmail',
        auth: { user: 'chloechan.chy@gmail.com',pass: '2383015238781'}   
      });

      var mailOptions = {
        from: 'chloechan.chy@gmail.com',
        to: 'chc70@sfu.ca',
        subject: 'Sending Email using Node.js',
        text: 'That was easy!'
      };

      transporter.sendMail(mailOptions, function(error, info)
      {
        if (error) 
          console.log(error);
        else 
          console.log('Email sent: ' + info.response);
        
      });
  }