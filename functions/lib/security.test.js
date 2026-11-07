"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_crypto_1 = require("node:crypto");
const vitest_1 = require("vitest");
const security_1 = require("./security");
(0, vitest_1.describe)('Firebase function security helpers', () => {
    (0, vitest_1.it)('requires both a configured secret and a valid signature', () => {
        const body = '{"event":"payment.captured"}';
        const secret = 'test-secret';
        const signature = (0, node_crypto_1.createHmac)('sha256', secret).update(body).digest('hex');
        (0, vitest_1.expect)((0, security_1.hasValidHmac)(body, signature, secret)).toBe(true);
        (0, vitest_1.expect)((0, security_1.hasValidHmac)(body, undefined, secret)).toBe(false);
        (0, vitest_1.expect)((0, security_1.hasValidHmac)(body, signature, undefined)).toBe(false);
        (0, vitest_1.expect)((0, security_1.hasValidHmac)(`${body} `, signature, secret)).toBe(false);
    });
    (0, vitest_1.it)('uses the requested local timezone to determine quota periods', () => {
        const timestamp = new Date('2025-01-31T20:00:00.000Z');
        (0, vitest_1.expect)((0, security_1.getUsagePeriodKey)('scan', timestamp, 'Asia/Kolkata')).toBe('2025-02');
        (0, vitest_1.expect)((0, security_1.getUsagePeriodKey)('ai_question', timestamp, 'Asia/Kolkata')).toBe('2025-02-01');
        (0, vitest_1.expect)((0, security_1.getUsagePeriodKey)('ai_question', timestamp, 'invalid/timezone')).toBe('2025-02-01');
    });
    (0, vitest_1.it)('calculates calendar month and year expiry without fixed-day approximations', () => {
        const start = new Date('2024-01-31T12:00:00.000Z');
        (0, vitest_1.expect)((0, security_1.paymentExpiry)('pro_monthly', start)).toBe('2024-02-29T12:00:00.000Z');
        (0, vitest_1.expect)((0, security_1.paymentExpiry)('pro_yearly', start)).toBe('2025-01-31T12:00:00.000Z');
    });
});
//# sourceMappingURL=security.test.js.map