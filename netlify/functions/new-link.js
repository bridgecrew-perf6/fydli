//
// new-link.js
// - Function to add new link to Supabase
//
// SPDX-License-Identifier: Jam
//

import { createClient } from '@supabase/supabase-js'
// Use for local testing
//import 'dotenv/config'

// Supabase config
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY, // Public key
);

// Use built-in URL environment variable for site.
const baseUrl = process.env.URL;

// Insert long and short to Supabase table
async function saveToSupabase(long, short, userId) {

  const {
    data,
    error
  } = await supabase
    .from(process.env.SUPABASE_TABLE)
    .insert({
      short: short,
      long: long,
      user_id: userId
    })
    .single()

  // Return true or false
  if (data !== null) {
    return true;
  }
  console.log("New Link error: ", error)
  return false
}

/**
 * Do things...
 */
exports.handler = async event => {

  /**
   * Basic protection, though easy to bypass.
   */
   const { headers } = event;
   if (event.httpMethod !== "POST") {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'text/plain',
        Accept: "POST",
      },
      body: "Bad request"
    }
  }
  
  // What is the long URL
  const {
    long_url,
    userId,
  } = JSON.parse(event.body);
  
  if (userId === null || userId === undefined || userId === "") {

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        created: false,
        short_url: null,
        message: `Oops! Invalid user ID.`
      })
    }

  }

  // Generate a short code
  const short_code = (() => {
    // User-defined character set || break function
    const chars = process.env.SHORT_URL_CHARS;
    // default length to 5 if unset
    const lngth = Number(process.env.SHORT_URL_LENGTH) || 5;
    let code='';
    for(let i = 0; i < lngth; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  })();
  // Yes, could give the user greater power over choosing a short URL.
  
  /**
   * Check long URL validity
   * Reject null, empty string and any non-https URL
   */
   if (long_url === null || long_url === undefined ||
       long_url === "" || long_url.indexOf('https://') !== 0) {
      
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          created: false,
          short_url: null,
          message: `${long_url} is not valid. Must start with <code>https://</code>.`
        })
      }
  }
  
  /**
   * Don't try shortening a short link
   */
   const domain = baseUrl.replace(/https?:\/\//,'')
   
   if (long_url.includes(domain)) {
 
     return {
       statusCode: 400,
       headers: {
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         created: false,
         short_url: null,
         message: `URL must not contain <code>${domain}</code>.`
       })
     }
 
   }
 
   /**
   * Save details to Supabase
   */
  if (await saveToSupabase(long_url, short_code, userId) === true) {

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        created: true,
        code: short_code,
        short_url: `${baseUrl}/${short_code}`,
        message: `Yay! You can now navigate to <code>${long_url}</code> using <a href="${baseUrl}/${short_code}"><code>${baseUrl}/${short_code}</code></a>.`
      })
    }
    
  }

  /**
   * Failed to save to Supabase
   * Most likely short URL wasn't unique.
   */
  return {
    statusCode: 500,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      created: false,
      short_url: null,
      message: `Oops! There was an error adding <code>${long_url}</code>. Please try again.`
    })
  }

}
