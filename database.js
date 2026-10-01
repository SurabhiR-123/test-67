// Database Management System
// Simulates JSP/Servlets backend functionality using localStorage

class DatabaseManager {
    constructor() {
        this.initializeDatabase();
    }

    initializeDatabase() {
        // Initialize tables if they don't exist
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        if (!localStorage.getItem('applications')) {
            localStorage.setItem('applications', JSON.stringify([]));
        }
        if (!localStorage.getItem('jobs')) {
            // Jobs are already loaded from careers.json
        }
    }

    // User Management
    createUser(userData) {
        const users = this.getUsers();
        const newUser = {
            id: Date.now(),
            ...userData,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        return newUser;
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email === email);
    }

    getUserById(id) {
        const users = this.getUsers();
        return users.find(user => user.id == id);
    }

    updateUser(id, updateData) {
        const users = this.getUsers();
        const userIndex = users.findIndex(user => user.id == id);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updateData, updatedAt: new Date().toISOString() };
            localStorage.setItem('users', JSON.stringify(users));
            return users[userIndex];
        }
        return null;
    }

    deleteUser(id) {
        const users = this.getUsers();
        const filteredUsers = users.filter(user => user.id != id);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        return true;
    }

    // Authentication
    authenticateUser(email, password) {
        const user = this.getUserByEmail(email);
        if (user && user.password === password) {
            return {
                success: true,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    userType: user.userType,
                    phone: user.phone
                }
            };
        }
        return { success: false, message: 'Invalid email or password' };
    }

    // Job Management
    getJobs() {
        return JSON.parse(localStorage.getItem('jobs') || '{"jobs":[]}').jobs;
    }

    getJobById(id) {
        const jobs = this.getJobs();
        return jobs.find(job => job.id == id);
    }

    createJob(jobData) {
        const jobs = this.getJobs();
        const newJob = {
            id: Date.now(),
            ...jobData,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        jobs.push(newJob);
        localStorage.setItem('jobs', JSON.stringify({ jobs }));
        return newJob;
    }

    updateJob(id, updateData) {
        const jobs = this.getJobs();
        const jobIndex = jobs.findIndex(job => job.id == id);
        if (jobIndex !== -1) {
            jobs[jobIndex] = { ...jobs[jobIndex], ...updateData, updatedAt: new Date().toISOString() };
            localStorage.setItem('jobs', JSON.stringify({ jobs }));
            return jobs[jobIndex];
        }
        return null;
    }

    deleteJob(id) {
        const jobs = this.getJobs();
        const filteredJobs = jobs.filter(job => job.id != id);
        localStorage.setItem('jobs', JSON.stringify({ jobs: filteredJobs }));
        return true;
    }

    // Application Management
    createApplication(applicationData) {
        const applications = this.getApplications();
        const newApplication = {
            id: Date.now(),
            ...applicationData,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };
        applications.push(newApplication);
        localStorage.setItem('applications', JSON.stringify(applications));
        return newApplication;
    }

    getApplications() {
        return JSON.parse(localStorage.getItem('applications') || '[]');
    }

    getApplicationsByUserId(userId) {
        const applications = this.getApplications();
        return applications.filter(app => app.userId == userId);
    }

    getApplicationsByJobId(jobId) {
        const applications = this.getApplications();
        return applications.filter(app => app.jobId == jobId);
    }

    updateApplicationStatus(id, status) {
        const applications = this.getApplications();
        const appIndex = applications.findIndex(app => app.id == id);
        if (appIndex !== -1) {
            applications[appIndex].status = status;
            applications[appIndex].updatedAt = new Date().toISOString();
            localStorage.setItem('applications', JSON.stringify(applications));
            return applications[appIndex];
        }
        return null;
    }

    // Search and Filter
    searchJobs(query, filters = {}) {
        let jobs = this.getJobs();
        
        // Text search
        if (query) {
            const lowerQuery = query.toLowerCase();
            jobs = jobs.filter(job => 
                job.title.toLowerCase().includes(lowerQuery) ||
                job.company.toLowerCase().includes(lowerQuery) ||
                job.location.toLowerCase().includes(lowerQuery) ||
                job.description.toLowerCase().includes(lowerQuery) ||
                job.skills.some(skill => skill.toLowerCase().includes(lowerQuery))
            );
        }

        // Category filter
        if (filters.category) {
            jobs = jobs.filter(job => job.category === filters.category);
        }

        // Location filter
        if (filters.location) {
            jobs = jobs.filter(job => job.location.toLowerCase().includes(filters.location.toLowerCase()));
        }

        // Salary filter
        if (filters.salaryMin) {
            jobs = jobs.filter(job => {
                const salary = parseFloat(job.salary.replace(/[₹,LPA/month]/g, '').trim());
                return salary >= parseFloat(filters.salaryMin);
            });
        }

        if (filters.salaryMax) {
            jobs = jobs.filter(job => {
                const salary = parseFloat(job.salary.replace(/[₹,LPA/month]/g, '').trim());
                return salary <= parseFloat(filters.salaryMax);
            });
        }

        // Experience filter
        if (filters.experience) {
            jobs = jobs.filter(job => job.experience === filters.experience);
        }

        // Job type filter
        if (filters.type) {
            jobs = jobs.filter(job => job.type === filters.type);
        }

        return jobs;
    }

    // Statistics
    getDashboardStats() {
        const users = this.getUsers();
        const jobs = this.getJobs();
        const applications = this.getApplications();

        return {
            totalUsers: users.length,
            totalJobs: jobs.length,
            totalApplications: applications.length,
            pendingApplications: applications.filter(app => app.status === 'pending').length,
            approvedApplications: applications.filter(app => app.status === 'approved').length,
            rejectedApplications: applications.filter(app => app.status === 'rejected').length,
            recentApplications: applications.slice(-5).reverse(),
            popularJobs: this.getPopularJobs(),
            usersByType: this.getUsersByType()
        };
    }

    getPopularJobs() {
        const applications = this.getApplications();
        const jobCounts = {};
        
        applications.forEach(app => {
            jobCounts[app.jobId] = (jobCounts[app.jobId] || 0) + 1;
        });

        const sortedJobs = Object.entries(jobCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([jobId, count]) => {
                const job = this.getJobById(jobId);
                return { ...job, applicationCount: count };
            });

        return sortedJobs;
    }

    getUsersByType() {
        const users = this.getUsers();
        const types = {};
        
        users.forEach(user => {
            types[user.userType] = (types[user.userType] || 0) + 1;
        });

        return types;
    }

    // File Upload Simulation
    saveFile(fileData, fileName, userId) {
        const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
        const fileRecord = {
            id: Date.now(),
            name: fileName,
            type: fileData.type,
            size: fileData.size,
            userId: userId,
            uploadedAt: new Date().toISOString(),
            data: fileData.data // Base64 encoded
        };
        files.push(fileRecord);
        localStorage.setItem('uploadedFiles', JSON.stringify(files));
        return fileRecord;
    }

    getFilesByUserId(userId) {
        const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
        return files.filter(file => file.userId == userId);
    }
}

// Initialize database
const db = new DatabaseManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseManager;
}
