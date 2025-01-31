import { createLogger } from '../utils/logger.js';

const logger = createLogger('statusService');

class StatusService {
    constructor() {
        this.statusFlow = [
            'INITIATED',
            'USERNAME_VALIDATED',
            'USER_CREATED',
            'SYSTEM_USER_CREATED',
            'VERIFICATION_SENT',
            'VERIFIED'
        ];
    }

    isValidTransition(currentStatus, newStatus) {
        if (newStatus === 'FAILED') return true;
        
        const currentIndex = this.statusFlow.indexOf(currentStatus);
        const newIndex = this.statusFlow.indexOf(newStatus);
        
        return newIndex === currentIndex + 1;
    }

    async updateStatus(user, newStatus, details = {}) {
        try {
            if (!this.isValidTransition(user.registrationStatus, newStatus)) {
                throw new Error(`Invalid status transition from ${user.registrationStatus} to ${newStatus}`);
            }

            logger.info(`Updating status for user ${user.username} from ${user.registrationStatus} to ${newStatus}`);
            
            return await user.updateStatus(newStatus, {
                lastStep: details.lastStep || user.registrationStatus,
                error: details.error
            });
        } catch (error) {
            logger.error(`Error updating status for user ${user.username}:`, error);
            
            // If there's an error, set status to FAILED
            if (newStatus !== 'FAILED') {
                return await user.updateStatus('FAILED', {
                    lastStep: user.registrationStatus,
                    error: error.message
                });
            }
            throw error;
        }
    }

    getStatusProgress(status) {
        const index = this.statusFlow.indexOf(status);
        if (index === -1) return 0;
        return Math.round((index / (this.statusFlow.length - 1)) * 100);
    }

    getStatusMessage(status) {
        const messages = {
            'INITIATED': 'Registration started',
            'USERNAME_VALIDATED': 'Username is available',
            'USER_CREATED': 'User account created',
            'SYSTEM_USER_CREATED': 'System account setup complete',
            'VERIFICATION_SENT': 'Verification email sent',
            'VERIFIED': 'Registration complete',
            'FAILED': 'Registration failed'
        };
        return messages[status] || 'Unknown status';
    }

    canProceed(status) {
        return !['FAILED', 'INITIATED'].includes(status);
    }
}

export default new StatusService();
