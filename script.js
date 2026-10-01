// Global variables
let jobs = [];
let filteredJobs = [];
let currentFilter = 'all';
let displayedJobs = 6; // For load more functionality

// DOM elements
const jobsGrid = document.getElementById('jobsGrid');
const heroSearchInput = document.getElementById('heroSearchInput');
const locationInput = document.getElementById('locationInput');
const heroSearchBtn = document.getElementById('heroSearchBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const filterTabs = document.querySelectorAll('.filter-tab');
const filterButtons = document.querySelectorAll('.filter-btn');
const quickFilters = document.querySelectorAll('.quick-filter');
const jobTypeFilter = document.getElementById('jobTypeFilter');
const experienceFilter = document.getElementById('experienceFilter');
const salaryFilter = document.getElementById('salaryFilter');
const sortSelect = document.getElementById('sortSelect');
const clearFiltersBtn = document.getElementById('clearFilters');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const resultsCount = document.getElementById('resultsCount');
const noResults = document.getElementById('noResults');
const applicationModal = document.getElementById('applicationModal');
const closeModal = document.getElementById('closeModal');
const applicationForm = document.getElementById('applicationForm');
const successMessage = document.getElementById('successMessage');
const okBtn = document.getElementById('okBtn');
const chatToggle = document.getElementById('chatToggle');
const chatbotContainer = document.getElementById('chatbotContainer');
const minimizeChat = document.getElementById('minimizeChat');
const chatInput = document.getElementById('chatInput');
const sendMessage = document.getElementById('sendMessage');
const chatMessages = document.getElementById('chatMessages');
const navToggle = document.getElementById('navToggle');
const navMenu = document.querySelector('.nav-menu');

// Profile elements
const profileToggle = document.getElementById('profileToggle');
const profileModal = document.getElementById('profileModal');
const closeProfileModal = document.getElementById('closeProfileModal');
const profileForm = document.getElementById('profileForm');
const searchSuggestions = document.getElementById('searchSuggestions');

// File upload elements
const fileUploadBtn = document.getElementById('fileUploadBtn');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const removeFileBtn = document.getElementById('removeFile');

// Global file storage
let uploadedFile = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadJobs();
    setupEventListeners();
    setupSearchSuggestions();
});

// Load jobs from JSON file
async function loadJobs() {
    try {
        const response = await fetch('careers.json');
        const data = await response.json();
        jobs = data.jobs;
        filteredJobs = jobs;
        displayJobs(filteredJobs);
    } catch (error) {
        console.error('Error loading jobs:', error);
        showError('Failed to load job listings. Please try again later.');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Hero search functionality
    heroSearchBtn.addEventListener('click', performHeroSearch);
    heroSearchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performHeroSearch();
        }
    });
    heroSearchInput.addEventListener('input', debounce(performHeroSearch, 300));

    // Location search
    locationInput.addEventListener('input', debounce(performHeroSearch, 300));

    // Legacy search functionality (if still exists)
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        searchInput.addEventListener('input', debounce(performSearch, 300));
    }

    // Filter tabs
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.category;
            filterAndDisplayJobs();
        });
    });

    // Legacy filter buttons (if still exist)
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.category;
            filterAndDisplayJobs();
        });
    });

    // Quick filters
    quickFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            const searchTerm = this.dataset.search;
            heroSearchInput.value = searchTerm;
            performHeroSearch();
        });
    });

    // Advanced filters
    jobTypeFilter.addEventListener('change', function() {
        autoUpdateFilters();
        filterAndDisplayJobs();
    });
    experienceFilter.addEventListener('change', function() {
        autoUpdateFilters();
        filterAndDisplayJobs();
    });
    salaryFilter.addEventListener('change', function() {
        autoUpdateFilters();
        filterAndDisplayJobs();
    });
    sortSelect.addEventListener('change', sortAndDisplayJobs);

    // Initialize counts after jobs are loaded
    setTimeout(() => {
        if (jobs.length > 0) {
            updateJobTypeCounts();
            updateExperienceCounts();
        }
    }, 100);

    // Navigation functionality
    setupNavigation();

    // Clear filters
    clearFiltersBtn.addEventListener('click', clearAllFilters);

    // Load more
    loadMoreBtn.addEventListener('click', loadMoreJobs);

    // Modal functionality
    closeModal.addEventListener('click', closeApplicationModal);
    applicationModal.addEventListener('click', function(e) {
        if (e.target === applicationModal) {
            closeApplicationModal();
        }
    });

    // Application form
    applicationForm.addEventListener('submit', handleApplicationSubmit);

    // Success message
    okBtn.addEventListener('click', function() {
        successMessage.classList.remove('active');
    });

    // Profile Modal
    profileToggle.addEventListener('click', function() {
        profileModal.classList.add('active');
        loadUserProfile();
    });

    closeProfileModal.addEventListener('click', function() {
        profileModal.classList.remove('active');
    });

    profileModal.addEventListener('click', function(e) {
        if (e.target === profileModal) {
            profileModal.classList.remove('active');
        }
    });

    profileForm.addEventListener('submit', handleProfileSubmit);

    // Chatbot
    chatToggle.addEventListener('click', function() {
        chatbotContainer.classList.add('active');
    });

    minimizeChat.addEventListener('click', function() {
        chatbotContainer.classList.remove('active');
    });

    sendMessage.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });

    // File upload functionality
    fileUploadBtn.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileUpload);
    removeFileBtn.addEventListener('click', removeUploadedFile);

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
}

// Setup navigation functionality
function setupNavigation() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Smooth scroll to section
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Resource buttons functionality
    const resourceBtns = document.querySelectorAll('.resource-btn');
    resourceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const btnText = this.textContent.trim();
            handleResourceClick(btnText);
        });
    });

    // Contact form submission
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactForm(this);
        });
    }

    // Update active nav link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

// Handle resource button clicks
function handleResourceClick(btnText) {
    switch(btnText) {
        case 'Get Started':
            // Open resume builder
            alert('Resume Builder will be available soon!');
            break;
        case 'Start Practice':
            // Open interview preparation
            alert('Interview Preparation will be available soon!');
            break;
        case 'Take Test':
            // Open skill assessment
            alert('Skill Assessment will be available soon!');
            break;
        case 'Read More':
            // Open career guides
            alert('Career Guides will be available soon!');
            break;
    }
}

// Handle contact form submission
function handleContactForm(form) {
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const message = form.querySelector('textarea').value;
    
    if (name && email && message) {
        alert(`Thank you ${name}! Your message has been sent successfully. We'll get back to you at ${email} soon.`);
        form.reset();
    } else {
        alert('Please fill in all fields before submitting.');
    }
}

// Update active navigation link on scroll
function updateActiveNavLink() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

    // Clear filters
    clearFiltersBtn.addEventListener('click', clearAllFilters);

    // Load more
    loadMoreBtn.addEventListener('click', loadMoreJobs);

    // Modal functionality
    closeModal.addEventListener('click', closeApplicationModal);
    applicationModal.addEventListener('click', function(e) {
        if (e.target === applicationModal) {
            closeApplicationModal();
        }
    });

    // Application form
    applicationForm.addEventListener('submit', handleApplicationSubmit);

    // Success message
    okBtn.addEventListener('click', function() {
        successMessage.classList.remove('active');
    });

    // Profile Modal
    profileToggle.addEventListener('click', function() {
        profileModal.classList.add('active');
        loadUserProfile();
    });

    closeProfileModal.addEventListener('click', function() {
        profileModal.classList.remove('active');
    });

    profileModal.addEventListener('click', function(e) {
        if (e.target === profileModal) {
            profileModal.classList.remove('active');
        }
    });

    profileForm.addEventListener('submit', handleProfileSubmit);

    // Chatbot
    chatToggle.addEventListener('click', function() {
        chatbotContainer.classList.add('active');
    });

    minimizeChat.addEventListener('click', function() {
        chatbotContainer.classList.remove('active');
    });

    sendMessage.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });

    // File upload functionality
    fileUploadBtn.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileUpload);
    removeFileBtn.addEventListener('click', removeUploadedFile);

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
}

// Real-time Search Suggestions
function setupSearchSuggestions() {
    let currentFocus = -1;
    
    heroSearchInput.addEventListener('input', function() {
        const value = this.value.trim();
        
        if (value.length < 2) {
            hideSuggestions();
            return;
        }
        
        showSuggestions(value);
    });
    
    heroSearchInput.addEventListener('keydown', function(e) {
        const items = searchSuggestions.getElementsByClassName('suggestion-item');
        
        if (e.key === 'ArrowDown') {
            currentFocus++;
            addActive(items);
        } else if (e.key === 'ArrowUp') {
            currentFocus--;
            addActive(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentFocus > -1 && items[currentFocus]) {
                items[currentFocus].click();
            }
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!heroSearchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            hideSuggestions();
        }
    });
    
    function addActive(items) {
        if (!items) return false;
        
        removeActive(items);
        
        if (currentFocus >= items.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = items.length - 1;
        
        items[currentFocus].classList.add('selected');
        heroSearchInput.value = items[currentFocus].textContent.trim();
    }
    
    function removeActive(items) {
        for (let item of items) {
            item.classList.remove('selected');
        }
    }
}

function showSuggestions(searchTerm) {
    const suggestions = generateSuggestions(searchTerm);
    
    if (suggestions.length === 0) {
        hideSuggestions();
        return;
    }
    
    searchSuggestions.innerHTML = suggestions.map(suggestion => `
        <div class="suggestion-item" onclick="selectSuggestion('${suggestion.text}', '${suggestion.type}')">
            <i class="fas ${getSuggestionIcon(suggestion.type)} suggestion-icon"></i>
            <span class="suggestion-text">${suggestion.text}</span>
            <span class="suggestion-type">${suggestion.type}</span>
        </div>
    `).join('');
    
    searchSuggestions.classList.add('active');
}

function hideSuggestions() {
    searchSuggestions.classList.remove('active');
    searchSuggestions.innerHTML = '';
}

function generateSuggestions(searchTerm) {
    const suggestions = [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // Job title suggestions
    jobs.forEach(job => {
        if (job.title.toLowerCase().includes(lowerSearchTerm)) {
            suggestions.push({
                text: job.title,
                type: 'Job Title',
                data: job
            });
        }
    });
    
    // Company suggestions
    const companies = [...new Set(jobs.map(job => job.company))];
    companies.forEach(company => {
        if (company.toLowerCase().includes(lowerSearchTerm)) {
            suggestions.push({
                text: company,
                type: 'Company',
                data: company
            });
        }
    });
    
    // Skill suggestions
    const allSkills = [...new Set(jobs.flatMap(job => job.skills))];
    allSkills.forEach(skill => {
        if (skill.toLowerCase().includes(lowerSearchTerm)) {
            suggestions.push({
                text: skill,
                type: 'Skill',
                data: skill
            });
        }
    });
    
    // Location suggestions
    const locations = [...new Set(jobs.map(job => job.location))];
    locations.forEach(location => {
        if (location.toLowerCase().includes(lowerSearchTerm)) {
            suggestions.push({
                text: location,
                type: 'Location',
                data: location
            });
        }
    });
    
    // Popular search suggestions
    const popularSearches = ['entry level', 'no experience', 'internship', 'trainee', 'junior', 'fresher'];
    popularSearches.forEach(search => {
        if (search.toLowerCase().includes(lowerSearchTerm)) {
            suggestions.push({
                text: search,
                type: 'Popular',
                data: search
            });
        }
    });
    
    // Remove duplicates and limit to 8 suggestions
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
        index === self.findIndex((s) => s.text === suggestion.text)
    );
    
    return uniqueSuggestions.slice(0, 8);
}

function getSuggestionIcon(type) {
    const icons = {
        'Job Title': 'fa-briefcase',
        'Company': 'fa-building',
        'Skill': 'fa-code',
        'Location': 'fa-map-marker-alt',
        'Popular': 'fa-star'
    };
    
    return icons[type] || 'fa-search';
}

function selectSuggestion(text, type) {
    heroSearchInput.value = text;
    hideSuggestions();
    
    // Focus on location input if company or job title is selected
    if (type === 'Job Title' || type === 'Company') {
        locationInput.focus();
    }
    
    // Trigger search if skill or popular search is selected
    if (type === 'Skill' || type === 'Popular') {
        performHeroSearch();
    }
}

// File Upload and Processing Functions
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
        alert('Please upload an image, PDF, Word document, or text file');
        return;
    }

    uploadedFile = file;
    displayFilePreview(file);
}

function displayFilePreview(file) {
    const fileName = file.name;
    const fileIcon = getFileIcon(file.type);
    
    filePreview.querySelector('.file-name').textContent = fileName;
    filePreview.querySelector('.file-info i').className = fileIcon;
    filePreview.style.display = 'block';
}

function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) {
        return 'fas fa-image';
    } else if (fileType === 'application/pdf') {
        return 'fas fa-file-pdf';
    } else if (fileType.includes('word')) {
        return 'fas fa-file-word';
    } else if (fileType === 'text/plain') {
        return 'fas fa-file-alt';
    }
    return 'fas fa-file';
}

function removeUploadedFile() {
    uploadedFile = null;
    fileInput.value = '';
    filePreview.style.display = 'none';
}

async function processFile(file, message) {
    // Show processing indicator
    addProcessingIndicator();
    
    try {
        let analysisResult;
        
        if (file.type.startsWith('image/')) {
            analysisResult = await processImage(file);
        } else if (file.type === 'application/pdf') {
            analysisResult = await processPDF(file);
        } else if (file.type.includes('word') || file.type === 'text/plain') {
            analysisResult = await processDocument(file);
        }
        
        // Remove processing indicator
        removeProcessingIndicator();
        
        // Add file message to chat
        addFileMessage(file, 'user');
        
        // Add bot response with analysis
        const botResponse = generateFileResponse(analysisResult, message);
        addMessageToChat(botResponse, 'bot');
        
        // Clear uploaded file
        removeUploadedFile();
        
    } catch (error) {
        removeProcessingIndicator();
        addMessageToChat('Sorry, I had trouble processing that file. Please try again.', 'bot');
        console.error('File processing error:', error);
    }
}

async function processImage(file) {
    // Simulate image processing (OCR, object detection, etc.)
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                type: 'image',
                analysis: 'I can see this image contains career-related content. Based on visual analysis, this appears to be related to professional development or job searching.',
                suggestions: ['Resume review', 'Career guidance', 'Skill assessment']
            });
        }, 2000);
    });
}

async function processPDF(file) {
    // Simulate PDF processing (text extraction, analysis)
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                type: 'pdf',
                analysis: 'I\'ve analyzed this PDF document. It contains information that could be relevant to your job search or career development.',
                suggestions: ['Document review', 'Content optimization', 'Format improvement']
            });
        }, 1500);
    });
}

async function processDocument(file) {
    // Simulate document processing (text analysis, keyword extraction)
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                type: 'document',
                analysis: 'I\'ve reviewed this document and identified key information related to your professional profile and career objectives.',
                suggestions: ['Content enhancement', 'Keyword optimization', 'Structure improvement']
            });
        }, 1000);
    });
}

function generateFileResponse(analysis, userMessage) {
    const responses = {
        'image': `I've analyzed your image. ${analysis.analysis} Would you like me to help you with ${analysis.suggestions.join(', ')}?`,
        'pdf': `I've processed your PDF. ${analysis.analysis} I can assist you with ${analysis.suggestions.join(', ')} to improve your job search materials.`,
        'document': `I've reviewed your document. ${analysis.analysis} Let me help you with ${analysis.suggestions.join(', ')} to make it more effective.`
    };
    
    let baseResponse = responses[analysis.type] || "I've processed your file. How can I help you with it?";
    
    // Add contextual response based on user message
    if (userMessage.toLowerCase().includes('resume')) {
        baseResponse += " I can provide specific resume tips and formatting suggestions.";
    } else if (userMessage.toLowerCase().includes('cover letter')) {
        baseResponse += " I can help you craft a compelling cover letter.";
    } else if (userMessage.toLowerCase().includes('skills')) {
        baseResponse += " I can identify key skills and suggest improvements.";
    }
    
    return baseResponse;
}

function addFileMessage(file, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message file-message ${file.type.startsWith('image/') ? 'image-message' : ''}`;
    
    if (file.type.startsWith('image/')) {
        // For images, create a preview
        const reader = new FileReader();
        reader.onload = function(e) {
            messageDiv.innerHTML = `
                <div class="file-content">
                    <div class="file-icon">
                        <img src="${e.target.result}" alt="${file.name}">
                    </div>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <p>${formatFileSize(file.size)}</p>
                    </div>
                    <div class="file-actions">
                        <button onclick="viewFileDetails('${file.name}')">View Details</button>
                    </div>
                </div>
            `;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };
        reader.readAsDataURL(file);
    } else {
        // For other files, show icon
        const fileIcon = getFileIcon(file.type);
        messageDiv.innerHTML = `
            <div class="file-content">
                <div class="file-icon">
                    <i class="${fileIcon}"></i>
                </div>
                <div class="file-details">
                    <h4>${file.name}</h4>
                    <p>${formatFileSize(file.size)}</p>
                </div>
                <div class="file-actions">
                    <button onclick="viewFileDetails('${file.name}')">View Details</button>
                </div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function addProcessingIndicator() {
    const processingDiv = document.createElement('div');
    processingDiv.className = 'message bot-message';
    processingDiv.id = 'processingIndicator';
    processingDiv.innerHTML = `
        <div class="processing-indicator">
            <i class="fas fa-spinner"></i>
            <span>Processing your file...</span>
        </div>
    `;
    chatMessages.appendChild(processingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeProcessingIndicator() {
    const indicator = document.getElementById('processingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function viewFileDetails(fileName) {
    addMessageToChat(`You asked about: ${fileName}. This file has been processed and I'm ready to help you with specific improvements or questions about it.`, 'bot');
}

// Enhanced sendChatMessage to handle files
function sendChatMessage() {
    const message = chatInput.value.trim();
    
    if (!message && !uploadedFile) return;
    
    // If there's a file, process it first
    if (uploadedFile) {
        processFile(uploadedFile, message);
        chatInput.value = '';
        return;
    }
    
    // Regular text message
    addMessageToChat(message, 'user');
    chatInput.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Simulate bot response with delay
    setTimeout(() => {
        hideTypingIndicator();
        const response = generateSmartBotResponse(message);
        addMessageToChat(response, 'bot');
        
        // If bot asks for info, add interactive buttons
        if (response.includes('Would you like to') || response.includes('Let me help you')) {
            addQuickActions(response);
        }
    }, 1200);
}

// Display jobs in the grid
function displayJobs(jobsToDisplay) {
    // Update results count
    resultsCount.textContent = filteredJobs.length;
    
    if (filteredJobs.length === 0) {
        jobsGrid.style.display = 'none';
        noResults.style.display = 'block';
        loadMoreBtn.style.display = 'none';
        return;
    }

    jobsGrid.style.display = 'grid';
    noResults.style.display = 'none';

    jobsGrid.innerHTML = jobsToDisplay.map(job => `
        <div class="job-card" data-job-id="${job.id}">
            <div class="job-card-content">
                <div class="job-card-header">
                    <div class="company-logo-wrapper">
                        <img src="${job.logo}" alt="${job.company}" class="company-logo">
                    </div>
                    <div class="company-info">
                        <div class="company-name">${job.company}</div>
                        <h3 class="job-title">${job.title}</h3>
                    </div>
                </div>
                <div class="job-meta">
                    <div class="job-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${job.location}
                    </div>
                    <div class="job-type">
                        <i class="fas fa-briefcase"></i>
                        ${job.type ? job.type.charAt(0).toUpperCase() + job.type.slice(1) : 'Full-time'}
                    </div>
                </div>
                <div class="job-skills-section">
                    <div class="skills-label">Skills Required</div>
                    <div class="skills-list">
                        ${job.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
                <div class="job-footer">
                    <div class="job-salary">
                        ${job.salary}
                    </div>
                    <button class="apply-btn" onclick="openApplicationModal(${job.id})">
                        Apply Now
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Show/hide load more button
    if (jobsToDisplay.length < filteredJobs.length) {
        loadMoreBtn.style.display = 'inline-block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// Hero search functionality
function performHeroSearch() {
    const searchTerm = heroSearchInput.value.toLowerCase().trim();
    const locationTerm = locationInput.value.toLowerCase().trim();
    filterAndDisplayJobs(searchTerm, locationTerm);
}

// Legacy search functionality
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    filterAndDisplayJobs(searchTerm);
}

// Filter and display jobs
function filterAndDisplayJobs(searchTerm = '', locationTerm = '') {
    filteredJobs = jobs.filter(job => {
        // Search filter
        const matchesSearch = !searchTerm || 
            job.title.toLowerCase().includes(searchTerm) ||
            job.company.toLowerCase().includes(searchTerm) ||
            job.skills.some(skill => skill.toLowerCase().includes(searchTerm));
        
        // Location filter
        const matchesLocation = !locationTerm || 
            job.location.toLowerCase().includes(locationTerm);
        
        // Category filter
        const matchesCategory = currentFilter === 'all' || job.category === currentFilter;
        
        // Job type filter
        const jobType = jobTypeFilter.value;
        const matchesJobType = !jobType || job.type.toLowerCase() === jobType;
        
        // Experience filter
        const experience = experienceFilter.value;
        const matchesExperience = !experience || job.experience === experience;
        
        // Salary filter
        const salaryRange = salaryFilter.value;
        let matchesSalary = true;
        if (salaryRange) {
            const salaryNum = parseInt(job.salary.replace(/[₹,LPA,]/g, '').replace(/,/g, '').trim());
            if (salaryRange === '0-25') matchesSalary = salaryNum < 25000;
            else if (salaryRange === '25-40') matchesSalary = salaryNum >= 25000 && salaryNum < 40000;
            else if (salaryRange === '40-60') matchesSalary = salaryNum >= 40000 && salaryNum < 60000;
            else if (salaryRange === '60+') matchesSalary = salaryNum >= 60000;
        }
        
        return matchesSearch && matchesLocation && matchesCategory && matchesJobType && matchesExperience && matchesSalary;
    });

    // Reset displayed jobs count
    displayedJobs = 6;
    sortAndDisplayJobs();
}

// Sort and display jobs
function sortAndDisplayJobs() {
    const sortBy = sortSelect.value;
    
    filteredJobs.sort((a, b) => {
        switch(sortBy) {
            case 'recent':
                return b.id - a.id;
            case 'salary-high':
                return parseInt(b.salary.replace(/\D/g, '')) - parseInt(a.salary.replace(/\D/g, ''));
            case 'salary-low':
                return parseInt(a.salary.replace(/\D/g, '')) - parseInt(b.salary.replace(/\D/g, ''));
            case 'relevant':
            default:
                return 0; // Keep original order for relevance
        }
    });
    
    displayJobs(filteredJobs.slice(0, displayedJobs));
}

// Clear all filters
function clearAllFilters() {
    heroSearchInput.value = '';
    locationInput.value = '';
    if (searchInput) searchInput.value = '';
    currentFilter = 'all';
    jobTypeFilter.value = '';
    experienceFilter.value = '';
    salaryFilter.value = '';
    sortSelect.value = 'recent';
    
    // Reset active tabs
    filterTabs.forEach(tab => tab.classList.remove('active'));
    filterTabs[0].classList.add('active');
    
    displayedJobs = 6;
    filterAndDisplayJobs();
}

// Load more jobs
function loadMoreJobs() {
    displayedJobs += 6;
    displayJobs(filteredJobs.slice(0, displayedJobs));
    
    // Hide load more button if all jobs are displayed
    if (displayedJobs >= filteredJobs.length) {
        loadMoreBtn.style.display = 'none';
    }
}

// Open application modal
function openApplicationModal(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    document.getElementById('jobTitle').value = job.title;
    document.getElementById('company').value = job.company;
    
    applicationModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close application modal
function closeApplicationModal() {
    applicationModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    applicationForm.reset();
}

// Handle application form submission
async function handleApplicationSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(applicationForm);
    const applicationData = {
        jobTitle: formData.get('jobTitle') || document.getElementById('jobTitle').value,
        company: formData.get('company') || document.getElementById('company').value,
        name: formData.get('name') || document.getElementById('name').value,
        email: formData.get('email') || document.getElementById('email').value,
        phone: formData.get('phone') || document.getElementById('phone').value,
        resume: formData.get('resume') || document.getElementById('resume').files[0],
        coverLetter: formData.get('coverLetter') || document.getElementById('coverLetter').value,
        submittedAt: new Date().toISOString()
    };

    try {
        // Validate file size
        if (applicationData.resume && applicationData.resume.size > 5 * 1024 * 1024) {
            showError('Resume file size must be less than 5MB');
            return;
        }

        // Validate file type
        if (applicationData.resume) {
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(applicationData.resume.type)) {
                showError('Please upload a PDF, DOC, or DOCX file');
                return;
            }
        }

        // Simulate API call (in real application, this would send to server)
        console.log('Application submitted:', applicationData);
        
        // Show success message
        closeApplicationModal();
        successMessage.classList.add('active');
        
        // Store application in localStorage for demo purposes
        const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
        applications.push({
            ...applicationData,
            id: Date.now()
        });
        localStorage.setItem('jobApplications', JSON.stringify(applications));
        
    } catch (error) {
        console.error('Error submitting application:', error);
        showError('Failed to submit application. Please try again.');
    }
}

// Enhanced Chatbot functionality
let userProfile = {
    name: '',
    skills: [],
    preferences: [],
    experience: 'entry',
    location: ''
};

function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    addMessageToChat(message, 'user');
    chatInput.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Simulate bot response with delay
    setTimeout(() => {
        hideTypingIndicator();
        const response = generateSmartBotResponse(message);
        addMessageToChat(response, 'bot');
        
        // If bot asks for info, add interactive buttons
        if (response.includes('Would you like to') || response.includes('Let me help you')) {
            addQuickActions(response);
        }
    }, 1200);
}

function addMessageToChat(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const icon = document.createElement('i');
    icon.className = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
    
    const messageText = document.createElement('p');
    messageText.textContent = message;
    
    messageDiv.appendChild(icon);
    messageDiv.appendChild(messageText);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-robot';
    
    const typingText = document.createElement('div');
    typingText.className = 'typing-dots';
    typingText.innerHTML = '<span></span><span></span><span></span>';
    
    typingDiv.appendChild(icon);
    typingDiv.appendChild(typingText);
    chatMessages.appendChild(typingDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function addQuickActions(response) {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'quick-actions';
    
    if (response.includes('skills')) {
        actionsDiv.innerHTML = `
            <button class="quick-action-btn" onclick="setUserSkill('Programming')">Programming</button>
            <button class="quick-action-btn" onclick="setUserSkill('Data Science')">Data Science</button>
            <button class="quick-action-btn" onclick="setUserSkill('Cybersecurity')">Cybersecurity</button>
        `;
    } else if (response.includes('location')) {
        actionsDiv.innerHTML = `
            <button class="quick-action-btn" onclick="setUserLocation('Bangalore')">Bangalore</button>
            <button class="quick-action-btn" onclick="setUserLocation('Mumbai')">Mumbai</button>
            <button class="quick-action-btn" onclick="setUserLocation('Remote')">Remote</button>
        `;
    } else if (response.includes('resume')) {
        actionsDiv.innerHTML = `
            <button class="quick-action-btn" onclick="showResumeTips()">Resume Tips</button>
            <button class="quick-action-btn" onclick="showInterviewPrep()">Interview Prep</button>
        `;
    }
    
    chatMessages.appendChild(actionsDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateSmartBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        if (!userProfile.name) {
            return "Hello! I'm your career assistant. What's your name so I can provide personalized guidance?";
        }
        return `Hi ${userProfile.name}! I'm here to help you find the perfect fresher job. What skills are you interested in?`;
    }
    
    // Name extraction
    if (lowerMessage.includes('my name is') || lowerMessage.includes('i am')) {
        const nameMatch = message.match(/(?:my name is|i am)\s+([a-zA-Z]+)/i);
        if (nameMatch) {
            userProfile.name = nameMatch[1];
            return `Nice to meet you, ${userProfile.name}! What type of role are you looking for? Programming, Data Science, or Cybersecurity?`;
        }
    }
    
    // Skill responses
    if (lowerMessage.includes('programming') || lowerMessage.includes('coding') || lowerMessage.includes('developer')) {
        userProfile.skills.push('Programming');
        return `Great choice! Programming has excellent opportunities for freshers. Are you interested in frontend, backend, or full-stack development?`;
    }
    
    if (lowerMessage.includes('data') || lowerMessage.includes('analytics') || lowerMessage.includes('science')) {
        userProfile.skills.push('Data Science');
        return `Data Science is in high demand! We have junior data analyst and machine learning trainee positions. What's your preferred location?`;
    }
    
    if (lowerMessage.includes('cybersecurity') || lowerMessage.includes('security')) {
        userProfile.skills.push('Cybersecurity');
        return `Cybersecurity is a growing field! We have cybersecurity trainee and security analyst roles. Would you like location-specific recommendations?`;
    }
    
    // Location responses
    if (lowerMessage.includes('bangalore') || lowerMessage.includes('bengaluru')) {
        userProfile.location = 'Bangalore';
        return `Bangalore is amazing for tech freshers! I found 5+ entry-level positions there. Would you like me to show you the best matches?`;
    }
    
    if (lowerMessage.includes('mumbai')) {
        userProfile.location = 'Mumbai';
        return `Mumbai has great opportunities! There are several data science and programming roles. Should I filter jobs for Mumbai?`;
    }
    
    // Help and guidance
    if (lowerMessage.includes('help') || lowerMessage.includes('guide')) {
        return `I can help you with: 1) Finding relevant jobs, 2) Resume tips, 3) Interview preparation, 4) Skill assessment. What would you like to explore?`;
    }
    
    if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
        return `For fresher resumes, focus on: 1) Projects and internships, 2) Technical skills, 3) Academic achievements. Would you like specific resume templates?`;
    }
    
    if (lowerMessage.includes('interview')) {
        return `Interview tips for freshers: 1) Research the company, 2) Practice common questions, 3) Prepare examples of your work. Want mock interview questions?`;
    }
    
    // Job search
    if (lowerMessage.includes('job') || lowerMessage.includes('opportunity') || lowerMessage.includes('position')) {
        if (userProfile.skills.length > 0) {
            return `Based on your interest in ${userProfile.skills.join(', ')}, I found several matching positions. Would you like me to show you the top 3 recommendations?`;
        }
        return `I'd love to help you find jobs! First, tell me what skills you're interested in (Programming, Data Science, or Cybersecurity).`;
    }
    
    // Default responses
    const defaultResponses = [
        "That's interesting! Could you tell me more about what you're looking for?",
        "I'm here to help with your career journey. What specific questions do you have?",
        "Let me guide you better. Are you looking for job recommendations, resume help, or interview tips?",
        "I can provide personalized advice. What's your current skill level and interests?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Interactive functions for quick actions
function setUserSkill(skill) {
    userProfile.skills.push(skill);
    addMessageToChat(`I'm interested in ${skill}`, 'user');
    const response = generateSmartBotResponse(`I want to work in ${skill}`);
    addMessageToChat(response, 'bot');
}

function setUserLocation(location) {
    userProfile.location = location;
    addMessageToChat(`I prefer ${location}`, 'user');
    const response = generateSmartBotResponse(`I want jobs in ${location}`);
    addMessageToChat(response, 'bot');
}

function showResumeTips() {
    const tips = `📝 **Fresher Resume Tips:**
1. Highlight academic projects and internships
2. List technical skills prominently
3. Include GitHub/portfolio links
4. Keep it to 1 page maximum
5. Use action verbs and quantify achievements`;
    addMessageToChat(tips, 'bot');
}

function showInterviewPrep() {
    const prep = `🎯 **Interview Preparation:**
1. Research the company and role
2. Practice common fresher questions
3. Prepare your "tell me about yourself" answer
4. Have examples ready for behavioral questions
5. Prepare questions to ask the interviewer`;
    addMessageToChat(prep, 'bot');
}

// Profile Management Functions
function loadUserProfile() {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        document.getElementById('userName').value = profile.name || '';
        document.getElementById('userEmail').value = profile.email || '';
        document.getElementById('userPhone').value = profile.phone || '';
        document.getElementById('userLocation').value = profile.location || '';
        document.getElementById('userExperience').value = profile.experience || 'entry';
        document.getElementById('userSkills').value = profile.skills ? profile.skills.join(', ') : '';
        
        // Set checkboxes
        const preferences = profile.preferences || [];
        document.querySelectorAll('input[name="preferences"]').forEach(checkbox => {
            checkbox.checked = preferences.includes(checkbox.value);
        });
        
        // Update global userProfile
        userProfile = { ...userProfile, ...profile };
    }
}

function handleProfileSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(profileForm);
    const preferences = Array.from(document.querySelectorAll('input[name="preferences"]:checked'))
        .map(cb => cb.value);
    
    const profileData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        phone: document.getElementById('userPhone').value,
        location: document.getElementById('userLocation').value,
        experience: document.getElementById('userExperience').value,
        skills: document.getElementById('userSkills').value.split(',').map(s => s.trim()).filter(s => s),
        preferences: preferences,
        createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    
    // Update global userProfile
    userProfile = { ...userProfile, ...profileData };
    
    // Update profile button text
    profileToggle.innerHTML = `<i class="fas fa-user"></i> ${profileData.name}`;
    
    // Close modal
    profileModal.classList.remove('active');
    
    // Show success message
    showSuccessMessage('Profile created successfully! We can now provide personalized recommendations.');
    
    // Personalize chatbot greeting
    if (profileData.name && chatMessages.children.length === 1) {
        addMessageToChat(`Hi ${profileData.name}! I can now provide personalized job recommendations based on your profile.`, 'bot');
    }
}

// Chatbot functionality
async function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessageToChat(message, 'user');
    chatInput.value = '';

    // Show typing indicator
    showTypingIndicator();

    try {
        const response = await getAIResponse(message);
        removeTypingIndicator();
        addMessageToChat(response, 'bot');
    } catch (error) {
        removeTypingIndicator();
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

// Add message to chat
function addMessageToChat(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const icon = sender === 'bot' ? 'fa-robot' : 'fa-user';
    messageDiv.innerHTML = `
        <i class="fas ${icon}"></i>
        <p>${message}</p>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Get AI response from OpenAI API
async function getAIResponse(message) {
    // For demo purposes, return predefined responses
    // In production, you would integrate with OpenAI API here
    const responses = {
        'career': "Career development is a journey! Consider exploring different paths, networking with professionals, and continuously learning new skills. What specific area interests you?",
        'skills': "In-demand skills vary by industry, but currently: Programming (Python, JavaScript), Data Analysis, Cloud Computing, Cybersecurity, and Soft Skills like communication and leadership are highly valued.",
        'resume': "A great resume should be concise, tailored to the job, highlight achievements with metrics, and include relevant keywords. Keep it to 1-2 pages maximum.",
        'interview': "Prepare for interviews by researching the company, practicing common questions, preparing your own questions, and dressing appropriately. Remember to follow up with a thank-you note!",
        'salary': "Research salary ranges for your role and location using sites like Glassdoor or Payscale. Consider factors like experience, education, and company size when negotiating.",
        'default': "That's a great question! As an AI Career Guide, I can help you with career paths, skill development, resume writing, interview preparation, salary negotiation, and job search strategies. What specific topic would you like to explore?"
    };

    const lowerMessage = message.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            return response;
        }
    }
    
    return responses.default;
}

// Error handling
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
    `;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add CSS for typing indicator and error message
const style = document.createElement('style');
style.textContent = `
    .typing-dots {
        display: flex;
        gap: 4px;
        padding: 0.75rem;
        background: #f8f9fa;
        border-radius: 10px;
    }
    
    .typing-dots span {
        width: 8px;
        height: 8px;
        background: #667eea;
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-dots span:nth-child(1) {
        animation-delay: -0.32s;
    }
    
    .typing-dots span:nth-child(2) {
        animation-delay: -0.16s;
    }
    
    @keyframes typing {
        0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
        }
        40% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Auto-update filters based on selections
function autoUpdateFilters() {
    const experience = experienceFilter.value;
    const jobType = jobTypeFilter.value;
    
    // Auto-update job type based on experience
    if (experience === 'No Experience' || experience === 'Trainee') {
        if (jobType !== 'internship' && jobType !== 'trainee' && jobType !== '') {
            jobTypeFilter.value = experience === 'No Experience' ? 'internship' : 'trainee';
        }
    }
    
    // Auto-update experience based on job type
    if (jobType === 'internship' && experience !== 'No Experience') {
        experienceFilter.value = 'No Experience';
    } else if (jobType === 'trainee' && experience !== 'Trainee') {
        experienceFilter.value = 'Trainee';
    }
    
    // Update salary filter options based on job type
    updateSalaryOptions(jobType);
    
    // Update job type and experience counts display
    updateJobTypeCounts();
    updateExperienceCounts();
}

// Update job type counts display
function updateJobTypeCounts() {
    const allJobs = jobs;
    const jobTypeCounts = {};
    
    // Count jobs by type
    allJobs.forEach(job => {
        const type = job.type || 'Unknown';
        jobTypeCounts[type] = (jobTypeCounts[type] || 0) + 1;
    });
    
    // Update job type filter with counts
    const currentJobType = jobTypeFilter.value;
    const jobTypeOptions = Object.keys(jobTypeCounts).sort();
    
    let jobTypeHTML = '<option value="">All Types (' + allJobs.length + ')</option>';
    
    jobTypeOptions.forEach(type => {
        const count = jobTypeCounts[type] || 0;
        const selected = currentJobType === type ? 'selected' : '';
        jobTypeHTML += `<option value="${type.toLowerCase()}" ${selected}>${type} (${count})</option>`;
    });
    
    jobTypeFilter.innerHTML = jobTypeHTML;
    
    // Update job type counts display
    const totalJobs = Object.values(jobTypeCounts).reduce((sum, count) => sum + count, 0);
    const jobTypeCountsElement = document.getElementById('jobTypeCounts');
    if (jobTypeCountsElement) {
        jobTypeCountsElement.innerHTML = `<span class="count-badge">${totalJobs}</span>`;
    }
}

// Update experience level counts display
function updateExperienceCounts() {
    const allJobs = jobs;
    const experienceCounts = {};
    
    // Count jobs by experience level
    allJobs.forEach(job => {
        const experience = job.experience || 'Unknown';
        experienceCounts[experience] = (experienceCounts[experience] || 0) + 1;
    });
    
    // Update experience filter with counts
    const currentExperience = experienceFilter.value;
    const experienceOptions = Object.keys(experienceCounts).sort();
    
    let experienceHTML = '<option value="">All Experience (' + allJobs.length + ')</option>';
    
    experienceOptions.forEach(experience => {
        const count = experienceCounts[experience] || 0;
        const selected = currentExperience === experience ? 'selected' : '';
        experienceHTML += `<option value="${experience}" ${selected}>${experience} (${count})</option>`;
    });
    
    experienceFilter.innerHTML = experienceHTML;
    
    // Update experience counts display
    const totalJobs = Object.values(experienceCounts).reduce((sum, count) => sum + count, 0);
    const experienceCountsElement = document.getElementById('experienceCounts');
    if (experienceCountsElement) {
        experienceCountsElement.innerHTML = `<span class="count-badge">${totalJobs}</span>`;
    }
}

// Update salary options based on job type
function updateSalaryOptions(jobType) {
    const currentSalary = salaryFilter.value;
    const salaryOptions = {
        'internship': [
            { value: '', text: 'All Stipends' },
            { value: '0-15', text: '₹0 - ₹15K/month' },
            { value: '15-25', text: '₹15K - ₹25K/month' },
            { value: '25+', text: '₹25K+/month' }
        ],
        'default': [
            { value: '', text: 'All Salaries' },
            { value: '0-25', text: '₹0 - ₹25K/year' },
            { value: '25-40', text: '₹25K - ₹40K/year' },
            { value: '40-60', text: '₹40K - ₹60K/year' },
            { value: '60+', text: '₹60K+/year' }
        ]
    };
    
    const options = jobType === 'internship' ? salaryOptions['internship'] : salaryOptions['default'];
    
    salaryFilter.innerHTML = options.map(option => 
        `<option value="${option.value}" ${option.value === currentSalary ? 'selected' : ''}>${option.text}</option>`
    ).join('');
}
