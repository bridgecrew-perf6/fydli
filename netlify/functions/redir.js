//
// redir.js
// - Redirect function for short URLs
//
// SPDX-License-Identifier: Jam
//

import { createClient } from '@supabase/supabase-js'
// Use for local testing
// import 'dotenv/config'

// Configure Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

/**
 * Main
 */
exports.handler = async (event) => {

  // Why would anyone not?
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: {
        Allow: "GET"
      },
      body: "Method Not Allowed"
    }
  }

  // path is e.g. `/sh0rt`
  const {
    path
  } = event;
  
  // Get details
  const {
    data,
    error
  } = await supabase
    .from(process.env.SUPABASE_TABLE)
    .select('short, long, disabled')
    .eq('short', path.slice(1))
    // Only get a link that is enabled
    .is('disabled', false)
    // Make sure only one is returned
    .single()

  // Short URL either invalid or disabled
  if (data === null) {

    console.log(error);

    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'text/html'
      },
      body: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <title>404 Not Found | ${process.env.SITE_TITLE}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width">
          <link rel="stylesheet" type="text/css" href="/assets/styles.css">
        </head>
        <body>
          <main>
            <h1>${process.env.SITE_TITLE}</h1>
            <p>Oops! ${path} isn't a valid URL.</p>
            ${ String(process.env.PUBLIC_SITE) === "true" ? `<p><a href="/" title="Shorten a URL">Shorten one</a></p>`:`` }
          </main>
        </body>
      </html>`
    }
  }

  // Supabase functions are currently Alpha
  // Adding this to see how it performs.
  await supabase.rpc('fydliclick', { short_code: data.short });

  // Valid short. Redirect.
  return {
    statusCode: 301,
    headers: {
      "Referrer-Policy": "no-referrer",
      Location: data.long,
    },
    body: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Redirecting... | ${process.env.SITE_TITLE}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width">
        <link rel="stylesheet" type="text/css" href="/assets/styles.css">
        <meta http-equiv="refresh" content="0; url=${data.long}">
      </head>
      <body>
        <main>
          <h1>${process.env.SITE_TITLE}</h1>
          <p>Redirecting to <code>${data.long}</code>.</p>
          <script>window.location = ${data.long}</script>
        </main>
      </body>
    </html>`
  }

};
