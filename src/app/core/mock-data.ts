import { RegistrationSource } from './models';

export const MOCK_SOURCES: RegistrationSource[] = [
  {
    id: '770e8400-e29b-41d4-a716-446655440000',
    displayName: 'Netflix',
    domain: 'netflix.com',
    senderEmail: 'info@mailer.netflix.com',
    category: 'payment',
    confidence: 'high',
    isUrgent: true,
    firstSeen: new Date('2024-01-15'),
    lastSeen: new Date('2026-02-14'),
    frequency: { count: 14, period: 90, pattern: 'monthly' },
    evidence: [{ type: 'urgent-keyword', description: '件名に payment failed が含まれる' }],
    sampleEmails: [{ date: new Date('2026-02-14'), subject: 'Payment Failed', snippet: '...' }],
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440001',
    displayName: 'Notion',
    domain: 'notion.so',
    senderEmail: 'team@mailer.notion.so',
    category: 'newsletter',
    confidence: 'medium',
    isUrgent: false,
    firstSeen: new Date('2025-06-01'),
    lastSeen: new Date('2026-02-13'),
    frequency: { count: 22, period: 90, pattern: 'weekly' },
    evidence: [{ type: 'list-unsubscribe', description: 'List-Unsubscribe が存在' }],
    sampleEmails: [{ date: new Date('2026-02-13'), subject: 'Weekly update', snippet: '...' }],
  },
];
