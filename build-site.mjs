//
// build-site.js
// - Main site building function
//
// SPDX-License-Identifier: Jam
//

import fs from 'fs';

// Use for local testing
// import 'dotenv/config';

// If `site` directory is renamed, change this.
const outDir = "site";

// If PUBLIC_SITE is not explicitly `"true"`, assume a private site
// and ename `index.html` to either specified filename or random name.
if (String(process.env.PUBLIC_SITE) !== "true") {

  console.log("Not public site. Renaming index.html...");

  const filename = (() => {
  
    // Use specified filename
    if (String(process.env.MAIN_PAGE) !== "undefined") {
      return String(process.env.MAIN_PAGE).concat('.html');
    }

    // Or randomly generate one (same as short code generator)
    return (() => {
      const chars = String(process.env.SHORT_URL_CHARS);
      let code='';
      for(let i = 0; i < 12; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code.concat('.html');
    })();

  })();

  try {
    fs.renameSync(`${outDir}/index.html`, `${outDir}/${filename}`);
    console.log("Shortener filename: ", filename);
  } catch(err) {
    console.log(err);
  }

}
