# Zoho Campaigns Journey Showcase

A comprehensive mini-website for showcasing Zoho Campaigns Workflows to stakeholders with interactive inbox simulation, branch visualization, and automated email sequence demonstration.

## Live Demo

🚀 **View the live demo at**: `https://tamok.github.io/zoho_journey_showcase/`

*(Replace YOUR_USERNAME with your actual GitHub username)*

## Deployment

### GitHub Pages (Recommended)

This project is configured for automatic deployment to GitHub Pages:

1. **Fork or clone this repository** to your GitHub account
2. **Update the repository URLs** in `package.json`:
   ```json
   "repository": {
     "url": "https://github.com/YOUR_USERNAME/zoho_journey_showcase.git"
   },
   "homepage": "https://YOUR_USERNAME.github.io/zoho_journey_showcase/"
   ```
3. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Source: "GitHub Actions"
4. **Push to main/master branch** - the site will automatically build and deploy
5. **Access your site** at `https://YOUR_USERNAME.github.io/zoho_journey_showcase/`

The GitHub Actions workflow will:
- Install Python dependencies
- Process email templates automatically
- Deploy the website to GitHub Pages

### Local Development

For local testing and development:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/zoho_journey_showcase.git
cd zoho_journey_showcase

# Process templates
python scripts/process_templates.py pm

# Serve locally
python -m http.server 8080 --directory website

# Open in browser
# Visit http://localhost:8080
```

## Overview

This tool creates an interactive demonstration of email marketing journeys, showing how different user behaviors (opening/clicking emails) trigger different branches in the campaign workflow. It's designed to be easily reusable for different programs and campaigns.

## Features

- **Interactive Inbox Simulation**: Mimics a real email inbox with realistic email items
- **Journey Branching Visualization**: Shows how opened/not opened emails trigger different paths
- **Automated Playback**: Auto-play feature with adjustable speed (1x to 10x)
- **Reminder Email Generation**: Automatically creates reminder variations with modified text
- **Timeline Tracking**: Shows progression through the journey with timestamps
- **Branch Statistics**: Real-time tracking of main journey vs. reminder sequences
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: Quick controls for power users

## Directory Structure

```
zoho_journey_showcase/
├── journeys/                          # Source journey folders
│   ├── pm/                            # Project Management program
│   │   ├── PM Drip2.drawio.xml       # Journey flow diagram
│   │   ├── template (1).zip          # Email 1 template
│   │   ├── template (2).zip          # Email 2 template
│   │   └── ... (template 3-9)
│   └── hrm/                           # Future: Human Resources Management
├── processed_emails/                   # Processed email outputs
│   └── pm/
│       ├── emails/                    # HTML email files
│       ├── images/                    # Extracted images
│       ├── metadata/                  # Email metadata JSON files
│       └── index.json                # Master index file
├── website/                           # Web application
│   ├── index.html                    # Main application page
│   ├── assets/
│   │   └── styles.css                # Application styles
│   └── scripts/
│       ├── journey-data.js           # Journey configuration
│       ├── email-processor.js        # Email processing logic
│       ├── journey-simulator.js      # Journey simulation engine
│       └── app.js                    # Main application script
└── scripts/
    └── process_templates.py          # Template processing script
```

## Quick Start

### 1. Set Up the Environment

Ensure you have Python 3.7+ installed for the template processing script.

### 2. Process Email Templates

```bash
# Navigate to the scripts directory
cd scripts

# Process templates for Project Management program
python process_templates.py pm

# For future programs:
# python process_templates.py hrm
```

### 3. Launch the Website

1. Open `website/index.html` in a modern web browser
2. Select your program from the dropdown (currently "Project Management")
3. Click "Auto Play" to start the journey simulation
4. Watch emails appear in the inbox based on the journey flow

### 4. Interact with the Journey

- **Select emails** from the inbox to preview their content
- **Mark emails as opened** to trigger the main journey path
- **Mark emails as clicked** for higher engagement simulation
- **Adjust speed** using the slider (1x to 10x speed)
- **Reset journey** to start over at any time

## Adding New Programs

### 1. Create Program Folder

```bash
mkdir journeys/[program-name]
```

### 2. Add Journey Files

Place the following files in your program folder:
- `[program].drawio.xml` - Journey flow diagram (optional, for reference)
- `template (1).zip` through `template (9).zip` - Email templates

Each ZIP file should contain:
- One HTML file with the email content
- PNG/JPG image files referenced in the HTML

### 3. Update Journey Configuration

Edit `website/scripts/journey-data.js` and add your program configuration:

```javascript
const JOURNEY_CONFIG = {
    // Existing programs...
    
    your_program: {
        name: 'Your Program Name',
        description: 'Program description',
        emails: [
            {
                id: 1,
                type: 'main',
                subject: 'Welcome Email Subject',
                description: 'Email description',
                htmlFile: 'template_1.html',
                timing: 'Day 0',
                triggers: {
                    opened: 2,
                    notOpened: '1a'
                }
            },
            // Add more emails...
        ],
        branches: {
            main: {
                name: 'Main Journey',
                description: 'Primary email sequence',
                color: '#3b82f6'
            },
            // Add more branches...
        }
    }
};
```

### 4. Process Templates

```bash
python scripts/process_templates.py your_program
```

### 5. Update Program Selector

Edit `website/index.html` to add your program to the dropdown:

```html
<select id="program-select">
    <option value="pm">Project Management</option>
    <option value="your_program">Your Program Name</option>
</select>
```

## Customization

### Email Content Modifications

The system automatically creates reminder variations by:

1. **Adding urgency banners** at the top of emails
2. **Modifying specific text phrases** to be more urgent
3. **Adding prefixes to CTAs** like "Don't Miss Out -" or "Last Chance -"
4. **Adding visual effects** like pulsing animations to buttons

Customize these modifications in `scripts/process_templates.py`:

```python
self.reminder_modifications = {
    "welcome": {
        "original": "Original text",
        "reminder": "Modified urgent text"
    },
    # Add more modifications...
}
```

### Journey Flow Logic

Modify the journey branching logic in `website/scripts/journey-data.js`:

```javascript
triggers: {
    opened: 2,        // Next email if opened
    notOpened: '1a'   // Reminder email if not opened
}
```

### Visual Styling

Customize the appearance by editing `website/assets/styles.css`. Key areas:

- **Color scheme**: Modify CSS custom properties at the top
- **Layout**: Adjust grid layouts and responsive breakpoints
- **Animations**: Customize transitions and hover effects
- **Typography**: Change fonts and sizing

### Simulation Behavior

Adjust simulation parameters in `website/scripts/journey-data.js`:

```javascript
const SIMULATION_CONFIG = {
    defaultSpeed: 5,
    behaviorProbabilities: {
        openEmail: 0.7,        // 70% chance to open
        clickAfterOpen: 0.4,   // 40% chance to click after opening
        delayedOpen: 0.2       // 20% chance to open with delay
    }
};
```

## Features in Detail

### Interactive Inbox

- **Email Status Indicators**: Visual icons show unread, opened, and clicked states
- **Email Metadata**: Shows timing, email type (main/reminder), and timestamps
- **Selection Highlighting**: Selected emails are highlighted for clear feedback
- **Realistic Ordering**: Most recent emails appear at the top

### Journey Simulation

- **Automatic Progression**: Emails are sent based on timing and trigger conditions
- **User Behavior Simulation**: Random opening/clicking behavior when auto-playing
- **Branch Tracking**: Real-time statistics of users in different journey paths
- **Timeline Logging**: Detailed log of all journey events with timestamps

### Email Preview

- **Full HTML Rendering**: Emails are displayed in an iframe with full styling
- **Interactive CTAs**: Clicking email buttons triggers journey actions
- **Action Buttons**: Manual controls to mark emails as opened/clicked
- **Responsive Display**: Email content adapts to different screen sizes

### Journey Visualization

- **Tree View**: Hierarchical display of the email sequence
- **Status Indicators**: Visual feedback on completed, active, and pending emails
- **Branch Highlighting**: Different colors for main journey vs. reminder paths
- **Real-time Updates**: Visualization updates as the journey progresses

## Keyboard Shortcuts

- **Spacebar**: Toggle auto-play on/off
- **R**: Reset the journey to start over
- **O**: Mark currently selected email as opened
- **C**: Mark currently selected email as clicked
- **Escape**: Close email preview

## Technical Notes

### Browser Compatibility

- **Modern browsers required**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **JavaScript ES6+ features**: Uses modern JavaScript syntax
- **CSS Grid and Flexbox**: Requires modern CSS layout support

### Performance Considerations

- **Email caching**: Processed emails are cached in memory for quick access
- **Image optimization**: Images are copied and can be optimized separately
- **Lazy loading**: Email content is loaded only when needed
- **Memory management**: Timeline and inbox have size limits to prevent memory issues

### Data Storage

- **No backend required**: All data is processed and stored client-side
- **JSON configuration**: Journey settings are stored in JSON format
- **File-based processing**: Email templates are processed into static files

## Troubleshooting

### Common Issues

1. **Templates not processing**
   - Check that ZIP files contain HTML and image files
   - Verify Python script has read permissions
   - Ensure ZIP files are not corrupted

2. **Images not displaying**
   - Check that image paths in HTML are relative
   - Verify images were copied to the processed_emails directory
   - Check browser console for 404 errors

3. **Journey not advancing**
   - Check JavaScript console for errors
   - Verify journey configuration syntax in journey-data.js
   - Ensure timing values are numeric

4. **Emails not opening**
   - Check that HTML content is valid
   - Verify iframe security restrictions
   - Check for JavaScript errors in email content

### Debug Mode

Enable debug logging by opening browser developer tools and setting:

```javascript
window.showcaseApp.debug = true;
```

This will provide detailed logging of journey events and email processing.

## Future Enhancements

### Planned Features

- **A/B Testing Simulation**: Compare different email variations
- **Advanced Analytics**: Detailed engagement metrics and heatmaps
- **Export Functionality**: Export journey reports and statistics
- **Template Editor**: In-browser email template editing
- **Multi-language Support**: Internationalization for different markets

### Extension Points

- **Custom Triggers**: Define complex branching logic beyond open/click
- **External Integrations**: Connect to real email platforms for data import
- **Advanced Scheduling**: More sophisticated timing and delay options
- **Personalization**: Dynamic content based on user segments

## Support

For questions or issues:

1. Check this documentation first
2. Review the browser console for error messages
3. Examine the journey configuration files
4. Test with the provided PM program example

## License

This project is designed for internal use in showcasing Zoho Campaigns workflows. Please ensure compliance with your organization's policies regarding email content and marketing materials.
