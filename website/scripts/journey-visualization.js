class JourneyVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Journey visualizer container #${containerId} not found.`);
        }
    }

    render(programType) {
        if (!this.container) return;

        const programConfig = JOURNEY_CONFIG[programType];
        if (!programConfig) {
            this.container.innerHTML = '<p>Could not load journey flow.</p>';
            return;
        }

        const mainEmails = programConfig.emails.filter(e => e.type === 'main');

        let html = '<ul class="journey-flow">';
        mainEmails.forEach(mainEmail => {
            const reminder = programConfig.emails.find(e => e.id === `${mainEmail.id}a`);
            html += this.createNode(mainEmail, reminder);
        });
        html += '</ul>';

        this.container.innerHTML = html;
        this.addStyles();
    }

    createNode(mainEmail, reminderEmail) {
        let nodeHtml = `<li class="journey-node main-node" data-email-id="${mainEmail.id}">`;
        nodeHtml += `<div class="node-content"><span>${mainEmail.id}. ${mainEmail.subject}</span></div>`;

        if (reminderEmail) {
            nodeHtml += '<ul class="journey-branch">';
            nodeHtml += `<li class="journey-node reminder-node" data-email-id="${reminderEmail.id}">`;
            nodeHtml += `<div class="node-content"><span>${reminderEmail.id}. ${reminderEmail.subject}</span></div>`;
            nodeHtml += '</li>';
            nodeHtml += '</ul>';
        }

        nodeHtml += '</li>';
        return nodeHtml;
    }

    updateState(inbox, userActions) {
        if (!this.container) return;
        
        document.querySelectorAll('.journey-node').forEach(node => {
            const emailId = node.dataset.emailId;
            node.classList.remove('sent', 'opened', 'clicked');

            const inboxEmail = inbox.find(e => e.number == emailId);
            if (inboxEmail) {
                node.classList.add('sent');
                const action = userActions.get(inboxEmail.id);
                if (action?.opened) {
                    node.classList.add('opened');
                }
                if (action?.clicked) {
                    node.classList.add('clicked');
                }
            }
        });
    }

    addStyles() {
        if (document.getElementById('journey-visualization-styles')) return;

        const style = document.createElement('style');
        style.id = 'journey-visualization-styles';
        style.textContent = `
            .journey-flow {
                list-style-type: none;
                padding-left: 20px;
                position: relative;
            }
            .journey-flow::before {
                content: '';
                position: absolute;
                left: 10px;
                top: 0;
                bottom: 0;
                width: 2px;
                background: #e2e8f0;
            }
            .journey-node {
                position: relative;
                margin-bottom: 15px;
            }
            .journey-node .node-content {
                padding-left: 25px;
                position: relative;
            }
            .journey-node .node-content::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 20px;
                height: 2px;
                background: #e2e8f0;
            }
            .journey-node .node-content::after {
                content: '';
                position: absolute;
                left: -10px;
                top: 50%;
                transform: translateY(-50%);
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #fff;
                border: 2px solid #e2e8f0;
            }
            .journey-node.main-node > .node-content::after {
                background: #667eea;
                border-color: #667eea;
            }
            .journey-node.reminder-node > .node-content::after {
                background: #f59e0b;
                border-color: #f59e0b;
            }
            .journey-branch {
                list-style-type: none;
                padding-left: 40px;
                position: relative;
            }
            .journey-branch::before {
                content: '';
                position: absolute;
                left: 10px;
                top: -15px;
                bottom: 0;
                width: 2px;
                background: #e2e8f0;
            }
            .journey-node.sent > .node-content::after {
                border-color: #3b82f6;
            }
            .journey-node.opened > .node-content::after {
                background: #10b981;
                border-color: #10b981;
            }
            .journey-node.clicked > .node-content::after {
                background: #ef4444;
                border-color: #ef4444;
                animation: pulse 1.5s infinite;
            }
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }
        `;
        document.head.appendChild(style);
    }
}
