// Journey configuration data
const JOURNEY_CONFIG = {
    pm: {
        name: 'Project Management',
        description: 'Comprehensive project management certification program',
        emails: [
            { id: 1, type: 'main', subject: 'Welcome & Program Introduction', description: 'Welcome to the Project Management Certification Program', htmlFile: 'template_1.html' },
            { id: '1a', type: 'reminder', subject: 'Reminder - Welcome & Program Introduction', description: 'Don\'t miss out on this amazing opportunity', htmlFile: 'template_1a.html' },
            { id: 2, type: 'main', subject: 'Program Highlights & Features', description: 'Discover what makes our program unique', htmlFile: 'template_2.html' },
            { id: '2a', type: 'reminder', subject: 'Reminder - Program Highlights & Features', description: 'Last chance to explore our program features', htmlFile: 'template_2a.html' },
            { id: 3, type: 'main', subject: 'Program Structure & Curriculum', description: 'Deep dive into our comprehensive curriculum', htmlFile: 'template_3.html' },
            { id: '3a', type: 'reminder', subject: 'Reminder - Program Structure & Curriculum', description: 'Review our detailed curriculum outline', htmlFile: 'template_3a.html' },
            { id: 4, type: 'main', subject: 'Industry Insights & Trends', description: 'Stay ahead with current industry knowledge', htmlFile: 'template_4.html' },
            { id: '4a', type: 'reminder', subject: 'Reminder - Industry Insights & Trends', description: 'Don\'t miss these valuable industry insights', htmlFile: 'template_4a.html' },
            { id: 5, type: 'main', subject: 'Career Opportunities & Growth', description: 'Explore your career advancement potential', htmlFile: 'template_5.html' },
            { id: '5a', type: 'reminder', subject: 'Reminder - Career Opportunities & Growth', description: 'Unlock your career potential today', htmlFile: 'template_5a.html' },
            { id: 6, type: 'main', subject: 'Student Success & Testimonials', description: 'Real stories from successful graduates', htmlFile: 'template_6.html' },
            { id: '6a', type: 'reminder', subject: 'Reminder - Student Success & Testimonials', description: 'Hear from our successful graduates', htmlFile: 'template_6a.html' },
            { id: 7, type: 'main', subject: 'Exclusive Offer or Promotion', description: 'Limited time special offer just for you', htmlFile: 'template_7.html' },
            { id: '7a', type: 'reminder', subject: 'Reminder - Exclusive Offer or Promotion', description: 'Last chance for this exclusive offer', htmlFile: 'template_7a.html' },
            { id: 8, type: 'main', subject: 'Program Updates & Benefits', description: 'Latest program enhancements and benefits', htmlFile: 'template_8.html' },
            { id: '8a', type: 'reminder', subject: 'Reminder - Program Updates & Benefits', description: 'New benefits you shouldn\'t miss', htmlFile: 'template_8a.html' },
            { id: 9, type: 'main', subject: 'Final Offer & Decision Time', description: 'Your final opportunity to join us', htmlFile: 'template_9.html' },
            { id: '9a', type: 'reminder', subject: 'Final Reminder - Last Chance', description: 'This is your final opportunity to enroll', htmlFile: 'template_9a.html' }
        ]
    }
};

// Configuration for email simulation
const SIMULATION_CONFIG = {
    autoAdvanceDelay: 1000, // Base delay: 1 second = 1 day
    defaultSpeed: 5,// Speed multipliers for simulation (1 day per second base, increment by 0.5 day per second)
    speedMultipliers: {
        1: 1.0,    // 1x = 1 day per second
        2: 0.67,   // 1.5x = 1.5 days per second
        3: 0.5,    // 2x = 2 days per second
        4: 0.4,    // 2.5x = 2.5 days per second
        5: 0.33,   // 3x = 3 days per second
        6: 0.29,   // 3.5x = 3.5 days per second
        7: 0.25,   // 4x = 4 days per second
        8: 0.22,   // 4.5x = 4.5 days per second
        9: 0.2,    // 5x = 5 days per second
        10: 0.18,  // 5.5x = 5.5 days per second
        11: 0.17   // 6x = 6 days per second
    },
    
    // Email behavior probabilities
    behaviorProbabilities: {
        openEmail: 70,        // 70% chance to open
        clickAfterOpen: 40,   // 40% chance to click after opening
        delayedOpen: 20       // 20% chance to open with delay
    },
    
    // User behavior patterns by day
    activityByDay: {
        1: 0.8,
        2: 0.6,
        3: 0.4,
        4: 0.25,
        5: 0.2,
        6: 0.15,
        7: 0.1,
        8: 0.08,
        9: 0.05,
        10: 0.02
    },
    
    // Autoplay behavior modes
    autoplayModes: {
        never_open: {
            name: 'Never Open',
            description: 'User never opens emails - follows reminder path',
            openProbability: 0,
            clickProbability: 0
        },
        always_open: {
            name: 'Always Open',
            description: 'User always opens emails - follows main path',
            openProbability: 1,
            clickProbability: 0.8
        },
        random_mix: {
            name: 'Random Mix',
            description: 'Realistic user behavior with mixed engagement',
            openProbability: 0.7,
            clickProbability: 0.4
        }
    },
    
    // Default autoplay mode
    defaultAutoplayMode: 'random_mix',
    
    // Day simulation settings
    dayAdvanceInterval: 1000, // 1 second = 1 day in simulation
    maxTimelineEntries: 50
};
