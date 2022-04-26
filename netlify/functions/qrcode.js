//
// qrcode.js
// - Generate qrcode for short URLs
//
// SPDX-License-Identifier: Jam
//

import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode'
// Use for local testing
import 'dotenv/config'


// Configure Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
)

async function isValidCode(code) {

  const {
    data,
    error
  } = await supabase
  .from(process.env.SUPABASE_TABLE)
  .select('short, disabled')
  .eq('short', code)
  // Only get a link that is enabled
  .is('disabled', false)
  // Make sure only one is returned
  .single();

  if (error!==null) console.log(error);

  return ( data === null ) ? false : true;
}

// e.g. /qr/[code]
//      /qr/width=1000,light=fafafa,dark=004400/[code]
exports.handler = async (event) => {

  // Get path
  const { path } = event;
  const domain = process.env.URL.replace('https://','');
  let isDownload = false;
  // Slice `/qr/` from it, split into Array.
  const args = path.slice(4).split('/').filter(a => a !== "");

  // Two args is customised [code], otherwise assume last is [code]
  const code = args[args.length-1];

  // Check the code exists and is enabled
  if (await isValidCode(code) !== true) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "text/html",
      },
      body: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <title>400 Bad Request | ${process.env.SITE_TITLE}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width">
          <link rel="stylesheet" type="text/css" href="/assets/styles.css">
        </head>
        <body>
          <main>
            <h1>${process.env.SITE_TITLE}</h1>
            <p>Oops! ${domain}/${code} isn't a valid URL.</p>
            ${ String(process.env.PUBLIC_SITE) === "true" ? `<p><a href="/" title="Home">&laquo; Home</a></p>`:`` }
          </main>
        </body>
      </html>`
    };
  }

  // If it is a download request
  if (args[0] === "dl") {
    // Set true
    isDownload = true;
    // remove dl argument
    args.shift()
  }
  
  // Default QR Code options
  const opts = {
    width: 512,
    color: {
      light: '#FFFFFF',
      dark: '#000000'
    }
  };

  // Code and customisation
  if (args.length === 2) {
    // [opts]/[code]
    args[0].split(',').forEach(o => {
      let v = o.split('=');
      // Append '#' to colours
      if (['dark','light'].includes(v[0].toLowerCase())) {
        opts.color[v[0].toLowerCase()] = "#".concat(v[1]);
      }
      // Width, etc
      if (opts.hasOwnProperty(v[0])) {
        opts[v[0]] = v[1];
      }
    });
  }

  return QRCode.toDataURL(process.env.URL.concat("/",code), opts)
  .then(url => {
    let headers = {
      "Content-Type": "image/png",
    };
    if (isDownload) {
      headers["Content-Disposition"] = `attachment; filename=${domain}-${code}-qr.png`
    }
    return {
      statusCode: 200,
      headers,
      isBase64Encoded: true,
      // This won't work if image format changed.
      body: url.slice("data:image/png;base64,".length)
    }
  })
  .catch(err => {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "text/html"
      },
      body: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <title>500 Server Error | ${process.env.SITE_TITLE}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width">
          <link rel="stylesheet" type="text/css" href="/assets/styles.css">
        </head>
        <body>
          <main>
            <h1>${process.env.SITE_TITLE}</h1>
            <p>Oops! Looks like there was an error generating the QR Code.</p>
            ${ String(process.env.PUBLIC_SITE) === "true" ? `<p><a href="/" title="Home">&laquo; Home</a></p>`:`` }
          </main>
        </body>
      </html>`
    }
  })

};
