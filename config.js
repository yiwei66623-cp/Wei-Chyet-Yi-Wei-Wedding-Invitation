/* ==========================================================
   EDIT YOUR DETAILS HERE – no other file needs changing.
   ========================================================== */
window.WEDDING = {
  groom: "Ng Wei Chyet",
  bride: "Lim Yi Wei",

  // Exact start time in Malaysia time (+08:00). Used by the countdown and calendar.
  startsAt: "2026-12-27T19:00:00+08:00",
  weekday: "Sunday",
  dateLabel: "27 December 2026",
  timeLabel: "7:00 PM",
  // Length of the calendar entry only (not shown to guests).
  calendarHours: 3,

  eventTitle: "Wedding Dinner",
  venue: "Crowne Plaza Penang Straits City",
  address: "PMT 5150, Jalan Bagan Luar, Bandar Selat, 12000 Butterworth, Penang, Malaysia",

  // RSVP: paste the Web app URL from Google Apps Script (see README, Part 1).
  rsvpEndpoint: "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE",
  // Highest guest count offered. Per-invitation limit: share  yoursite/?max=2
  maxGuests: 10,

  // Photograph shown inside the opening envelope animation.
  introPhoto: "assets/photos/couple-01.jpg",
  introFocus: "50% 40%",

  // Gallery and closing photographs. Add more by adding lines.
  photos: [
    { src: "assets/photos/couple-01.jpg", alt: "Ng Wei Chyet and Lim Yi Wei beside a tall wooden door", focus: "50% 45%" },
    { src: "assets/photos/couple-02.jpg", alt: "Ng Wei Chyet and Lim Yi Wei smiling together in a white room", focus: "50% 40%" }
  ],
  closingPhoto: "assets/photos/couple-02.jpg",
  closingFocus: "50% 38%",

  // Slow auto-scroll button (speed in pixels per second; 25 = very slow, 60 = brisk).
  autoScroll: true,
  autoScrollSpeed: 38,

  // Background music (original soft piano loop). Replace the file, or set "" for no music.
  music: "assets/audio/wedding-theme.mp3",
  musicVolume: 0.5
};
