# Wedding e-invitation – Ng Wei Chyet & Lim Yi Wei

Files: `index.html` · `style.css` · `script.js` · `config.js` (all your details) · `assets/` · `apps-script/Code.gs`

## Change details later
Open `config.js`. Names, date, venue, address, max guests, video, photos and the RSVP link are all there.

## Preview on your computer
Double-click `index.html` (RSVP will not submit from a local file – that is normal), or for a closer match to the live site:
`cd wedding-invitation` then `python3 -m http.server 8000` and open http://localhost:8000

## Part 1 – RSVP database (Google Sheets + Apps Script)
1. Go to sheets.google.com, create a blank sheet, name it "Wedding RSVP".
2. Menu **Extensions > Apps Script**. Delete the sample code, paste all of `apps-script/Code.gs`, click Save.
3. Click **Deploy > New deployment**, gear icon > **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click Deploy, approve the permissions (Advanced > Go to project (unsafe) is normal for your own script).
5. Copy the **Web app URL** (ends in `/exec`).
6. Paste it into `rsvpEndpoint` in `config.js`.
7. Visit the URL in a browser: you should see `{"status":"ok",...}`.
If you edit Code.gs later: Deploy > Manage deployments > pencil > Version: New version > Deploy (the URL stays the same).

## Part 2 – Publish on GitHub Pages (free)
Upload the **contents** of the `wedding-invitation` folder so `index.html` sits at the top level of the repository (a hidden file `.nojekyll` is included; upload it too if your computer shows hidden files).
1. Create a free account at github.com, click **New repository**, name it e.g. `our-wedding`, set **Public**, Create.
2. Click **uploading an existing file**, drag in everything inside the `wedding-invitation` folder (index.html, style.css, script.js, config.js, the assets and apps-script folders), then **Commit changes**.
3. **Settings > Pages**: Source = Deploy from a branch, Branch = `main`, folder `/ (root)`, Save.
4. After 1–2 minutes your link is `https://YOUR-USERNAME.github.io/our-wedding/`.
Note: a Public repo means the photos are public to anyone who finds the repo. The invitation link itself is only as private as you keep it.

## Part 3 – Test RSVP from your phone
Open the live link on your phone, submit one "attending" and one "unable to attend" test, then check the **RSVP** tab in the Sheet. Delete the test rows afterwards.

## View / export the list
Open the Sheet. **File > Download > CSV** or Excel. Sort or filter with **Data > Create a filter**. Total attendees: `=SUMIF(D:D,"Attending",E:E)  (column E = Pax)`.

## Opening animation and video
The opening (lace envelope opens, your photograph slides out, the invitation card appears) is built into the page, so it stays sharp on every screen and loads instantly. It uses your photo and the details in `config.js` (`introPhoto`, names, date, venue). Guests can tap **Replay**.
`assets/video/invitation-intro.mp4` is a 14-second video of the same animation (540x960, about 0.6 MB, no sound). Use it to send on WhatsApp or Instagram Stories with your website link. It is not used by the website itself.
To change the photo or details later, edit `config.js`; to make a fresh MP4, ask me to re-render.
Fonts are included in `assets/fonts/`, so the site does not depend on Google Fonts.

## Auto-scroll
The **Auto-scroll** button (bottom-left) glides the page down slowly. Touching, scrolling, pressing a key or tapping the page stops it. Change `autoScrollSpeed` in `config.js` (pixels per second) or set `autoScroll: false` to remove the button.

## Music
`assets/audio/wedding-theme.mp3` is an original sweet acoustic-guitar style loop made for this site, so there are no copyright worries. Phones only allow sound after a tap, so music starts on the guest's first tap, and the **Music** button (top-left) switches it off. To use another song, replace the file or change `music` in `config.js` (set `""` for no music). Only use a track you have the right to use, as popular songs can lead to copyright takedowns on public pages.

## Using a song you own
Popular songs (for example Utada Hikaru's "First Love") are copyrighted, so I cannot supply them. If you have the right to use a track: rename it `wedding-theme.mp3`, put it in `assets/audio/` (replace the existing file), and keep it under about 5 MB. Public pages with commercial songs can be taken down, so a licensed or royalty-free track is the safe choice.

## Photos
Put new photos in `assets/photos/` (about 1600px on the long side, JPG) and add a line in `photos` in `config.js`. Original untouched file is kept in `assets/originals/`.

## Limits, honestly
- Apps Script works on GitHub Pages without a paid service, but browsers cannot hide the web app URL; anyone could post to it. Spam trap, validation and length limits are included, nothing more.
- The site only says "received" after Apps Script confirms the row was written. If the network drops mid-way, the guest sees an error and can retry; duplicates are blocked by a request ID.
- Free Apps Script has daily quotas that are far above a wedding's needs.
- Calendar entry length (3 hours) is a placeholder because no end time was given; change `calendarHours`.
