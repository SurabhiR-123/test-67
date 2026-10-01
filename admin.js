// Admin Dashboard JavaScript
// Simulates JSP/Servlets backend functionality

class AdminDashboard {
    constructor() {
        this.currentPage = 'dashboard';
        this.initializeEventListeners();
        this.loadDashboardData();
    }

    initializeEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.switchPage(page);
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });

        // Job Modal
        document.getElementById('addJobBtn').addEventListener('click', () => {
            this.openJobModal();
        });

        document.getElementById('closeJobModal').addEventListener('click', () => {
            this.closeJobModal();
        });

        document.getElementById('jobForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveJob();
        });

        // Search functionality
        document.getElementById('jobSearch')?.addEventListener('input', (e) => {
            this.searchJobs(e.target.value);
        });

        document.getElementById('userSearch')?.addEventListener('input', (e) => {
            this.searchUsers(e.target.value);
        });

        document.getElementById('applicationSearch')?.addEventListener('input', (e) => {
            this.searchApplications(e.target.value);
        });

        // Application filter
        document.getElementById('applicationFilter')?.addEventListener('change', (e) => {
            this.filterApplications(e.target.value);
        });
    }

    switchPage(page) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Update pages
        document.querySelectorAll('.admin-page').forEach(pageElement => {
            pageElement.classList.remove('active');
        });
        document.getElementById(`${page}-page`).classList.add('active');

        // Update header
        this.updatePageHeader(page);
        this.currentPage = page;

        // Load page data
        this.loadPageData(page);
    }

    updatePageHeader(page) {
        const headers = {
            dashboard: { title: 'Dashboard', description: 'System overview and statistics' },
            jobs: { title: 'Job Management', description: 'Manage job postings and listings' },
            users: { title: 'User Management', description: 'Manage user accounts and permissions' },
            applications: { title: 'Applications', description: 'Review and manage job applications' },
            analytics: { title: 'Analytics', description: 'System analytics and insights' }
        };

        const header = headers[page];
        document.getElementById('pageTitle').textContent = header.title;
        document.getElementById('pageDescription').textContent = header.description;
    }

    loadPageData(page) {
        switch (page) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'jobs':
                this.loadJobsData();
                break;
            case 'users':
                this.loadUsersData();
                break;
            case 'applications':
                this.loadApplicationsData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
        }
    }

    loadDashboardData() {
        const stats = db.getDashboardStats();
        
        // Update statistics
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('totalJobs').textContent = stats.totalJobs;
        document.getElementById('totalApplications').textContent = stats.totalApplications;
        document.getElementById('pendingApplications').textContent = stats.pendingApplications;

        // Load recent applications
        this.renderRecentApplications(stats.recentApplications);
        
        // Load popular jobs
        this.renderPopularJobs(stats.popularJobs);
    }

    renderRecentApplications(applications) {
        const container = document.getElementById('recentApplications');
        if (!applications || applications.length === 0) {
            container.innerHTML = '<p>No recent applications</p>';
            return;
        }

        container.innerHTML = applications.map(app => {
            const user = db.getUserById(app.userId);
            const job = db.getJobById(app.jobId);
            
            return `
                <div class="application-item">
                    <div class="application-info">
                        <h4>${user?.firstName + ' ' + user?.lastName || 'Unknown User'}</h4>
                        <p>Applied for: ${job?.title || 'Unknown Job'}</p>
                        <small>${new Date(app.createdAt).toLocaleDateString()}</small>
                    </div>
                    <div class="application-status">
                        <span class="status-badge ${app.status}">${app.status}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderPopularJobs(jobs) {
        const container = document.getElementById('popularJobs');
        if (!jobs || jobs.length === 0) {
            container.innerHTML = '<p>No job applications yet</p>';
            return;
        }

        container.innerHTML = jobs.map(job => `
            <div class="popular-job-item">
                <div class="job-info">
                    <h4>${job.title}</h4>
                    <p>${job.company}</p>
                </div>
                <div class="job-stats">
                    <span class="application-count">${job.applicationCount} applications</span>
                </div>
            </div>
        `).join('');
    }

    loadJobsData() {
        const jobs = db.getJobs();
        this.renderJobsTable(jobs);
    }

    renderJobsTable(jobs) {
        const tbody = document.getElementById('jobsTableBody');
        if (!tbody) return;

        tbody.innerHTML = jobs.map(job => `
            <tr>
                <td>${job.id}</td>
                <td>${job.title}</td>
                <td>${job.company}</td>
                <td>${job.location}</td>
                <td><span class="category-badge">${job.category}</span></td>
                <td>${db.getApplicationsByJobId(job.id).length}</td>
                <td><span class="status-badge ${job.isActive ? 'active' : 'inactive'}">${job.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <button class="btn-action edit" onclick="admin.editJob(${job.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete" onclick="admin.deleteJob(${job.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    loadUsersData() {
        const users = db.getUsers();
        this.renderUsersTable(users);
    }

    renderUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.firstName + ' ' + user.lastName}</td>
                <td>${user.email}</td>
                <td><span class="user-type-badge">${user.userType}</span></td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td><span class="status-badge ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <button class="btn-action edit" onclick="admin.editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete" onclick="admin.deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    loadApplicationsData() {
        const applications = db.getApplications();
        this.renderApplicationsTable(applications);
    }

    renderApplicationsTable(applications) {
        const tbody = document.getElementById('applicationsTableBody');
        if (!tbody) return;

        tbody.innerHTML = applications.map(app => {
            const user = db.getUserById(app.userId);
            const job = db.getJobById(app.jobId);
            
            return `
                <tr>
                    <td>${app.id}</td>
                    <td>${user?.firstName + ' ' + user?.lastName || 'Unknown User'}</td>
                    <td>${job?.title || 'Unknown Job'}</td>
                    <td>${job?.company || 'Unknown'}</td>
                    <td>${new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                        <select class="status-select" onchange="admin.updateApplicationStatus(${app.id}, this.value)">
                            <option value="pending" ${app.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="approved" ${app.status === 'approved' ? 'selected' : ''}>Approved</option>
                            <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn-action view" onclick="admin.viewApplication(${app.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    loadAnalyticsData() {
        // This would typically include chart rendering
        // For now, we'll just load the top companies
        this.loadTopCompanies();
    }

    loadTopCompanies() {
        const jobs = db.getJobs();
        const companyCounts = {};
        
        jobs.forEach(job => {
            companyCounts[job.company] = (companyCounts[job.company] || 0) + 1;
        });

        const sortedCompanies = Object.entries(companyCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        const container = document.getElementById('topCompanies');
        if (!container) return;

        container.innerHTML = sortedCompanies.map(([company, count]) => `
            <div class="company-item">
                <span class="company-name">${company}</span>
                <span class="job-count">${count} jobs</span>
            </div>
        `).join('');
    }

    // Job Management
    openJobModal(jobId = null) {
        const modal = document.getElementById('jobModal');
        const title = document.getElementById('jobModalTitle');
        
        if (jobId) {
            const job = db.getJobById(jobId);
            if (job) {
                title.textContent = 'Edit Job';
                this.populateJobForm(job);
                this.editingJobId = jobId;
            }
        } else {
            title.textContent = 'Add New Job';
            this.clearJobForm();
            this.editingJobId = null;
        }
        
        modal.classList.add('active');
    }

    closeJobModal() {
        document.getElementById('jobModal').classList.remove('active');
        this.clearJobForm();
        this.editingJobId = null;
    }

    populateJobForm(job) {
        document.getElementById('jobTitle').value = job.title || '';
        document.getElementById('jobCompany').value = job.company || '';
        document.getElementById('jobLocation').value = job.location || '';
        document.getElementById('jobCategory').value = job.category || '';
        document.getElementById('jobType').value = job.type || '';
        document.getElementById('jobExperience').value = job.experience || '';
        document.getElementById('jobSalary').value = job.salary || '';
        document.getElementById('jobSkills').value = job.skills ? job.skills.join(', ') : '';
        document.getElementById('jobDescription').value = job.description || '';
    }

    clearJobForm() {
        document.getElementById('jobForm').reset();
    }

    saveJob() {
        const jobData = {
            title: document.getElementById('jobTitle').value,
            company: document.getElementById('jobCompany').value,
            location: document.getElementById('jobLocation').value,
            category: document.getElementById('jobCategory').value,
            type: document.getElementById('jobType').value,
            experience: document.getElementById('jobExperience').value,
            salary: document.getElementById('jobSalary').value,
            skills: document.getElementById('jobSkills').value.split(',').map(s => s.trim()).filter(s => s),
            description: document.getElementById('jobDescription').value,
            logo: `https://picsum.photos/seed/${Date.now()}/100/100.jpg`
        };

        if (this.editingJobId) {
            db.updateJob(this.editingJobId, jobData);
        } else {
            db.createJob(jobData);
        }

        this.closeJobModal();
        this.loadJobsData();
    }

    editJob(jobId) {
        this.openJobModal(jobId);
    }

    deleteJob(jobId) {
        if (confirm('Are you sure you want to delete this job?')) {
            db.deleteJob(jobId);
            this.loadJobsData();
        }
    }

    // User Management
    editUser(userId) {
        // Implementation for user editing
        console.log('Edit user:', userId);
    }

    deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            db.deleteUser(userId);
            this.loadUsersData();
        }
    }

    // Application Management
    updateApplicationStatus(appId, status) {
        db.updateApplicationStatus(appId, status);
    }

    viewApplication(appId) {
        // Implementation for viewing application details
        console.log('View application:', appId);
    }

    // Search and Filter
    searchJobs(query) {
        const jobs = db.searchJobs(query);
        this.renderJobsTable(jobs);
    }

    searchUsers(query) {
        const users = db.getUsers().filter(user => 
            user.firstName.toLowerCase().includes(query.toLowerCase()) ||
            user.lastName.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        );
        this.renderUsersTable(users);
    }

    searchApplications(query) {
        const applications = db.getApplications().filter(app => {
            const user = db.getUserById(app.userId);
            const job = db.getJobById(app.jobId);
            return (user?.firstName + ' ' + user?.lastName).toLowerCase().includes(query.toLowerCase()) ||
                   job?.title.toLowerCase().includes(query.toLowerCase());
        });
        this.renderApplicationsTable(applications);
    }

    filterApplications(status) {
        if (status === 'all') {
            this.loadApplicationsData();
        } else {
            const applications = db.getApplications().filter(app => app.status === status);
            this.renderApplicationsTable(applications);
        }
    }
}

// Initialize admin dashboard
const admin = new AdminDashboard();

// Check if user is logged in and is admin
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!currentUser.isLoggedIn || currentUser.userType !== 'admin') {
        // Redirect to login if not admin
        window.location.href = 'login.html';
        return;
    }
});
