import axios from 'axios';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('systemIntegrationService');

class SystemIntegrationService {
    constructor() {
        this.apiBaseUrl = process.env.API_SERVICE_URL || 'http://localhost:3000/api';
        this.apiClient = axios.create({
            baseURL: this.apiBaseUrl,
            timeout: 10000
        });
    }

    async createSystemUser(userData, authToken) {
        try {
            logger.info(`Requesting system user creation for: ${userData.username}`);
            
            const response = await this.apiClient.post('/users/system', {
                username: userData.username,
                email: userData.systemEmail
            }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            logger.info(`System user created successfully: ${userData.username}`);
            return response.data;

        } catch (error) {
            logger.error(`Failed to create system user: ${error.message}`);
            
            if (error.response) {
                // API responded with error
                throw new Error(error.response.data.message || 'Failed to create system user');
            } else if (error.request) {
                // No response received
                throw new Error('API service is not responding');
            } else {
                throw new Error('Failed to make API request');
            }
        }
    }

    async checkSystemUser(username, authToken) {
        try {
            logger.info(`Checking system user status for: ${username}`);
            
            const response = await this.apiClient.get(`/users/system/${username}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            return response.data;

        } catch (error) {
            logger.error(`Failed to check system user: ${error.message}`);
            throw new Error('Failed to check system user status');
        }
    }

    async removeSystemUser(username, authToken) {
        try {
            logger.info(`Requesting system user removal for: ${username}`);
            
            const response = await this.apiClient.delete(`/users/system/${username}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            logger.info(`System user removed successfully: ${username}`);
            return response.data;

        } catch (error) {
            logger.error(`Failed to remove system user: ${error.message}`);
            throw new Error('Failed to remove system user');
        }
    }
}

export default new SystemIntegrationService();
