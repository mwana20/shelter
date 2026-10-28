import { logger } from '../../config/logger.js';
import { mediaWorker } from '../workers/mediaWorker.js';

class InMemoryQueue {
  constructor(name) {
    this.name = name;
    this.jobs = [];
    this.isProcessing = false;
  }

  async add(data) {
    this.jobs.push(data);
    logger.debug(`[Queue: ${this.name}] Added job: ${JSON.stringify(data)}`);
    this.process();
    return { id: `job_${Date.now()}` };
  }

  async process() {
    if (this.isProcessing || this.jobs.length === 0) return;
    this.isProcessing = true;
    while (this.jobs.length > 0) {
      const job = this.jobs.shift();
      try {
        await mediaWorker(job);
      } catch (err) {
        logger.error(`[Queue: ${this.name}] Failed to process job: ${err.message}`);
      }
    }
    this.isProcessing = false;
  }
}

export const mediaQueue = new InMemoryQueue('mediaQueue');
