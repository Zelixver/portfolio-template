## Digital Clock - Multiple Time Zones

A modern, responsive digital clock that displays the current time across 9 major world time zones in real-time.

### Features

✨ **Real-Time Updates**
- Updates every second automatically
- Smooth animations on time changes
- No external dependencies required

🌍 **Multiple Time Zones**
- New York (EST/EDT)
- London (GMT/BST)
- Tokyo (JST)
- Sydney (AEDT/AEST)
- Dubai (GST)
- Singapore (SGT)
- Los Angeles (PST/PDT)
- São Paulo (BRT/BRST)
- Mumbai (IST)

🎨 **Modern Design**
- Gradient background with glassmorphism effects
- Neon green digital clock display with glow effect
- Responsive grid layout
- Smooth hover animations
- Mobile-friendly design

📱 **Responsive**
- Adapts to all screen sizes
- Optimized for desktop, tablet, and mobile devices
- Touch-friendly interface

### Usage

Simply open `index.html` in your web browser. The clocks will automatically start displaying and updating the current time in each timezone.

### Files

- `index.html` - Main HTML structure with 9 timezone clocks and local time display
- `styles.css` - Styling with gradient background, glassmorphism, and animations
- `script.js` - JavaScript logic for real-time clock updates using the Intl API

### How It Works

The application uses the JavaScript `Intl.DateTimeFormat` API to accurately convert the current time to different timezones. The script updates all clocks every second with smooth animations.

### Customization

#### Add More Time Zones

Edit the `timeZones` object in `script.js`:

```javascript
const timeZones = {
    'clock-newyork': 'America/New_York',
    'clock-mycity': 'Your/Timezone',
    // ... add more
};
```

Then add corresponding HTML clock cards in `index.html`:

```html
<div class="clock-card">
    <div class="timezone-name">My City</div>
    <div class="timezone-code">TIMEZONE (UTC±X)</div>
    <div class="digital-clock" id="clock-mycity">00:00:00</div>
</div>
```

#### Change Colors

Modify the CSS variables in `styles.css`:
- Background gradient: `.body` gradient
- Text color: `.digital-clock` color property
- Glow effect: `text-shadow` properties

### Browser Compatibility

Works on all modern browsers that support:
- ES6 JavaScript
- CSS Grid
- Intl API
- CSS Backdrop Filter

### License

MIT License - Feel free to use this for personal or commercial projects.

### Tips

- The local time section automatically detects your system timezone
- Timezone abbreviations and offsets are displayed on each card
- Hover over cards for a subtle lift animation
- All times update simultaneously and precisely

Enjoy your world clock! 🌐⏰
