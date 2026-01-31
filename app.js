// Student Page Functionality with Timer
class HomeworkSubmission {
    constructor() {
        this.form = document.getElementById('submissionForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.btnText = document.getElementById('btnText');
        this.spinner = document.getElementById('spinner');
        this.successMessage = document.getElementById('successMessage');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        this.timeUpMessage = document.getElementById('timeUpMessage');
        this.solutionTextarea = document.getElementById('solution');
        this.charCount = document.getElementById('charCount');
        this.copyBtn = document.getElementById('copyBtn');
        this.fullNameInput = document.getElementById('fullName');
        
        // Question display elements
        this.questionLoading = document.getElementById('questionLoading');
        this.questionContent = document.getElementById('questionContent');
        this.noActiveQuestion = document.getElementById('noActiveQuestion');
        this.questionTitle = document.getElementById('questionTitle');
        this.questionDescription = document.getElementById('questionDescription');
        this.timerDisplay = document.getElementById('timer');
        this.submissionSection = document.getElementById('submissionSection');
        
        this.maxChars = 10000;
        this.isSubmitting = false;
        this.submittedNames = new Set();
        this.currentQuestion = null;
        this.timerInterval = null;
        this.timeRemaining = 0;
        this.timeExpired = false;
        
        this.init();
    }
    
    init() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Character counter
        this.solutionTextarea.addEventListener('input', () => this.updateCharCounter());
        this.solutionTextarea.addEventListener('input', () => this.autoResizeTextarea());
        
        // Copy button
        this.copyBtn.addEventListener('click', () => this.copyCode());
        
        // Auto-resize on load
        this.autoResizeTextarea();
        
        // Load active question
        this.loadActiveQuestion();
        
        // Check for existing submissions
        this.checkExistingSubmissions();
    }
    
    async loadActiveQuestion() {
        try {
            console.log('Loading active questions...');
            console.log('Firebase db:', db);
            
            // First try to load all questions to debug
            const allQuestions = await db.collection('questions').get();
            console.log('All questions count:', allQuestions.size);
            allQuestions.forEach(doc => {
                console.log('Question:', doc.id, doc.data());
            });
            
            const snapshot = await db.collection('questions')
                .where('status', '==', 'active')
                .get();
            
            console.log('Active questions snapshot:', snapshot.size, 'documents found');
            
            if (snapshot.empty) {
                console.log('No active questions found');
                this.showNoActiveQuestion();
                return;
            }
            
            const doc = snapshot.docs[0];
            this.currentQuestion = {
                id: doc.id,
                ...doc.data()
            };
            
            console.log('Loaded question:', this.currentQuestion);
            this.displayQuestion();
            
        } catch (error) {
            console.error('Error loading question:', error);
            console.error('Error details:', error.message);
            this.showErrorState();
        }
    }
    
    displayQuestion() {
        this.questionLoading.classList.add('hidden');
        this.noActiveQuestion.classList.add('hidden');
        this.questionContent.classList.remove('hidden');
        this.submissionSection.classList.remove('hidden');
        
        this.questionTitle.textContent = this.currentQuestion.title;
        this.questionDescription.textContent = this.currentQuestion.description;
        
        // Start appropriate timer
        if (this.currentQuestion.timerType === 'scheduled') {
            this.startScheduledTimer();
        } else {
            this.startTimer(this.currentQuestion.timerMinutes * 60);
        }
    }
    
    startScheduledTimer() {
        const now = new Date();
        const startTime = this.currentQuestion.startTime.toDate ? 
            this.currentQuestion.startTime.toDate() : 
            new Date(this.currentQuestion.startTime);
        const endTime = this.currentQuestion.endTime.toDate ? 
            this.currentQuestion.endTime.toDate() : 
            new Date(this.currentQuestion.endTime);
        
        if (now < startTime) {
            // Question hasn't started yet
            this.timeRemaining = Math.floor((startTime - now) / 1000);
            this.showWaitingState();
            
            // Check every second if it's time to start
            this.timerInterval = setInterval(() => {
                const currentTime = new Date();
                if (currentTime >= startTime) {
                    clearInterval(this.timerInterval);
                    this.startScheduledTimer(); // Restart with active timer
                } else {
                    this.timeRemaining = Math.floor((startTime - currentTime) / 1000);
                    this.updateWaitingDisplay();
                }
            }, 1000);
            
        } else if (now >= endTime) {
            // Question has ended
            this.timerExpired();
            
        } else {
            // Question is active, show countdown to end
            this.timeRemaining = Math.floor((endTime - now) / 1000);
            this.timeExpired = false;
            
            this.updateTimerDisplay();
            
            this.timerInterval = setInterval(() => {
                const currentTime = new Date();
                this.timeRemaining = Math.floor((endTime - currentTime) / 1000);
                this.updateTimerDisplay();
                
                if (this.timeRemaining <= 0) {
                    this.timerExpired();
                }
            }, 1000);
        }
    }
    
    showWaitingState() {
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'Question Not Started';
        this.solutionTextarea.disabled = true;
        this.fullNameInput.disabled = true;
        
        // Show waiting message instead of form
        this.form.classList.add('hidden');
        this.errorMessage.classList.add('hidden');
        this.successMessage.classList.add('hidden');
        this.timeUpMessage.classList.add('hidden');
        
        // Create waiting message if it doesn't exist
        if (!document.getElementById('waitingMessage')) {
            const waitingDiv = document.createElement('div');
            waitingDiv.id = 'waitingMessage';
            waitingDiv.className = 'waiting-message';
            waitingDiv.innerHTML = `
                <div class="waiting-icon">⏳</div>
                <h3>Question Starting Soon</h3>
                <p>This question will start in: <span id="waitingTime">00:00</span></p>
            `;
            this.submissionSection.appendChild(waitingDiv);
        }
        
        document.getElementById('waitingMessage').classList.remove('hidden');
    }
    
    updateWaitingDisplay() {
        const hours = Math.floor(this.timeRemaining / 3600);
        const minutes = Math.floor((this.timeRemaining % 3600) / 60);
        const seconds = this.timeRemaining % 60;
        
        let display = '';
        if (hours > 0) {
            display = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        const waitingTime = document.getElementById('waitingTime');
        if (waitingTime) {
            waitingTime.textContent = display;
        }
    }
    
    showNoActiveQuestion() {
        this.questionLoading.classList.add('hidden');
        this.questionContent.classList.add('hidden');
        this.submissionSection.classList.add('hidden');
        this.noActiveQuestion.classList.remove('hidden');
        console.log('No active questions - showing empty state');
    }
    
    showErrorState() {
        this.questionLoading.textContent = 'Error loading question. Please refresh the page.';
        console.log('Error state triggered - check Firebase connection and security rules');
    }
    
    startTimer(totalSeconds) {
        this.timeRemaining = totalSeconds;
        this.timeExpired = false;
        
        // Clear any existing timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.timerExpired();
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.timerDisplay.textContent = display;
        
        // Update timer color based on time remaining
        this.timerDisplay.classList.remove('warning', 'danger');
        if (this.timeRemaining <= 60) {
            this.timerDisplay.classList.add('danger');
        } else if (this.timeRemaining <= 300) {
            this.timerDisplay.classList.add('warning');
        }
    }
    
    timerExpired() {
        clearInterval(this.timerInterval);
        this.timeExpired = true;
        
        // Disable form
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'Time Expired';
        this.solutionTextarea.disabled = true;
        this.fullNameInput.disabled = true;
        
        // Hide waiting message if it exists
        const waitingMessage = document.getElementById('waitingMessage');
        if (waitingMessage) {
            waitingMessage.classList.add('hidden');
        }
        
        // Show time up message
        this.form.classList.add('hidden');
        this.errorMessage.classList.add('hidden');
        this.successMessage.classList.add('hidden');
        this.timeUpMessage.classList.remove('hidden');
    }
    
    updateCharCounter() {
        const currentLength = this.solutionTextarea.value.length;
        this.charCount.textContent = currentLength;
        
        if (currentLength > this.maxChars) {
            this.charCount.style.color = '#e74c3c';
        } else if (currentLength > this.maxChars * 0.8) {
            this.charCount.style.color = '#f39c12';
        } else {
            this.charCount.style.color = '#6c757d';
        }
    }
    
    autoResizeTextarea() {
        this.solutionTextarea.style.height = 'auto';
        this.solutionTextarea.style.height = Math.max(200, this.solutionTextarea.scrollHeight) + 'px';
    }
    
    async checkExistingSubmissions() {
        try {
            const snapshot = await db.collection('submissions').get();
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.fullName) {
                    this.submittedNames.add(data.fullName.toLowerCase().trim());
                }
            });
        } catch (error) {
            console.error('Error checking existing submissions:', error);
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting || this.timeExpired) {
            return;
        }
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        // Check for duplicate submission
        const fullName = this.fullNameInput.value.trim().toLowerCase();
        if (this.submittedNames.has(fullName)) {
            this.showError('A submission with this name already exists. Each student can only submit once.');
            return;
        }
        
        this.setSubmittingState(true);
        
        try {
            const formData = {
                fullName: this.fullNameInput.value.trim(),
                questionId: this.currentQuestion.id,
                questionTitle: this.currentQuestion.title,
                solution: this.solutionTextarea.value.trim(),
                timeSubmitted: this.currentQuestion.timerMinutes * 60 - this.timeRemaining,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('submissions').add(formData);
            
            this.submittedNames.add(fullName);
            this.showSuccess();
            this.clearForm();
            
        } catch (error) {
            console.error('Submission error:', error);
            this.showError('Failed to submit your solution. Please check your internet connection and try again.');
        } finally {
            this.setSubmittingState(false);
        }
    }
    
    validateForm() {
        const fullName = this.fullNameInput.value.trim();
        const solution = this.solutionTextarea.value.trim();
        
        if (!fullName) {
            this.showError('Please enter your full name.');
            this.fullNameInput.focus();
            return false;
        }
        
        if (!solution) {
            this.showError('Please provide your C++ solution.');
            this.solutionTextarea.focus();
            return false;
        }
        
        if (solution.length > this.maxChars) {
            this.showError(`Solution is too long. Maximum ${this.maxChars} characters allowed.`);
            this.solutionTextarea.focus();
            return false;
        }
        
        if (this.timeExpired) {
            this.showError('Time has expired. No more submissions are accepted.');
            return false;
        }
        
        return true;
    }
    
    setSubmittingState(isSubmitting) {
        this.isSubmitting = isSubmitting;
        this.submitBtn.disabled = isSubmitting || this.timeExpired;
        
        if (isSubmitting) {
            this.btnText.textContent = 'Submitting...';
            this.spinner.classList.remove('hidden');
        } else {
            this.btnText.textContent = 'Submit Solution';
            this.spinner.classList.add('hidden');
        }
    }
    
    showSuccess() {
        this.form.classList.add('hidden');
        this.errorMessage.classList.add('hidden');
        this.timeUpMessage.classList.add('hidden');
        this.successMessage.classList.remove('hidden');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Hide success message after 5 seconds and show form again
        setTimeout(() => {
            this.successMessage.classList.add('hidden');
            this.form.classList.remove('hidden');
        }, 5000);
    }
    
    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.successMessage.classList.add('hidden');
        this.timeUpMessage.classList.add('hidden');
        
        // Scroll to error message
        this.errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Hide error message after 5 seconds
        setTimeout(() => {
            this.errorMessage.classList.add('hidden');
        }, 5000);
    }
    
    clearForm() {
        this.form.reset();
        this.updateCharCounter();
        this.autoResizeTextarea();
    }
    
    async copyCode() {
        try {
            const code = this.solutionTextarea.value;
            if (!code) {
                this.showError('No code to copy.');
                return;
            }
            
            await navigator.clipboard.writeText(code);
            
            // Show temporary success message
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = 'Copied!';
            this.copyBtn.style.background = '#27ae60';
            
            setTimeout(() => {
                this.copyBtn.textContent = originalText;
                this.copyBtn.style.background = '';
            }, 2000);
            
        } catch (error) {
            console.error('Copy error:', error);
            this.showError('Failed to copy code to clipboard.');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HomeworkSubmission();
});
