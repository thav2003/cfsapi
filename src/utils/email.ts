import * as nodemailer from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { OAuth2Client } from 'google-auth-library';
import { User } from '@models';
import logger from '@src/logger';


export default class Email {
  public to:string ;

  public firstName: string;

  public from: string;

  public myOAuth2Client: OAuth2Client;

  constructor(user:User) {
    logger.debug('Email Service constructor');
    this.to = user.email;
    this.firstName = user.name;
    this.from = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`;
    
    this.myOAuth2Client = new OAuth2Client(
      process.env.GOOGLE_MAILER_CLIENT_ID,
      process.env.GOOGLE_MAILER_CLIENT_SECRET,
    );
    this.myOAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
    });
  }

  newTransport(myAccessToken) {
    const options = {
      service: process.env.EMAIL_SERVICE,
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USERNAME,
        clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
        clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
        accessToken: myAccessToken,
      },
    };
    return nodemailer.createTransport(options as any);
  }

  async send(subject, text) {
    // // 1. render html based on a pug template
    // const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
    //   firstName: this.firstName,
    //   url: this.url,
    //   subject,
    // });
    
    // 2. define email options
    const mailOptions:Mail.Options = {
      from: this.from,
      to: this.to,
      subject,
      //html,
      //text: htmlToText(html),
      text: 'Click vào link để xác thực tài khoản của bạn!\r' + text,
    };
    // 3. create a transport and send mail
    const myAccessTokenObject = await this.myOAuth2Client.getAccessToken();
    const myAccessToken = myAccessTokenObject.token;
    await this.newTransport(myAccessToken).sendMail(mailOptions);
  }

  async sendVerify(url) {
    logger.debug('Email Service SendVerify is sending ...');
    await this.send('Verify', url);
    logger.debug('Email Service SendVerify is ended !!!');
  }

}