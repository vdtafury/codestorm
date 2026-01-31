// Admin Dashboard Functionality with Question Management
class AdminDashboard {
    constructor() {
        this.questions = [];
        this.submissions = [];
        this.filteredSubmissions = [];
        
        // Tab elements
        this.questionsTab = document.getElementById('questionsTab');
        this.submissionsTab = document.getElementById('submissionsTab');
        this.questionsSection = document.getElementById('questionsSection');
        this.submissionsSection = document.getElementById('submissionsSection');
        
        // Question management elements
        this.addQuestionBtn = document.getElementById('addQuestionBtn');
        this.questionForm = document.getElementById('questionForm');
        this.createQuestionForm = document.getElementById('createQuestionForm');
        this.cancelQuestionBtn = document.getElementById('cancelQuestionBtn');
        this.questionsContainer = document.getElementById('questionsContainer');
        this.timerType = document.getElementById('timerType');
        this.scheduledTimeFields = document.getElementById('scheduledTimeFields');
        this.startTime = document.getElementById('startTime');
        this.endTime = document.getElementById('endTime');
        
        // Submissions elements
        this.searchInput = document.getElementById('searchInput');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.submissionsBody = document.getElementById('submissionsBody');
        this.noSubmissions = document.getElementById('noSubmissions');
        
        // Modal elements
        this.solutionModal = document.getElementById('solutionModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalName = document.getElementById('modalName');
        this.modalProblem = document.getElementById('modalProblem');
        this.modalTime = document.getElementById('modalTime');
        this.modalCode = document.getElementById('modalCode');
        this.closeModal = document.getElementById('closeModal');
        this.modalCopyBtn = document.getElementById('modalCopyBtn');
        
        this.init();
    }
    
    init() {
        // Tab switching
        this.questionsTab.addEventListener('click', () => this.switchTab('questions'));
        this.submissionsTab.addEventListener('click', () => this.switchTab('submissions'));
        
        // Question management
        this.addQuestionBtn.addEventListener('click', () => this.showQuestionForm());
        this.cancelQuestionBtn.addEventListener('click', () => this.hideQuestionForm());
        this.createQuestionForm.addEventListener('submit', (e) => this.handleCreateQuestion(e));
        this.timerType.addEventListener('change', () => this.handleTimerTypeChange());
        
        // Submissions
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.refreshBtn.addEventListener('click', () => this.loadSubmissions());
        this.exportBtn.addEventListener('click', () => this.exportToCSV());
        
        // Modal
        this.closeModal.addEventListener('click', () => this.closeModalHandler());
        this.modalCopyBtn.addEventListener('click', () => this.copyModalCode());
        
        // Close modal on background click
        this.solutionModal.addEventListener('click', (e) => {
            if (e.target === this.solutionModal) {
                this.closeModalHandler();
            }
        });
        
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.solutionModal.classList.contains('hidden')) {
                this.closeModalHandler();
            }
        });
        
        // Load initial data
        this.loadQuestions();
        this.loadSubmissions();
    }
    
    switchTab(tab) {
        if (tab === 'questions') {
            this.questionsTab.classList.add('active');
            this.submissionsTab.classList.remove('active');
            this.questionsSection.classList.remove('hidden');
            this.submissionsSection.classList.add('hidden');
        } else {
            this.questionsTab.classList.remove('active');
            this.submissionsTab.classList.add('active');
            this.questionsSection.classList.add('hidden');
            this.submissionsSection.classList.remove('hidden');
        }
    }
    
    async loadQuestions() {
        try {
            console.log('Loading questions for admin...');
            const snapshot = await db.collection('questions')
                .get();
            
            console.log('Admin questions snapshot:', snapshot.size, 'documents found');
            
            this.questions = [];
            snapshot.forEach(doc => {
                const questionData = {
                    id: doc.id,
                    ...doc.data()
                };
                console.log('Admin question:', questionData);
                this.questions.push(questionData);
            });
            
            // Sort locally if createdAt is missing
            this.questions.sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return b.createdAt.toDate() - a.createdAt.toDate();
                }
                return 0;
            });
            
            this.renderQuestions();
            
        } catch (error) {
            console.error('Error loading questions:', error);
            this.questionsContainer.innerHTML = '<div class="loading-text">Error loading questions. Please refresh.</div>';
        }
    }
    
    renderQuestions() {
        if (this.questions.length === 0) {
            this.questionsContainer.innerHTML = '<div class="loading-text">No questions created yet.</div>';
            return;
        }
        
        const html = this.questions.map(question => {
            const timerInfo = question.timerType === 'scheduled' 
                ? `📅 ${this.formatDateTime(question.startTime)} - ${this.formatDateTime(question.endTime)}`
                : `⏱️ ${question.timerMinutes} minutes`;
            
            return `
                <div class="question-card ${question.status === 'inactive' ? 'inactive' : ''}">
                    <div class="question-header">
                        <div>
                            <div class="question-title">${this.escapeHtml(question.title)}</div>
                            <span class="question-status ${question.status}">
                                ${question.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                    <div class="question-description">
                        ${this.escapeHtml(question.description)}
                    </div>
                    <div class="question-meta">
                        <div class="timer-info">
                            ${timerInfo}
                            <br><small>Type: ${question.timerType === 'scheduled' ? 'Scheduled' : 'Countdown'}</small>
                        </div>
                        <div class="question-actions">
                            ${question.status === 'active' 
                                ? `<button class="btn btn-secondary btn-small" onclick="adminDashboard.toggleQuestionStatus('${question.id}', 'inactive')">
                                    Deactivate
                                   </button>`
                                : `<button class="btn btn-primary btn-small" onclick="adminDashboard.toggleQuestionStatus('${question.id}', 'active')">
                                    Activate
                                   </button>`
                            }
                            <button class="btn btn-danger btn-small" onclick="adminDashboard.deleteQuestion('${question.id}')">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        this.questionsContainer.innerHTML = html;
    }
    
    formatDateTime(date) {
        if (!date) return 'N/A';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    showQuestionForm() {
        this.questionForm.classList.remove('hidden');
        this.addQuestionBtn.classList.add('hidden');
    }
    
    hideQuestionForm() {
        this.questionForm.classList.add('hidden');
        this.addQuestionBtn.classList.remove('hidden');
        this.createQuestionForm.reset();
    }
    
    handleTimerTypeChange() {
        if (this.timerType.value === 'scheduled') {
            this.scheduledTimeFields.classList.remove('hidden');
            // Set default times (current time + 1 hour to current time + 1.5 hours)
            const now = new Date();
            const defaultStart = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
            const defaultEnd = new Date(now.getTime() + 90 * 60 * 1000); // +1.5 hours
            
            this.startTime.value = this.formatDateTimeLocal(defaultStart);
            this.endTime.value = this.formatDateTimeLocal(defaultEnd);
        } else {
            this.scheduledTimeFields.classList.add('hidden');
        }
    }
    
    formatDateTimeLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    async handleCreateQuestion(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('questionTitle').value.trim(),
            description: document.getElementById('questionDescription').value.trim(),
            timerMinutes: parseInt(document.getElementById('timerMinutes').value),
            timerType: this.timerType.value,
            status: document.getElementById('questionStatus').value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Add scheduled times if selected
        if (formData.timerType === 'scheduled') {
            formData.startTime = new Date(this.startTime.value);
            formData.endTime = new Date(this.endTime.value);
        }
        
        try {
            await db.collection('questions').add(formData);
            this.hideQuestionForm();
            this.loadQuestions();
            this.showToast('Question created successfully!');
            
        } catch (error) {
            console.error('Error creating question:', error);
            this.showToast('Failed to create question', 'error');
        }
    }
    
    async toggleQuestionStatus(questionId, newStatus) {
        try {
            await db.collection('questions').doc(questionId).update({
                status: newStatus
            });
            
            this.loadQuestions();
            this.showToast(`Question ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
            
        } catch (error) {
            console.error('Error updating question status:', error);
            this.showToast('Failed to update question status', 'error');
        }
    }
    
    async deleteQuestion(questionId) {
        if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
            return;
        }
        
        try {
            // Handle test question differently
            if (questionId === 'test') {
                console.log('Deleting test question from local state');
                this.questions = this.questions.filter(q => q.id !== 'test');
                this.renderQuestions();
                this.showToast('Test question removed successfully!');
                return;
            }
            
            await db.collection('questions').doc(questionId).delete();
            this.loadQuestions();
            this.showToast('Question deleted successfully!');
            
        } catch (error) {
            console.error('Error deleting question:', error);
            this.showToast('Failed to delete question', 'error');
        }
    }
    
    async loadSubmissions() {
        try {
            this.showLoadingState();
            
            const snapshot = await db.collection('submissions')
                .orderBy('createdAt', 'desc')
                .get();
            
            this.submissions = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                this.submissions.push({
                    id: doc.id,
                    ...data,
                    timestamp: data.createdAt ? data.createdAt.toDate() : new Date()
                });
            });
            
            this.filteredSubmissions = [...this.submissions];
            this.renderSubmissions();
            
        } catch (error) {
            console.error('Error loading submissions:', error);
            this.showErrorState();
        }
    }
    
    handleSearch() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredSubmissions = [...this.submissions];
        } else {
            this.filteredSubmissions = this.submissions.filter(submission => 
                submission.fullName.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderSubmissions();
    }
    
    renderSubmissions() {
        if (this.filteredSubmissions.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.noSubmissions.classList.add('hidden');
        
        const html = this.filteredSubmissions.map(submission => `
            <tr>
                <td>
                    <strong>${this.escapeHtml(submission.fullName)}</strong>
                </td>
                <td>
                    <div class="problem-text" title="${this.escapeHtml(submission.questionTitle || 'Unknown')}">
                        ${this.escapeHtml(submission.questionTitle || 'Unknown')}
                    </div>
                </td>
                <td>
                    <div class="solution-text" title="${this.escapeHtml(submission.solution)}">
                        ${this.escapeHtml(submission.solution.substring(0, 100))}${submission.solution.length > 100 ? '...' : ''}
                    </div>
                </td>
                <td>
                    <div class="time-text">
                        ${this.formatDate(submission.timestamp)}
                        ${submission.timeSubmitted ? `<br><small>Took ${submission.timeSubmitted}s</small>` : ''}
                    </div>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-secondary btn-small" onclick="adminDashboard.viewSolution('${submission.id}')">
                            View
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="adminDashboard.copySolution('${submission.id}')">
                            Copy
                        </button>
                        <button class="btn btn-danger btn-small" onclick="adminDashboard.deleteSubmission('${submission.id}')">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        this.submissionsBody.innerHTML = html;
    }
    
    viewSolution(submissionId) {
        const submission = this.submissions.find(s => s.id === submissionId);
        if (!submission) return;
        
        this.modalName.textContent = submission.fullName;
        this.modalProblem.textContent = submission.questionTitle || 'Unknown Question';
        this.modalTime.textContent = this.formatDate(submission.timestamp);
        this.modalCode.textContent = submission.solution;
        
        this.solutionModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    async copySolution(submissionId) {
        const submission = this.submissions.find(s => s.id === submissionId);
        if (!submission) return;
        
        try {
            await navigator.clipboard.writeText(submission.solution);
            this.showToast('Solution copied to clipboard!');
        } catch (error) {
            console.error('Copy error:', error);
            this.showToast('Failed to copy solution', 'error');
        }
    }
    
    async copyModalCode() {
        try {
            const code = this.modalCode.textContent;
            await navigator.clipboard.writeText(code);
            
            const originalText = this.modalCopyBtn.textContent;
            this.modalCopyBtn.textContent = 'Copied!';
            this.modalCopyBtn.style.background = '#27ae60';
            
            setTimeout(() => {
                this.modalCopyBtn.textContent = originalText;
                this.modalCopyBtn.style.background = '';
            }, 2000);
            
        } catch (error) {
            console.error('Copy error:', error);
            this.showToast('Failed to copy code', 'error');
        }
    }
    
    async deleteSubmission(submissionId) {
        const submission = this.submissions.find(s => s.id === submissionId);
        if (!submission) return;
        
        if (!confirm(`Are you sure you want to delete the submission from "${submission.fullName}"?`)) {
            return;
        }
        
        try {
            await db.collection('submissions').doc(submissionId).delete();
            
            // Remove from local arrays
            this.submissions = this.submissions.filter(s => s.id !== submissionId);
            this.filteredSubmissions = this.filteredSubmissions.filter(s => s.id !== submissionId);
            
            this.renderSubmissions();
            this.showToast('Submission deleted successfully!');
            
        } catch (error) {
            console.error('Delete error:', error);
            this.showToast('Failed to delete submission', 'error');
        }
    }
    
    closeModalHandler() {
        this.solutionModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    
    exportToCSV() {
        if (this.filteredSubmissions.length === 0) {
            this.showToast('No submissions to export', 'error');
            return;
        }
        
        const headers = ['Name', 'Question', 'Solution', 'Submission Date', 'Time Taken (seconds)'];
        const rows = this.filteredSubmissions.map(submission => [
            submission.fullName,
            submission.questionTitle || 'Unknown',
            submission.solution,
            this.formatDate(submission.timestamp, 'csv'),
            submission.timeSubmitted || 'N/A'
        ]);
        
        let csvContent = headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${this.escapeCsv(cell)}"`).join(',') + '\n';
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `submissions_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('CSV exported successfully!');
    }
    
    showLoadingState() {
        this.submissionsBody.innerHTML = '<tr class="loading-row"><td colspan="5">Loading submissions...</td></tr>';
        this.noSubmissions.classList.add('hidden');
    }
    
    showEmptyState() {
        this.submissionsBody.innerHTML = '';
        this.noSubmissions.classList.remove('hidden');
    }
    
    showErrorState() {
        this.submissionsBody.innerHTML = '<tr class="loading-row"><td colspan="5">Error loading submissions. Please try again.</td></tr>';
        this.noSubmissions.classList.add('hidden');
    }
    
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 2000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${type === 'success' ? 'background: #27ae60;' : 'background: #e74c3c;'}
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    formatDate(date, format = 'display') {
        if (!date) return 'N/A';
        
        const d = new Date(date);
        
        if (format === 'csv') {
            return d.toISOString();
        }
        
        return d.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    escapeCsv(text) {
        return text.replace(/"/g, '""').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});
