const express = require('express');
require('dotenv').config();
require('./config/connect');
const ArticleApi = require('./routes/Article');
const UserApi = require('./routes/User');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); 
app.use(cookieParser());
 
app.use('/articles', ArticleApi);
app.use('/user', UserApi);
 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server
const PORT = process.env.PORT || 5057;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


//mail system 
app.post('/send-email', async (req, res) => {
    const { to, subject, message } = req.body;
  
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.USEREMAIL,
            pass: process.env.USER_APP_PASSWEORD,
        },
    });
  
    const mailOptions = {
      from: process.env.USEREMAIL,
      to: to,
      subject: subject,
      text: message
    };
  
    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email', error);
      res.status(500).json({ error: 'Error sending email' });
    }
    
});