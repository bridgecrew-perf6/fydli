//
// update-code.js
// - Update (disable) a short code
//
// SPDX-License-Identifier: Jam
//

import { createClient } from '@supabase/supabase-js';
// Use for local testing
//import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL, // Base
  process.env.SUPABASE_KEY, // Public key
);

/**
 * Main function
 */
exports.handler = async (event) => {

  // Make sure it is a post
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        Allow: "POST"
      },
      body: "Method Not Allowed"
    };
  }

  // Short URL to update
  const { short, userId } = JSON.parse(event.body);

  const {
    data,
    error
  } = await supabase
    .from(process.env.SUPABASE_TABLE)
    .update({disabled: true})
    .match({
      short: short,
      user_id: userId
    })
    .single()
    
  // Is it updated?
  
  // Was updated
  if (data !== null) {

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        updated: true
      })
    };
    
  }

  console.log(error);

  // Not Updated
  return {
    statusCode: 500,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      updated: false,
      message: error
    }),
  };

}
