# CHANGELOG

## v0.3.2

### Now With QR Codes!

Get a QR code when link is created and click to download it. Also view/download QR codes on the [*Manage Links*](https://fyd.li/manaage) page. Also customise images with `width`, and `dark` *(foreground)* and `light` *(background)* colours *(zero or more parameters)*
- Base image: `/qr/[code]`;
- Base download: `/qr/dl/[code]`;
- Custom image: `/qr/width=1000,dark=FF00FF,light=00FF00/[code]`;
- Custom image download: `/qr/dl/width=1000,dark=FF00FF,light=00FF00/[code]`.

### Keyboard Events

As well as click events for copying, and disabling links, keyboard *(`keydown` using **Enter**)* is now available on the shorten and manage pages.

### Other Bits
- Added click tracking test to `redir.js` using Supabase function. Functions are in *Alpha* still. Not active on front-end yet;
- Fixed `terms.html`;
- Minor styling tweaks *(attempted to improve mobile styling on manage page)*;

## v0.3.1

Removal of `test.js` and ability to add query paramaters *(**e.g.** `?this=thing&that=too`)* onto short URLs. Any parameters appended to a short code are now dropped and the original long URL is used.

### Why

Changing the location a short code points to is not *(and there are no plans to make it)* a feature of FYDLI. Disabling is currently the only option. So having the ability to append, and even change, the query string parameters when redirecting goes again this. Thus the *(very short-lived)* feature is removed.

## v0.3.0

Big changes.

### In Short...

- Removed `build-redirects.mjs` and import from `build-site.mjs`;
- Removed `rebuild-redirects.js` and scheduled function configuration from `netlify.toml`;
- Fixed issue with shortener form where null short code could get returned;
- Creation time shown on manage page; `link-list.js` modified to return `created_at` from Supabase; fixed table width CSS;
- Added `/test` rewrite along with `test.js` function;

### No more `_redirects` or rebuilding

Remove need for `_redirects` file and scheduled `rebuild-redirects.js` function, by passing everything through to the `redir.js` function *(unless it is an existing path.)* This means:

- Immediate disabling of a short code *(no waiting for rebuild to remove from `_redirects`);*
- Additional query parameters on a link that has search query parameters already e.g.    
  `/sh0rt -> https://example.com/?some=thing`    
  `/sh0rt?and=this -> https://example.com/?some=thing&and=this`

While the addition of query string parameters is possible when using `_redirects`, using a function alone is more streamlined and offers the ability to change a query string value in addition to appending values.

### Query Strings

Previously, if the long URL was `https://example.com?some=thing` any query parameters on the short URL *(**e.g.** `/sh0rt?from=me`)* were dropped. By running redirects through a function, there is the opportunity to set/append these parameters.

For instance, using `/sh0rt` to redirect to `https://example.com/?from=nobody&to=nobody` adding the parameter `/sh0rt?going=nowhere` would result in redirecting to `https://example.com/?from=nobody&to=nobody&going=nowhere`. But you can change the default using `/sh0rt?from=me&to=you&going=home` which results in redirecting to `https://example.com/?from=me&to=you&going=home`. This makes a link potentially more useful and long-lived.

### Test a Redirect

Added `test.js` for testing URL redirect (with query string parameters) to test what will happen with a URL without the actual redirect. To use, prepend `/test` to a short code *(**e.g.** for `sh0rt` use `/test/sh0rt`)* add any query string *(**e.g.** `/test/sh0rt?something=cool`.)*

## v0.2.2

Safari < 15.4 does not support `crypto.randomUUID()` *(is in development in 15.4 see [MDN `Crypto.randomUUID`](https://fyd.li/zPLa).)* This breaks functionality of the site on a large number of macOS and iOS devices. `fydliID` will now retrieve a UUID from a function when `typeof crypto.randomUUID === "function"` is `false`. This *(potentially)* opens access to many more users.

## v0.2.1

Adds "copy to clipboard" functionality on the link creation and manage links pages *(thanks to Jessica @ Netlify for suggesting the addition [here](https://fyd.li/vyhL))* along with visual feedback *(i.e. text notification)* for this action. Visual feedback extended to the disable link functionality also.

`link-list.html` -> `manage.html`

Manage links page changed to remove the word *"delete"* with better information about what happens with disabling of links (on page and in main page footer.)

Other minor styling changes.

## v0.2.0

This version adds the ability for the link creator to remove links from service without sign up / log in. This keeps the service anonymous as no personal details *(i.e. name, email address)* are ever known or stored.

  ### Key Notes

  - Added code to generate user ID using [`crypto.randomUUID()`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) and save to [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) to `index.html`;
  - ID is sent with all link creation requests (will fail without);
  - Added `list.html` for user to manage links they have created, retrieved via `link-list.js` function; client-side JS renders list;    
    ***Caveat:** if local storage is deleted, user ID is regenerated and all previous links lost to use (though they still work)*
  - Links do not get deleted, only **disabled**. This is to stop the possibility that a deleted code could get created again (because using random generation);    
    ***Caveat:** As site rebuilds are trigger hourly/daily/weekly/etc. the link will still redirect until the next rebuild;*
  - Updated SQL to add `user_id`;

  ### New/Updates Functions/Files
  
  - `link-list.js` (new): retrieve list of user-created links;
  - `update-code.js` (new): update (by disabling) a user-created link;
  - `new-link.js` (updated): added `user_id` sending;
  - `link-list.html` (new): list user-created link, allow *deletion*;
  - `assets/styles.ccs` (updated): styling for link list page.

**†Note:** Safari *(macOS/iOS)* only supports `crypto.randomUUID()` from 15.4 as per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID#browser_compatibility).
**‡Note:** Never written a CHANGELOG before, so excuse me if I screwed it up! 🙃

## v0.1.0

Initial Release
