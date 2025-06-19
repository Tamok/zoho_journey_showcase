// Email variations configuration
const EMAIL_VARIATIONS = {
    subject_prefixes: {
        reminder: [
            "Reminder: ",
            "Don't Miss: ",
            "Last Chance: ",
            "Final Notice: ",
            "⏰ ",
            "🔔 "
        ],
        urgent: [
            "URGENT: ",
            "TIME-SENSITIVE: ",
            "ACTION REQUIRED: ",
            "FINAL HOURS: "
        ],
        followup: [
            "Follow-up: ",
            "Quick Follow-up: ",
            "Checking in: "
        ]
    },
    content_modifications: {
        reminder: {
            "Learn More": "Don't Miss Out - Learn More",
            "Enroll Now": "Last Chance - Enroll Now", 
            "Get Started": "Act Now - Get Started",
            "Sign Up": "Join Today - Sign Up"
        },
        urgent: {
            "Learn More": "URGENT - Learn More",
            "Enroll Now": "DEADLINE APPROACHING - Enroll Now",
            "Get Started": "FINAL HOURS - Get Started"
        }
    }
};

// Email processor for handling email templates and creating variations
class EmailProcessor {
    constructor() {
        this.emailCache = new Map();
        this.imageCache = new Map();
    }

    /**
     * Process ZIP file containing email template
     * @param {string} programType - Type of program (pm, hrm, etc.)
     * @param {number} emailNumber - Email number (1-9)
     * @param {string} zipFilePath - Path to the ZIP file
     */    async processEmailTemplate(programType, emailNumber, zipFilePath) {
        try {
            console.log(`Processing email template: ${programType}_${emailNumber}`);
            
            const emailId = `${programType}_${emailNumber}`;
            
            // Store basic email data without loading content yet
            const emailData = {
                id: emailId,
                htmlContent: null, // Load on demand
                images: [], // Images are already embedded in the HTML with correct paths
                metadata: {
                    program: programType,
                    emailNumber: emailNumber,
                    subject: this.generateSubject(programType, emailNumber),
                    timing: this.calculateTiming(emailNumber)
                }
            };

            this.emailCache.set(emailId, emailData);
            return emailData;

        } catch (error) {
            console.error('Error processing email template:', error);
            throw error;
        }
    }

    /**
     * Create reminder variation of an email
     * @param {string} originalEmailId - ID of the original email
     * @param {string} variationType - Type of variation (reminder, urgent, etc.)
     */    async createEmailVariation(originalEmailId, variationType = 'reminder') {
        const originalEmail = this.emailCache.get(originalEmailId);
        if (!originalEmail) {
            throw new Error(`Original email not found: ${originalEmailId}`);
        }        const variationId = `${originalEmailId}_${variationType}`;
        
        // Store basic variation data without loading content yet  
        const variationEmail = {
            ...originalEmail,
            id: variationId,
            htmlContent: null, // Load on demand
            metadata: {
                ...originalEmail.metadata,
                subject: this.modifySubject(originalEmail.metadata.subject, variationType),
                isVariation: true,
                originalId: originalEmailId,
                variationType: variationType
            }
        };

        this.emailCache.set(variationId, variationEmail);
        return variationEmail;
    }

    /**
     * Generate mock email content for demonstration
     */
    async generateMockEmailContent(programType, emailNumber) {
        const config = JOURNEY_CONFIG[programType];
        const emailConfig = config.emails.find(e => e.id === emailNumber);
        
        if (!emailConfig) {
            throw new Error(`Email configuration not found for ${programType} email ${emailNumber}`);
        }

        // Generate mock HTML content based on email type and program
        return this.createEmailHTML(emailConfig, config);
    }

    /**
     * Create HTML content for email
     */
    createEmailHTML(emailConfig, programConfig) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${emailConfig.subject}</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .email-container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
        }
        .logo {
            width: 120px;
            height: 100px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 10px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
        }
        .main-content {
            margin-bottom: 30px;
        }
        .cta-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
        }
        .cta-button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 10px;
            transition: transform 0.3s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .feature {
            text-align: center;
            padding: 20px;
            background: #f7fafc;
            border-radius: 8px;
        }
        .feature-icon {
            width: 60px;
            height: 60px;
            background: #667eea;
            border-radius: 50%;
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
        }
        h1 {
            color: #4a5568;
            font-size: 28px;
            margin-bottom: 15px;
        }
        h2 {
            color: #4a5568;
            font-size: 24px;
            margin: 25px 0 15px;
        }
        h3 {
            color: #4a5568;
            font-size: 20px;
            margin: 20px 0 10px;
        }
        p {
            margin-bottom: 15px;
        }
        .highlight {
            background: #fef3cd;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
        }
        ${emailConfig.type === 'reminder' ? this.getReminderStyles() : ''}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">PM</div>
            <h1>${emailConfig.subject}</h1>
            ${emailConfig.type === 'reminder' ? '<div class="reminder-badge">⏰ Reminder</div>' : ''}
        </div>

        <div class="main-content">
            ${this.getEmailContent(emailConfig, programConfig)}
        </div>

        <div class="cta-section">
            <h3>Ready to Transform Your Career?</h3>
            <a href="#" class="cta-button" onclick="handleEmailClick('${emailConfig.id}')">
                ${emailConfig.type === 'reminder' ? 'Don\'t Miss Out - ' : ''}Learn More
            </a>
            <a href="#" class="cta-button" onclick="handleEmailClick('${emailConfig.id}')">
                ${emailConfig.type === 'reminder' ? 'Last Chance - ' : ''}Enroll Now
            </a>
        </div>

        <div class="footer">
            <div class="social-links">
                <a href="#">📧 Email</a>
                <a href="#">🐦 Twitter</a>
                <a href="#">💼 LinkedIn</a>
                <a href="#">📘 Facebook</a>
            </div>
            <p>© 2024 ${programConfig.name} Program. All rights reserved.</p>
            <p style="font-size: 12px;">
                This is a simulated email for demonstration purposes.
                <br>Journey Step: ${emailConfig.timing} | Email Type: ${emailConfig.type}
            </p>
        </div>
    </div>

    <script>
        function handleEmailClick(emailId) {
            // Communicate with parent window
            if (window.parent && window.parent.handleEmailAction) {
                window.parent.handleEmailAction('click', emailId);
            }
            return false; // Prevent default link behavior
        }
    </script>
</body>
</html>`;
    }

    /**
     * Generate email content based on email configuration
     */
    getEmailContent(emailConfig, programConfig) {
        const reminderPrefix = emailConfig.type === 'reminder' ? 
            this.getReminderPrefix(emailConfig.id) : '';

        switch (emailConfig.id.toString().replace('a', '')) {
            case '1':
                return `
                    <p>Welcome to the ${programConfig.name} Certification Program!</p>
                    ${reminderPrefix}
                    <p>Gain the skills and tools you need to plan effectively, lead cross-functional teams, and deliver projects on time and on budget.</p>
                    
                    <div class="features">
                        <div class="feature">
                            <div class="feature-icon">🎯</div>
                            <h3>Strategic Planning</h3>
                            <p>Master project planning and resource allocation</p>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">👥</div>
                            <h3>Team Leadership</h3>
                            <p>Develop essential leadership and communication skills</p>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">📊</div>
                            <h3>Performance Tracking</h3>
                            <p>Learn to monitor and optimize project performance</p>
                        </div>
                    </div>
                    
                    <p>Join thousands of professionals who have transformed their careers with our comprehensive program.</p>`;

            case '2':
                return `
                    <h2>Program Highlights & Features</h2>
                    ${reminderPrefix}
                    <p>Discover what makes our ${programConfig.name} program unique and effective:</p>
                    
                    <div class="highlight">
                        <h3>🌟 Industry-Leading Curriculum</h3>
                        <p>Developed by leading project management experts and updated with the latest industry trends.</p>
                    </div>
                    
                    <ul style="line-height: 2;">
                        <li>✅ Comprehensive project lifecycle management</li>
                        <li>✅ Advanced risk management strategies</li>
                        <li>✅ Agile and Scrum methodologies</li>
                        <li>✅ Budget and resource optimization</li>
                        <li>✅ Stakeholder communication best practices</li>
                    </ul>
                    
                    <p>Our program is designed for working professionals and can be completed while maintaining your current career.</p>`;

            case '3':
                return `
                    <h2>Program Structure & Curriculum</h2>
                    ${reminderPrefix}
                    <p>Deep dive into our comprehensive curriculum designed for career advancement:</p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">
                        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px;">
                            <h3>📚 Module 1-3</h3>
                            <p>Fundamentals & Planning</p>
                            <small>Duration: 4 weeks</small>
                        </div>
                        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px;">
                            <h3>⚡ Module 4-6</h3>
                            <p>Execution & Monitoring</p>
                            <small>Duration: 4 weeks</small>
                        </div>
                    </div>
                    
                    <p>Each module includes hands-on projects, real-world case studies, and peer collaboration opportunities.</p>`;

            case '4':
                return `
                    <h2>Industry Insights & Trends</h2>
                    ${reminderPrefix}
                    <p>Stay ahead with current industry knowledge and emerging trends in project management:</p>
                    
                    <div class="highlight">
                        <h3>📈 Market Outlook</h3>
                        <p>The project management profession is experiencing unprecedented growth, with millions of new positions expected by 2027.</p>
                    </div>
                    
                    <h3>Trending Skills in 2024:</h3>
                    <ul>
                        <li>🔄 Hybrid project methodologies</li>
                        <li>🤖 AI-powered project tools</li>
                        <li>🌍 Remote team management</li>
                        <li>📊 Data-driven decision making</li>
                        <li>🔒 Cybersecurity in project environments</li>
                    </ul>
                    
                    <p>Our curriculum is continuously updated to reflect these emerging trends and prepare you for the future of work.</p>`;

            case '5':
                return `
                    <h2>Career Opportunities & Growth</h2>
                    ${reminderPrefix}
                    <p>Explore your career advancement potential with our ${programConfig.name} certification:</p>
                    
                    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 20px 0;">
                        <h3>💰 Salary Potential</h3>
                        <p>Certified project managers earn 25% more on average than their non-certified peers.</p>
                        <p><strong>Average Salary Range: $85,000 - $135,000+</strong></p>
                    </div>
                    
                    <h3>🚀 Career Paths:</h3>
                    <ul>
                        <li>Senior Project Manager</li>
                        <li>Program Director</li>
                        <li>PMO Manager</li>
                        <li>Portfolio Manager</li>
                        <li>Agile Coach</li>
                        <li>Consulting Roles</li>
                    </ul>
                    
                    <p>Strong job outlook and earning potential. <a href="#" style="color: #667eea;">Statistics here</a>.</p>`;

            case '6':
                return `
                    <h2>Student Success & Testimonials</h2>
                    ${reminderPrefix}
                    <p>Real stories from successful graduates who transformed their careers:</p>
                    
                    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
                        <p><em>"This program completely changed my career trajectory. I went from struggling with project deadlines to leading a team of 15 project managers."</em></p>
                        <p><strong>- Sarah M., Senior PM at Tech Fortune 500</strong></p>
                    </div>
                    
                    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                        <p><em>"The practical skills I learned immediately improved my project success rate by 40%. The ROI was immediate."</em></p>
                        <p><strong>- Michael R., IT Project Manager</strong></p>
                    </div>
                    
                    <p><strong>98% of our graduates</strong> report career advancement within 12 months of completion.</p>`;

            case '7':
                return `
                    <h2>🎉 Exclusive Offer or Promotion</h2>
                    ${reminderPrefix}
                    <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 30px; border-radius: 15px; text-align: center; margin: 25px 0;">
                        <h3 style="color: #92400e; font-size: 24px; margin-bottom: 15px;">
                            ${emailConfig.type === 'reminder' ? '⏰ FINAL HOURS!' : '⭐ LIMITED TIME OFFER!'}
                        </h3>
                        <p style="font-size: 20px; font-weight: bold; color: #92400e;">
                            Save $500 on your enrollment
                        </p>
                        <p style="color: #92400e;">
                            ${emailConfig.type === 'reminder' ? 'Last chance to secure this exclusive discount!' : 'Special pricing just for you!'}
                        </p>
                    </div>
                    
                    <p>This exclusive offer includes:</p>
                    <ul>
                        <li>✅ Full program access</li>
                        <li>✅ 1-on-1 career coaching session</li>
                        <li>✅ Lifetime access to materials</li>
                        <li>✅ Alumni network membership</li>
                    </ul>
                    
                    <p><strong>Offer expires in ${emailConfig.type === 'reminder' ? '24 hours' : '7 days'}!</strong></p>`;

            case '8':
                return `
                    <h2>Program Updates & Benefits</h2>
                    ${reminderPrefix}
                    <p>Latest program enhancements and benefits you shouldn't miss:</p>
                    
                    <div class="highlight">
                        <h3>🆕 New Features Added:</h3>
                        <ul>
                            <li>Virtual Reality project simulations</li>
                            <li>AI-powered project risk assessment tools</li>
                            <li>Extended mentorship program</li>
                            <li>Industry partnership program</li>
                        </ul>
                    </div>
                    
                    <h3>📅 Upcoming Cohorts:</h3>
                    <p>Next start dates: March 15, April 12, May 10</p>
                    <p>Class sizes are limited to ensure personalized attention.</p>
                    
                    <p>Don't miss out on these enhanced features - enrollment is filling up quickly!</p>`;

            case '9':
                return `
                    <h2>${emailConfig.type === 'reminder' ? '🚨 LAST CALL' : '⏰ Final Opportunity'}</h2>
                    ${reminderPrefix}
                    <div style="background: #fee2e2; padding: 25px; border-radius: 8px; border: 2px solid #ef4444; margin: 20px 0;">
                        <h3 style="color: #dc2626;">
                            ${emailConfig.type === 'reminder' ? 'This is your final reminder!' : 'Final chance to transform your career'}
                        </h3>
                        <p style="color: #dc2626;">
                            ${emailConfig.type === 'reminder' ? 
                                'Don\'t let this opportunity slip away forever.' : 
                                'Your final opportunity to join our next cohort.'}
                        </p>
                    </div>
                    
                    <p>Here's what you'll miss if you don't act now:</p>
                    <ul>
                        <li>❌ Career advancement opportunities</li>
                        <li>❌ Salary increase potential</li>
                        <li>❌ Professional network expansion</li>
                        <li>❌ Industry-recognized certification</li>
                        <li>❌ Job security and growth</li>
                    </ul>
                    
                    <p><strong>Enrollment closes in ${emailConfig.type === 'reminder' ? '12 hours' : '3 days'}.</strong></p>
                    <p>Next cohort won't start for another 6 months.</p>`;

            default:
                return `
                    <p>Thank you for your interest in our ${programConfig.name} program.</p>
                    ${reminderPrefix}
                    <p>This email contains important information about your journey with us.</p>`;
        }
    }

    /**
     * Get reminder prefix for reminder emails
     */
    getReminderPrefix(emailId) {
        const reminderMessages = [
            '<div class="highlight"><strong>⏰ Reminder:</strong> You haven\'t opened our previous email yet. Don\'t miss out on this important information!</div>',
            '<div class="highlight"><strong>🔔 Second Notice:</strong> We noticed you might have missed our last message. Here\'s another chance!</div>',
            '<div class="highlight"><strong>⚠️ Final Notice:</strong> This is your last reminder about this opportunity.</div>'
        ];
        
        return reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
    }

    /**
     * Get additional CSS for reminder emails
     */
    getReminderStyles() {
        return `
            .reminder-badge {
                background: #f59e0b;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: bold;
                display: inline-block;
                margin-top: 10px;
            }
            .cta-button {
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
        `;
    }

    /**
     * Extract images from ZIP file (simulated)
     */
    async extractImages(zipFilePath) {
        // Simulate image extraction
        return [
            'logo.png',
            'feature1.jpg',
            'feature2.jpg',
            'testimonial.jpg'
        ];
    }

    /**
     * Generate subject line based on email configuration
     */
    generateSubject(programType, emailNumber) {
        const config = JOURNEY_CONFIG[programType];
        const emailConfig = config.emails.find(e => e.id === emailNumber);
        return emailConfig ? emailConfig.subject : `Email ${emailNumber}`;
    }

    /**
     * Modify subject line for variations
     */
    modifySubject(originalSubject, variationType) {
        const prefixes = EMAIL_VARIATIONS.subject_prefixes[variationType] || ['Reminder: '];
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        return `${randomPrefix}${originalSubject}`;
    }

    /**
     * Calculate timing for email
     */
    calculateTiming(emailNumber) {
        const timings = {
            1: 'Day 0',
            '1a': 'Day 7',
            2: 'Day 14',
            '2a': 'Day 21',
            3: 'Day 30',
            '3a': 'Day 37',
            4: 'Day 45',
            '4a': 'Day 52',
            5: 'Day 60',
            '5a': 'Day 67',
            6: 'Day 75',
            '6a': 'Day 82',
            7: 'Day 90',
            '7a': 'Day 97',
            8: 'Day 105',
            '8a': 'Day 112',
            9: 'Day 120',
            '9a': 'Day 127'
        };
        return timings[emailNumber] || 'TBD';
    }

    /**
     * Modify email content for variations
     */
    modifyEmailContent(originalContent, variationType) {
        if (variationType === 'reminder') {
            // Add urgency and reminder text
            const urgencyPhrases = [
                'Don\'t miss out!',
                'Last chance!',
                'Time is running out!',
                'Final opportunity!',
                'Still time to join!'
            ];
            
            const randomPhrase = urgencyPhrases[Math.floor(Math.random() * urgencyPhrases.length)];
            
            // Insert reminder text at the beginning of content
            return originalContent.replace(
                '<div class="main-content">',
                `<div class="main-content">
                <div class="highlight" style="background: #fef3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                    <strong>⏰ Reminder:</strong> ${randomPhrase} We noticed you haven't responded to our previous email.
                </div>`
            );
        } else if (variationType === 'urgent') {
            // Modify content for urgent emails
            const modifications = EMAIL_VARIATIONS.content_modifications.urgent;
            for (const [key, value] of Object.entries(modifications)) {
                originalContent = originalContent.replace(new RegExp(key, 'g'), value);
            }
        }
        
        return originalContent;
    }    /**
     * Load processed HTML template from file
     */
    async loadProcessedTemplate(programType, emailNumber) {
        try {
            const templatePath = `processed_emails/${programType}/emails/template_${emailNumber}.html`;
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${templatePath}`);
            }
            return await response.text();
        } catch (error) {
            console.warn(`Could not load processed template for ${programType}_${emailNumber}, using mock content`);
            return await this.generateMockEmailContent(programType, emailNumber);
        }
    }

    /**
     * Get email by ID
     */
    getEmail(emailId) {
        return this.emailCache.get(emailId);
    }

    /**
     * Get all emails for a program
     */
    getEmailsForProgram(programType) {
        const emails = [];
        for (const [id, email] of this.emailCache) {
            if (email.metadata.program === programType) {
                emails.push(email);
            }
        }
        return emails;
    }
}

// Global instance
const emailProcessor = new EmailProcessor();
