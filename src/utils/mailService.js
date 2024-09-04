const nodemailer = require('nodemailer');

// 修改后的 sendEmail 函数
async function sendEmail(recipient, subject, body) {
  // 创建一个发送邮件的传输对象
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'keienwang1024@gmail.com', // 你的 Gmail 地址
      pass: ''   // 你的 Gmail 应用专用密码
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000 // 将连接超时设置为10秒，可以适当调整
  });

  // 设置邮件数据
  let mailOptions = {
    from: 'keienwang1024@gmail.com', // 发件人地址
    to: recipient, // 收件人地址
    subject: subject, // 邮件主题
    text: body, // 纯文本内容
    // html: `<b>${body}</b>` // HTML 内容
  };

  try {
    // 发送邮件
    let info = await transporter.sendMail(mailOptions);
    console.log('邮件发送成功: %s', info.messageId);
  } catch (error) {
    console.error('发送邮件失败:', error.message, error.stack);
  }
}

module.exports = { sendEmail };
