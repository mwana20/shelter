import { TransactionalEmail, AuditLog } from '../types';

const EMAILS_STORAGE_KEY = 'sheltered_transactional_emails';
const AUDIT_STORAGE_KEY = 'sheltered_audit_logs';

export function getStoredEmails(): TransactionalEmail[] {
  try {
    const raw = localStorage.getItem(EMAILS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load stored emails', e);
    return [];
  }
}

export function saveStoredEmails(emails: TransactionalEmail[]): void {
  try {
    localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(emails));
  } catch (e) {
    console.error('Failed to save emails', e);
  }
}

export function getStoredAuditLogs(): AuditLog[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load audit logs', e);
    return [];
  }
}

export function saveStoredAuditLogs(logs: AuditLog[]): void {
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save audit logs', e);
  }
}

export function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
