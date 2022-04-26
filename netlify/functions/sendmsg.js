//
// sendmsg.js
// - Mailer function for contact form
//
// SPDX-License-Identifier: Jam
//

import nodemailer from 'nodemailer';
// Use for local testing
//import 'dotenv/config';

exports.handler = async (event) => {

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "POST" },
      body: "Method not allowed"
    };
  }

  // Passed all checks...
  try {
    // Form elements
    const {
      yourname,
      email_address,
      short_url,
      message
    } = JSON.parse(event.body);

    // See https://nodemailer.com/ for more
    const transporter = nodemailer.createTransport({

      // Follow the instructions from your mail provider.
      host: process.env.MAIL_HOST,
      port: 587,
      secure: false,
      auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD
      }

    });
  
    const msg = {

      // These settings will work with Ethereal Email
      // Where messages should get delivered
      to: `"${process.env.MAIL_NAME}" <${process.env.MAIL_EMAIL}>`,
      // Who they are coming from (the submitter)
      from: `"${yourname}" <${email_address}>`,

      // Depending on the service (e.g. Zoho), you my need may need send 
      // to/from yourself. Remember to set replyTo so you know who it came from
      // to: `"${process.env.MAIL_NAME}" <${process.env.MAIL_EMAIL}>`,
      // from: `"${process.env.MAIL_NAME}" <${process.env.MAIL_EMAIL}>`,

      // Set submitter as reply-to
      // replyTo: `"${yourname}" <${email_address}>`,
      // Could also CC the submitter so they have a copy too
      // cc: `"${yourname}" <${email_address}>`,

      // Set a meaningful subject
      subject: `Message from ${process.env.SITE_TITLE} contact form`,

      // Add the message and short_url
      text: `Short URL: ${short_url}n\
        Message:\n
        ${message}`,
      
      // Want HTML?
      //html: `<p>Short URL: ${short_url}</p><p>${message}</p>`,
    };

    // Send
    let info = await transporter.sendMail(msg);

    // Check response
    if (info.messageId){

      // All good
      return {
        statusCode: 200,
        body: JSON.stringify({
          msg: "Your message was sent. Thank you."
        })
      };

    }

  }
  catch(err) {
    
    // Log error
    console.log(err)
    // Return message
    return {
      statusCode: 500,
      body: JSON.stringify({
        msg: "Could not send your message. Please try again."
      })
    };
  }

};
