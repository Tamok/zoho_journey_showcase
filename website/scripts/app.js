// Main application script
class ZohoCampaignsShowcase {
    constructor() {
        this.initialized = false;
        this.currentEmailId = null;
        
        // Initialize components
        this.emailProcessor = new EmailProcessor();
        this.journeySimulator = new JourneySimulator();
        this.journeyVisualizer = new JourneyVisualizer('journey-tree');
        
        // Make them globally available for compatibility with existing code
        window.emailProcessor = this.emailProcessor;
        window.journeySimulator = this.journeySimulator;
    }

    /**
     * Initialize the application
     */    async init() {
        if (this.initialized) return;        try {
            // Initialize components
            await this.initializeEmailProcessor();
            this.setupEventListeners();
            
            // Load flow config for initial program (this will call reset after templates are loaded)
            await this.journeySimulator.loadFlowConfig('pm');
            this.journeyVisualizer.render('pm');
            
            this.initializeUI();
            
            this.initialized = true;
            console.log('Zoho Campaigns Showcase initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }/**
     * Initialize email processor with mock data
     */    async initializeEmailProcessor() {
        const pmConfig = JOURNEY_CONFIG.pm;
        
        // Generate mock emails for PM program - only process main emails (numeric IDs)
        for (const emailConfig of pmConfig.emails) {
            // Only process main emails, skip reminder variations (they already exist)
            if (emailConfig.type === 'main' && typeof emailConfig.id === 'number') {
                try {
                    await this.emailProcessor.processEmailTemplate('pm', emailConfig.id, '');
                    
                    // Create reminder variation
                    await this.emailProcessor.createEmailVariation(`pm_${emailConfig.id}`, 'reminder');
                } catch (error) {
                    console.warn(`Failed to process email ${emailConfig.id}:`, error);
                }
            }
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {        // Program selector
        const programSelect = document.getElementById('program-select');
        if (programSelect) {
            programSelect.addEventListener('change', async (e) => {
                await this.switchProgram(e.target.value);
            });
        }// Journey controls
        const resetButton = document.getElementById('reset-journey');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetJourney();
            });
        }        const advanceDayButton = document.getElementById('advance-day');
        if (advanceDayButton) {
            advanceDayButton.addEventListener('click', () => {
                this.journeySimulator.advanceSimulation();
                this.showInfo(`Advanced to Day ${this.journeySimulator.currentDay}`);
            });
        }

        const autoPlayButton = document.getElementById('auto-play');
        if (autoPlayButton) {
            autoPlayButton.addEventListener('click', () => {
                this.journeySimulator.toggleAutoPlay();
            });
        }        const speedSlider = document.getElementById('speed-slider');
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                this.journeySimulator.setSpeed(parseInt(e.target.value));
            });
        }

        // Autoplay mode selector
        const autoplayModeSelect = document.getElementById('autoplay-mode');
        if (autoplayModeSelect) {
            autoplayModeSelect.addEventListener('change', (e) => {
                const mode = e.target.value === 'random_mix' ? 'random' : e.target.value;
                this.journeySimulator.setUserBehaviorMode(mode);
            });
        }        // Email preview controls
        const closePreviewButton = document.getElementById('close-preview');
        if (closePreviewButton) {
            closePreviewButton.addEventListener('click', () => {
                this.closeEmailPreview();
            });
        }

        const openNewTabButton = document.getElementById('open-new-tab');
        if (openNewTabButton) {
            openNewTabButton.addEventListener('click', () => {
                this.openEmailInNewTab();
            });
        }        const markOpenedButton = document.getElementById('mark-opened');
        if (markOpenedButton) {
            markOpenedButton.addEventListener('click', () => {
                if (this.currentEmailId) {
                    this.journeySimulator.toggleEmailStatus(this.currentEmailId, 'opened');
                }
            });
        }

        const markClickedButton = document.getElementById('mark-clicked');
        if (markClickedButton) {
            markClickedButton.addEventListener('click', () => {
                if (this.currentEmailId) {
                    this.journeySimulator.toggleEmailStatus(this.currentEmailId, 'clicked');
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window message handler for iframe communication
        window.addEventListener('message', (e) => {
            this.handleIframeMessage(e);
        });

        // Global email action handler for iframe content
        window.handleEmailAction = (action, emailId) => {
            this.handleEmailAction(action, emailId);
        };
    }

    /**
     * Initialize UI components
     */
    initializeUI() {
        this.updateProgramInfo();
        this.showWelcomeMessage();
    }    /**
     * Switch to a different program
     */
    async switchProgram(programType) {
        if (!JOURNEY_CONFIG[programType]) {
            this.showError(`Program ${programType} not found`);
            return;
        }if (programType === 'hrm') {
            this.showInfo('HRM program is coming soon! Currently showing PM program.');
            return;
        }

        await this.journeySimulator.switchProgram(programType);
        this.updateProgramInfo();
        this.closeEmailPreview();
    }

    /**
     * Reset the journey simulation
     */    resetJourney() {
        this.journeySimulator.reset();
        this.closeEmailPreview();
        this.showSuccess('Journey reset successfully. Starting fresh with the welcome email.');
    }/**
     * Close email preview
     */
    closeEmailPreview() {
        this.currentEmailId = null;
        
        // Clear selection
        document.querySelectorAll('.email-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Reset preview content
        const subjectElement = document.getElementById('email-subject');
        const contentElement = document.getElementById('email-content');
        
        if (subjectElement) {
            subjectElement.textContent = 'Select an email to preview';
        }
        
        if (contentElement) {
            contentElement.innerHTML = `
                <div class="placeholder">
                    <i class="fas fa-envelope fa-3x"></i>
                    <p>Select an email from the inbox to view its content</p>
                </div>
            `;
        }

        // Disable action buttons
        const markOpenedBtn = document.getElementById('mark-opened');
        const markClickedBtn = document.getElementById('mark-clicked');
        const openNewTabBtn = document.getElementById('open-new-tab');
        
        if (markOpenedBtn) markOpenedBtn.disabled = true;
        if (markClickedBtn) markClickedBtn.disabled = true;
        if (openNewTabBtn) openNewTabBtn.disabled = true;
    }

    /**
     * Open current email in a new tab
     */
    openEmailInNewTab() {
        if (!this.currentEmailId) {
            this.showError('No email selected');
            return;        }

        const email = this.journeySimulator.getEmail(this.currentEmailId);
        if (!email) {
            this.showError('Email not found');
            return;
        }

        // Create a new window/tab with the email content
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${email.subject}</title>
                    <style>
                        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                        .email-header { 
                            background: #f8f9fa; 
                            padding: 20px; 
                            border-bottom: 2px solid #dee2e6; 
                            margin-bottom: 20px;
                        }
                        .email-meta { color: #6c757d; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="email-header">
                        <h1>${email.subject}</h1>
                        <div class="email-meta">
                            Email Type: ${email.type} | Journey Day: ${email.timing} | Status: ${email.status}
                        </div>
                    </div>
                    ${email.htmlContent}
                </body>
                </html>
            `);
            newWindow.document.close();
            
            this.showInfo('Email opened in new tab');
        } else {
            this.showError('Could not open new tab. Please check popup blocker settings.');
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Prevent shortcuts if typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
            return;
        }

        switch (e.key.toLowerCase()) {            case ' ': // Spacebar - toggle auto-play
                e.preventDefault();
                this.journeySimulator.toggleAutoPlay();
                break;
            case 'r': // R - reset journey
                e.preventDefault();
                this.resetJourney();
                break;
            case 'o': // O - mark current email as opened
                e.preventDefault();                if (this.currentEmailId) {
                    this.journeySimulator.markEmailAsOpened(this.currentEmailId);
                }
                break;
            case 'c': // C - mark current email as clicked
                e.preventDefault();
                if (this.currentEmailId) {
                    this.journeySimulator.markEmailAsClicked(this.currentEmailId);
                }
                break;
            case 'escape': // Escape - close preview
                e.preventDefault();
                this.closeEmailPreview();
                break;
        }
    }

    /**
     * Handle iframe message communication
     */
    handleIframeMessage(e) {
        // Handle messages from email content iframes
        if (e.data && e.data.type === 'emailAction') {
            this.handleEmailAction(e.data.action, e.data.emailId);
        }
    }

    /**
     * Handle email actions (click, open, etc.)
     */
    handleEmailAction(action, emailId) {
        switch (action) {            case 'click':
                this.journeySimulator.markEmailAsClicked(emailId);
                this.showSuccess('Email marked as clicked! This will trigger the next step in the journey.');
                break;
            case 'open':
                this.journeySimulator.markEmailAsOpened(emailId);
                this.showInfo('Email marked as opened.');
                break;
            default:
                console.warn('Unknown email action:', action);
        }
    }

    /**
     * Update program information display
     */
    updateProgramInfo() {        const currentProgram = JOURNEY_CONFIG[this.journeySimulator.currentProgram];
        
        // Update page title
        document.title = `Zoho Campaigns Showcase - ${currentProgram.name}`;
        
        // Update any program-specific UI elements
        const programSelect = document.getElementById('program-select');
        if (programSelect) {
            programSelect.value = this.journeySimulator.currentProgram;
        }
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        this.showInfo(`
            Welcome to the Zoho Campaigns Journey Showcase! 
            <br><br>
            <strong>How to use:</strong>
            <br>• Click "Auto Play" to see the journey in action
            <br>• Select emails from the inbox to preview them
            <br>• Mark emails as "Opened" or "Clicked" to see branching
            <br>• Use keyboard shortcuts: Space (play/pause), R (reset), O (open), C (click)
            <br><br>
            The simulation will show how different user behaviors trigger different email sequences.
        `, 8000);
    }

    /**
     * Show success message
     */
    showSuccess(message, duration = 3000) {
        this.showNotification(message, 'success', duration);
    }

    /**
     * Show info message
     */
    showInfo(message, duration = 5000) {
        this.showNotification(message, 'info', duration);
    }

    /**
     * Show error message
     */
    showError(message, duration = 5000) {
        this.showNotification(message, 'error', duration);
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add styles if not already present
        this.addNotificationStyles();

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
    }

    /**
     * Get icon for notification type
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Add notification styles if not present
     */
    addNotificationStyles() {
        if (document.getElementById('notification-styles')) return;

        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                border-left: 4px solid #667eea;
                z-index: 10000;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                max-width: 400px;
                min-width: 300px;
            }
            .notification.show {
                opacity: 1;
                transform: translateX(0);
            }
            .notification-success {
                border-left-color: #10b981;
            }
            .notification-error {
                border-left-color: #ef4444;
            }
            .notification-warning {
                border-left-color: #f59e0b;
            }
            .notification-info {
                border-left-color: #3b82f6;
            }
            .notification-content {
                padding: 15px 20px;
                display: flex;
                align-items: flex-start;
                gap: 10px;
            }
            .notification-content i {
                color: #667eea;
                margin-top: 2px;
            }
            .notification-success .notification-content i {
                color: #10b981;
            }
            .notification-error .notification-content i {
                color: #ef4444;
            }
            .notification-warning .notification-content i {
                color: #f59e0b;
            }
            .notification-content span {
                flex: 1;
                font-size: 14px;
                line-height: 1.4;
            }
            .notification-close {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 0;
                margin-left: 10px;
            }
            .notification-close:hover {
                color: #374151;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Handle application errors
     */
    handleError(error, context = '') {
        console.error(`Application error ${context}:`, error);
        this.showError(`An error occurred ${context}. Please check the console for details.`);
    }

    /**
     * Preview an email
     */
    previewEmail(emailId) {
        this.currentEmailId = emailId;
        const email = this.journeySimulator.getEmail(emailId);
        if (!email) {
            this.showError('Email not found for preview');
            return;
        }

        // Update preview pane
        document.getElementById('email-subject').textContent = email.subject;
        const contentElement = document.getElementById('email-content');
        contentElement.innerHTML = '<iframe src="about:blank" style="width:100%; height:100%; border:none;"></iframe>';
        const iframe = contentElement.querySelector('iframe');
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(email.htmlContent);
        iframe.contentWindow.document.close();

        // Enable action buttons
        document.getElementById('mark-opened').disabled = false;
        document.getElementById('mark-clicked').disabled = false;
        document.getElementById('open-new-tab').disabled = false;

        // Highlight selected email
        document.querySelectorAll('.email-item').forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.emailId === emailId) {
                item.classList.add('selected');
            }
        });
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const app = new ZohoCampaignsShowcase();
        await app.init();
        
        // Make app globally available for debugging
        window.showcaseApp = app;
        
    } catch (error) {
        console.error('Failed to start application:', error);
        
        // Show fallback error message
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f3f4f6;">
                <div style="text-align: center; padding: 40px; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ef4444; margin-bottom: 20px;"></i>
                    <h1 style="color: #374151; margin-bottom: 10px;">Application Failed to Load</h1>
                    <p style="color: #6b7280; margin-bottom: 20px;">There was an error initializing the Zoho Campaigns Showcase.</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Refresh Page
                    </button>
                </div>
            </div>
        `;
    }
});

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});
