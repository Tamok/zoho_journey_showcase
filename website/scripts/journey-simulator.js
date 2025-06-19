// Journey simulator for managing email flow and user interactions
class JourneySimulator {    constructor() {
        this.currentProgram = 'pm';
        this.inbox = [];
        this.timeline = [];
        this.currentStep = 0;
        this.isPlaying = false;
        this.speed = 5;
        this.userActions = new Map(); // Track user actions on emails
        this.branches = new Map(); // Track branch counts
        this.simulationTimer = null;
        this.currentDay = 0; // Current day in simulation
        this.currentTime = 0; // Current time in simulation
        this.scheduledEmails = new Map(); // Track scheduled emails
        this.sentEmails = new Set(); // Track already sent emails
        this.userBehaviorMode = 'random'; // never_open, always_open, random
        this.originalTemplates = new Map(); // Cache for original templates
        
        this.initializeBranches();
        this.loadOriginalTemplates().then(() => {
            this.reset();
        });
    }/**
     * Initialize branch tracking
     */
    initializeBranches() {
        this.branches.set('main', 0);
        this.branches.set('reminder', 0);
        this.branches.set('conversion', 0);
        this.branches.set('cold_leads', 0);
    }    /**
     * Load original email templates from processed files
     */
    async loadOriginalTemplates() {
        try {
            const response = await fetch(`processed_emails/${this.currentProgram}/index.json`);
            if (!response.ok) {
                console.error(`Failed to load index.json for program ${this.currentProgram}`);
                return;
            }
            const index = await response.json();

            for (const emailId in index.emails) {
                const emailInfo = index.emails[emailId];
                const templateUrl = `processed_emails/${this.currentProgram}/${emailInfo.html_file}`;
                try {
                    const templateResponse = await fetch(templateUrl);
                    if (templateResponse.ok) {
                        const htmlContent = await templateResponse.text();
                        this.originalTemplates.set(emailId, htmlContent);
                        console.log(`Successfully loaded template for email ${emailId}`);
                    } else {
                        console.warn(`Template not found at ${templateUrl}, using fallback`);
                        this.originalTemplates.set(emailId, this.createFallbackTemplate(this.getEmailConfig(emailId)));
                    }
                } catch (error) {
                    console.warn(`Could not load template for email ${emailId}, using fallback:`, error);
                    this.originalTemplates.set(emailId, this.createFallbackTemplate(this.getEmailConfig(emailId)));
                }
            }
        } catch (error) {
            console.error('Error loading original templates:', error);
        }
    }

    /**
     * Create a fallback template when original is not available
     */
    createFallbackTemplate(emailConfig) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${emailConfig.subject}</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #f8f9fa; padding: 20px; text-align: center; }
                .content { padding: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${emailConfig.subject}</h1>
            </div>
            <div class="content">
                <p>${emailConfig.description}</p>
                <p>This is a fallback template for demonstration purposes.</p>
            </div>
        </body>
        </html>
        `;
    }    /**
     * Reset the journey simulation
     */
    reset() {
        this.stop();
        this.inbox = [];
        this.timeline = [];
        this.currentStep = 0;
        this.currentDay = 0;
        this.scheduledEmails.clear();
        this.sentEmails.clear();
        this.userActions.clear();
        this.initializeBranches();
        // Schedule the first email for day 1 (not day 0)
        this.scheduleEmail(1, 1);
        // Do NOT send emails immediately on reset
        this.updateUI();
        this.addTimelineEntry('Journey Reset', 'Journey started - Welcome email scheduled for Day 1');
    }

    /**
     * Start auto-play simulation
     */
    start() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.simulationTimer = setInterval(() => {
            this.advanceSimulation();
        }, this.getSimulationDelay());
        
        this.updatePlayButton();
        this.addTimelineEntry('Auto-Play Started', 'Simulation running automatically');
    }

    /**
     * Stop auto-play simulation
     */
    stop() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        if (this.simulationTimer) {
            clearInterval(this.simulationTimer);
            this.simulationTimer = null;
        }
        
        this.updatePlayButton();
        this.addTimelineEntry('Auto-Play Stopped', 'Manual control restored');
    }

    /**
     * Toggle auto-play state
     */
    toggleAutoPlay() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }

    /**
     * Set simulation speed
     */
    setSpeed(newSpeed) {
        this.speed = newSpeed;
        
        // Restart timer with new speed if playing
        if (this.isPlaying) {
            clearInterval(this.simulationTimer);
            this.simulationTimer = setInterval(() => {
                this.advanceSimulation();
            }, this.getSimulationDelay());
        }
        
        this.updateSpeedDisplay();
    }

    /**
     * Get simulation delay based on current speed
     */
    getSimulationDelay() {
        const baseDelay = SIMULATION_CONFIG.autoAdvanceDelay;
        const multiplier = SIMULATION_CONFIG.speedMultipliers[this.speed] || 0.2;
        return baseDelay * multiplier;
    }    /**
     * Advance the simulation by one step (one day)
     */
    advanceSimulation() {
        this.currentDay++;
        // Send scheduled emails for today
        this.sendScheduledEmails();

        // Process each email in the inbox that hasn't been processed
        for (const email of this.inbox) {
            if (email.processed) continue;
            const emailConfig = this.getEmailConfig(email.number);
            if (!emailConfig) continue;
            const action = this.userActions.get(email.id);

            // Main email logic
            if (emailConfig.type === 'main') {
                if (action?.opened || action?.clicked) {
                    // Schedule next main email after 30 days
                    const nextMain = this.getNextMainEmail(emailConfig.id);
                    if (nextMain) {
                        this.scheduleEmail(nextMain.id, this.currentDay + 30);
                    }
                    email.processed = true;                } else if (this.currentDay - email.day >= 30) {
                    // Not opened after 30 days, schedule first reminder immediately
                    const reminder = this.getReminderEmail(emailConfig.id);
                    if (reminder) {
                        this.scheduleEmail(reminder.id, this.currentDay);
                    } else {
                        // No reminder, exit
                        this.addTimelineEntry('Journey Exit', `User exited journey after Email ${emailConfig.id}`);
                    }
                    email.processed = true;
                }
            }
            // Reminder logic
            else if (emailConfig.type === 'reminder') {
                if (action?.opened || action?.clicked) {
                    // If reminder opened, schedule next main after 30 days
                    const nextMain = this.getNextMainEmail(parseInt(emailConfig.id));
                    if (nextMain) {
                        this.scheduleEmail(nextMain.id, this.currentDay + 30);
                    }
                    email.processed = true;
                } else if (this.currentDay - email.day >= this.getReminderWaitTime(emailConfig.id)) {
                    // Not opened after wait time, schedule next reminder or exit
                    const nextReminder = this.getNextReminderEmail(emailConfig.id);
                    if (nextReminder) {
                        this.scheduleEmail(nextReminder.id, this.currentDay);
                    } else {
                        // No more reminders, exit to nurture/cold leads
                        this.addTimelineEntry('Journey Exit', `User exited to nurture/cold leads after Reminder ${emailConfig.id}`);
                    }
                    email.processed = true;
                }
            }
        }
        this.updateUI();
    }

    /**
     * Get the next main email config after the given id
     */
    getNextMainEmail(currentId) {
        const config = JOURNEY_CONFIG[this.currentProgram];
        const idx = config.emails.findIndex(e => e.id === currentId && e.type === 'main');
        if (idx >= 0 && idx + 1 < config.emails.length) {
            // Find next main email
            for (let i = idx + 1; i < config.emails.length; i++) {
                if (config.emails[i].type === 'main') return config.emails[i];
            }
        }
        return null;
    }

    /**
     * Get the reminder email config for a main email id
     */
    getReminderEmail(mainId) {
        const config = JOURNEY_CONFIG[this.currentProgram];
        return config.emails.find(e => e.id === `${mainId}a` && e.type === 'reminder');
    }

    /**
     * Get the index of the reminder (1st, 2nd, etc.)
     */
    getReminderIndex(reminderId) {
        // e.g., '2a', '2b', ...
        if (typeof reminderId === 'string' && reminderId.length > 1) {
            const letter = reminderId.slice(1);
            return letter.charCodeAt(0) - 'a'.charCodeAt(0);
        }
        return 0;
    }

    /**
     * Get the next reminder email config after the given reminder id
     */
    getNextReminderEmail(reminderId) {
        if (typeof reminderId !== 'string' || reminderId.length < 2) return null;
        const mainId = parseInt(reminderId);
        const nextLetter = String.fromCharCode(reminderId.charCodeAt(1) + 1);
        const nextId = `${mainId}${nextLetter}`;
        const config = JOURNEY_CONFIG[this.currentProgram];
        return config.emails.find(e => e.id === nextId && e.type === 'reminder');
    }

    /**
     * Load flow configuration for a program (compatibility method)
     */
    async loadFlowConfig(programType) {
        this.currentProgram = programType;
        await this.loadOriginalTemplates();
        this.reset();
        console.log(`Loaded flow config for ${programType} program`);
    }

    /**
     * Switch to a different program
     */
    async switchProgram(programType) {
        this.currentProgram = programType;
        await this.loadOriginalTemplates();
        this.reset();
        console.log(`Switched to ${programType} program`);
    }

    /**
     * Schedule an email to be sent on a specific day
     */
    scheduleEmail(emailId, day) {
        console.log('[scheduleEmail] Scheduling email', emailId, 'for day', day);
        if (this.sentEmails.has(emailId)) return; // Don't schedule if already sent
        if (!this.scheduledEmails.has(day)) {
            this.scheduledEmails.set(day, []);
        }
        this.scheduledEmails.get(day).push(emailId);
        this.addTimelineEntry('Email Scheduled', `Email ${emailId} scheduled for Day ${day}`);
        console.log('[scheduleEmail] scheduledEmails map:', this.scheduledEmails);
    }

    /**
     * Send all scheduled emails for the current day
     */
    sendScheduledEmails() {
        // Check for both string and number keys for currentDay
        let todaysEmails = this.scheduledEmails.get(this.currentDay);
        if (!todaysEmails && this.scheduledEmails.has(this.currentDay.toString())) {
            todaysEmails = this.scheduledEmails.get(this.currentDay.toString());
        }
        console.log('[sendScheduledEmails] Current day:', this.currentDay, 'scheduledEmails:', this.scheduledEmails);
        if (!todaysEmails) return;
        for (const emailId of todaysEmails) {
            if (this.sentEmails.has(emailId)) continue; // Skip if already sent
            this.sendEmail(emailId);
            this.sentEmails.add(emailId);
        }
        // Clear today's scheduled emails
        this.scheduledEmails.delete(this.currentDay);
        this.scheduledEmails.delete(this.currentDay.toString());
    }

    /**
     * Send an email immediately
     */
    sendEmail(emailId) {
        console.log('[sendEmail] Sending email', emailId, 'on day', this.currentDay);
        const emailConfig = this.getEmailConfig(emailId);
        if (!emailConfig) {
            console.warn(`[sendEmail] No email config found for emailId: ${emailId}`);
            return;
        }
        const email = {
            id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            number: emailId,
            day: this.currentDay,
            status: 'unread',
            processed: false
        };
        this.inbox.unshift(email); // Add to beginning of inbox
        this.addTimelineEntry('Email Sent', `${emailConfig.subject} sent on Day ${this.currentDay}`);
        // Auto-simulate user behavior if in autoplay mode
        if (this.isPlaying) {
            this.simulateUserBehavior(email.id, emailConfig);
        }
    }

    /**
     * Simulate user behavior based on current mode
     */
    simulateUserBehavior(emailId, emailConfig) {
        setTimeout(() => {
            const behavior = this.getUserBehavior();
            if (behavior.open) {
                this.markEmailAsOpened(emailId);
                if (behavior.click) {
                    setTimeout(() => {
                        this.markEmailAsClicked(emailId);
                    }, 1000 + Math.random() * 2000);
                }
            }
        }, 500 + Math.random() * 3000);
    }

    /**
     * Get user behavior based on current mode
     */
    getUserBehavior() {
        switch (this.userBehaviorMode) {
            case 'never_open':
                return { open: false, click: false };
            case 'always_open':
                return { open: true, click: Math.random() < 0.6 };
            case 'random':
            default:
                const openChance = SIMULATION_CONFIG.behaviorProbabilities.openEmail / 100;
                const clickChance = SIMULATION_CONFIG.behaviorProbabilities.clickAfterOpen / 100;
                const opens = Math.random() < openChance;
                return {
                    open: opens,
                    click: opens && Math.random() < clickChance
                };
        }
    }    /**
     * Mark email as opened
     */
    markEmailAsOpened(emailId) {
        this.userActions.set(emailId, {
            ...this.userActions.get(emailId),
            opened: true,
            openedAt: this.currentDay
        });
        this.updateBranchStats('opened');
        this.addTimelineEntry('Email Opened', `Email opened on Day ${this.currentDay}`);
        this.updateUI();
    }

    /**
     * Mark email as clicked
     */
    markEmailAsClicked(emailId) {
        this.userActions.set(emailId, {
            ...this.userActions.get(emailId),
            opened: true,
            clicked: true,
            clickedAt: this.currentDay
        });
        this.updateBranchStats('clicked');
        this.addTimelineEntry('Email Clicked', `Email clicked on Day ${this.currentDay}`);
        this.updateUI();
    }    /**
     * Get email by ID (for preview/new tab)
     */
    getEmail(emailId) {
        const inboxEmail = this.inbox.find(e => e.id === emailId);
        if (!inboxEmail) return null;
        const emailConfig = this.getEmailConfig(inboxEmail.number);
        if (!emailConfig) return null;
        
        // Convert number to string for template lookup (index.json uses string keys)
        const templateKey = String(inboxEmail.number);
        
        // Use loaded template if available, otherwise fallback
        const htmlContent = this.originalTemplates.get(templateKey) || this.createFallbackTemplate(emailConfig);
        
        return {
            ...inboxEmail,
            subject: emailConfig.subject,
            type: emailConfig.type,
            timing: `Day ${inboxEmail.day}`,
            status: this.userActions.get(emailId)?.clicked ? 'clicked' :
                    this.userActions.get(emailId)?.opened ? 'opened' : 'unread',
            htmlContent: htmlContent
        };
    }

    /**
     * Update branch statistics
     */
    updateBranchStats(action) {
        if (action === 'opened') {
            this.branches.set('main', this.branches.get('main') + 1);
        } else if (action === 'clicked') {
            this.branches.set('conversion', this.branches.get('conversion') + 1);
        }
        this.updateBottomBar();
    }

    /**
     * Add an entry to the timeline
     */
    addTimelineEntry(title, description) {
        this.timeline.unshift({
            day: this.currentDay,
            title: title,
            description: description,
        });
        if (this.timeline.length > 100) { // Limit timeline entries
            this.timeline.pop();
        }
        this.updateTimeline();
    }

    /**
     * Update all UI components
     */
    updateUI() {
        this.updateInbox();
        this.updateTimeline();
        this.updateDayCounter();
        this.updateBottomBar();
        this.updatePlayButton();
        if (window.showcaseApp) {
            window.showcaseApp.journeyVisualizer.updateState(this.inbox, this.userActions);
        }
    }    /**
     * Update the inbox display
     */
    updateInbox() {
        const inboxList = document.getElementById('inbox-list');
        if (!inboxList) return;

        inboxList.innerHTML = '';
        this.inbox.forEach(email => {
            const emailConfig = this.getEmailConfig(email.number);
            if (!emailConfig) return;

            const action = this.userActions.get(email.id) || {};
            let status = 'unread';
            let statusText = 'unread';
            
            if (action.clicked) {
                status = 'clicked';
                statusText = `clicked (Day ${action.clickedAt})`;
            } else if (action.opened) {
                status = 'opened';
                statusText = `opened (Day ${action.openedAt})`;
            }

            const item = document.createElement('div');
            item.className = `email-item ${status}`
            item.dataset.emailId = email.id;
            item.innerHTML = `
                <div class="email-icon"><i class="fas fa-envelope${status === 'opened' || status === 'clicked' ? '-open' : ''}"></i></div>
                <div class="email-details">
                    <div class="email-subject">${emailConfig.subject}</div>
                    <div class="email-meta">Day ${email.day} | ${emailConfig.type}</div>
                </div>
                <div class="email-status">${statusText}</div>
            `;
            item.addEventListener('click', () => this.previewEmail(email.id));
            inboxList.appendChild(item);
        });

        // Update stats
        const total = this.inbox.length;
        const opened = Array.from(this.userActions.values()).filter(a => a.opened).length;
        const clicked = Array.from(this.userActions.values()).filter(a => a.clicked).length;

        document.getElementById('total-emails').textContent = total;
        document.getElementById('opened-emails').textContent = opened;
        document.getElementById('clicked-emails').textContent = clicked;
    }

    /**
     * Update the timeline display
     */
    updateTimeline() {
        const timelineContainer = document.getElementById('timeline-container');
        if (!timelineContainer) return;

        timelineContainer.innerHTML = '';
        this.timeline.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <div class="timeline-icon"><i class="fas fa-clock"></i></div>
                <div class="timeline-content">
                    <div class="timeline-title">${entry.title}</div>
                    <div class="timeline-description">Day ${entry.day}: ${entry.description}</div>
                </div>
            `;
            timelineContainer.appendChild(item);
        });
    }

    /**
     * Update the day counter display
     */
    updateDayCounter() {
        const dayNumber = document.getElementById('day-number');
        if (dayNumber) {
            dayNumber.textContent = this.currentDay;
        }
    }

    /**
     * Update the bottom bar with branch stats
     */
    updateBottomBar() {
        const bottomBar = document.getElementById('bottom-bar');
        if (!bottomBar) return;

        const total = Array.from(this.branches.values()).reduce((sum, count) => sum + count, 0);
        
        let html = '<h5>Journey Branching</h5>';
        for (const [name, count] of this.branches.entries()) {
            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            html += `
                <div class="branch-stat">
                    <span class="branch-name">${name.replace('_', ' ')}</span>
                    <div class="branch-bar">
                        <div class="branch-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="branch-value">${percentage}% (${count})</span>
                </div>
            `;
        }
        bottomBar.innerHTML = html;
    }

    /**
     * Update the play/pause button icon and text
     */
    updatePlayButton() {
        const autoPlayButton = document.getElementById('auto-play');
        if (autoPlayButton) {
            if (this.isPlaying) {
                autoPlayButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
                autoPlayButton.classList.add('playing');
            } else {
                autoPlayButton.innerHTML = '<i class="fas fa-play"></i> Auto Play';
                autoPlayButton.classList.remove('playing');
            }
        }
    }    /**
     * Update the speed display
     */
    updateSpeedDisplay() {
        const speedDisplay = document.getElementById('speed-display');
        if(speedDisplay) {
            // Calculate actual speed: 1 + (speed-1) * 0.5 days per second
            const actualSpeed = 1 + (this.speed - 1) * 0.5;
            speedDisplay.textContent = `${actualSpeed}x`;
        }
    }

    /**
     * Preview an email - delegates to the main app
     */
    previewEmail(emailId) {
        if (window.showcaseApp) {
            window.showcaseApp.previewEmail(emailId);
        } else {
            console.error('showcaseApp not found, cannot preview email.');
        }
    }

    /**
     * Get email configuration by ID
     */
    getEmailConfig(emailId) {
        const config = JOURNEY_CONFIG[this.currentProgram];
        return config.emails.find(e => e.id == emailId);
    }    toggleEmailStatus(emailId, status) {
        const userAction = this.userActions.get(emailId) || {};
        const newStatus = !userAction[status];

        if (status === 'clicked' && newStatus) {
            // If marking as clicked, also mark as opened
            userAction.opened = true;
            userAction.openedAt = this.currentDay;
            userAction.clickedAt = this.currentDay;
        } else if (status === 'opened' && newStatus) {
            userAction.openedAt = this.currentDay;
        }
        
        userAction[status] = newStatus;

        this.userActions.set(emailId, userAction);
        this.updateUI();

        const actionText = newStatus ? status : `un-${status}`;
        this.addTimelineEntry(`Email ${actionText}`, `Email marked as ${actionText} on Day ${this.currentDay}`);
    }/**
     * Set user behavior mode
     */
    setUserBehaviorMode(mode) {
        this.userBehaviorMode = mode;
        this.addTimelineEntry('Behavior Mode Changed', `User behavior set to: ${mode}`);
    }    /**
     * Get reminder delay based on email ID (follows flow.md specification)
     * This is NOT used for scheduling first reminders (they're sent immediately)
     * This is used for determining when to give up on reminder emails
     */
    getReminderDelay(emailId) {
        // For all emails: if reminder not opened after 30 days, move to next step
        return 30;
    }

    /**
     * Get how long to wait before considering a reminder email abandoned
     */
    getReminderWaitTime(reminderId) {
        // All reminders: wait 30 days before giving up
        return 30;
    }
}