import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'fatih.muzaqi123@gmail.com', 
        pass: 'lqob yudp tkjn hxgf', 
    }
});

export default transporter;