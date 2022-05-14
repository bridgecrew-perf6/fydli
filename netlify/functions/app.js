//
// app.js
// - FYDLI <-> Supabase
//
// SPDX-License-Identifier: Jam
//

"use strict";
import express from 'express';
import serverless from 'serverless-http';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

// Use Netlify `URL` environment variable
const baseUrl = process.env.URL;

const app = express();
const router = express.Router();

/**
 * Router
 */
router
  .use((req, res, next) => {
    // Use Router-level Middleware to check user ID header
    const userId = req.headers['fydli-id']
    if (!userId) next('router')
    else {
      req.userId = userId
      next()
    }
  })
  .post('/new', async (req, res) => {
    // Create new short URL
    const { long_url } = req.body;
    const short_code = (() => {
      const chars = process.env.SHORT_URL_CHARS;
      const lngth = Number(process.env.SHORT_URL_LENGTH) || 5;
      let code='';
      for(let i = 0; i < lngth; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    })();
    // This is simpler, but only returns lowercase codes
    // const codeLength = Number(process.env.SHORT_URL_LENGTH) || 5;
    // const short_code = () => Math.random().toString(36).split('.')[1].substring(0, codeLength)

    const {
      data,
      error
    } = await supabase
      .from(process.env.SUPABASE_TABLE)
      .insert({
        short: short_code,
        long: long_url,
        user_id: req.userId
      })
      .single()
  
    if (data) {
      res.status(200)
         .json([ true, { code: short_code }])
    }
    else {
      res.status(500)
         .json([ false, { err: error.details }])
    }
  })
  .get('/list', async(req, res) => {
    // User-specific URL list
    const {
      data,
      error
    } = await supabase
      .from(process.env.SUPABASE_TABLE)
      .select('user_id, short, long, created_at, disabled')
      .match({user_id: req.userId})
      .is('disabled', false)
      .order('id', { ascending: false } )

    if (data){
      res.status(200)
         .json([ true, { data }])
    }
    else {
      res.status(500)
         .json([ false, { err: error.details }])
    }
  })
  .delete('/disable/:shortCode', async(req, res) => {
    // Disable a short URL
    const {
      data,
      error
    } = await supabase
      .from(process.env.SUPABASE_TABLE)
      .update({disabled: true})
      .match({
        short: req.params.shortCode,
        user_id: req.userId
      })
      .single()

    if (data)
      res.status(200)
         .json([ true, { data }])
    else
      res.status(500)
         .json([ false, { err: error.details }])
  })
  .all("*", (req, res) => res.status(404).send("Missing"))

/**
 * App
 */
app
  .use(express.json())
  .use('/app', router, (req, res) => {
    // User ID header missing
    res.status(401).json([false, {
      err: `Oops! Invalid user ID.`
    }])
  })

module.exports.handler = serverless(app);
/** Done */
