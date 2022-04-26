//
// link-list.js
// - Retrieve user's links
//
// SPDX-License-Identifier: Jam
//

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

exports.handler = async (event) => {
  
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        Allow: "POST"
      },
      body: "Method Not Allowed"
    }
  }

  const {userId} = JSON.parse(event.body);

  const {
    data,
    error
  } = await supabase
    .from(process.env.SUPABASE_TABLE)
    .select('user_id, short, long, created_at, disabled')
    .match({user_id: userId})
    .is('disabled', false)
    .order('id', { ascending: false } )

  // There was an error, return it
  if ( data === null ) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
        body: JSON.stringify(error)
    }
  }

  // Data retrieved, return it.
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }

}
