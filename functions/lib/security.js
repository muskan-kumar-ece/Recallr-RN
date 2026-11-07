"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasValidHmac = hasValidHmac;
exports.getUsagePeriodKey = getUsagePeriodKey;
exports.paymentExpiry = paymentExpiry;
const node_crypto_1 = require("node:crypto");
function hasValidHmac(payload, supplied, secret) {
    if (!secret || !supplied || !/^[a-f0-9]{64}$/i.test(supplied))
        return false;
    const expected = (0, node_crypto_1.createHmac)('sha256', secret).update(payload).digest();
    const provided = Buffer.from(supplied, 'hex');
    return provided.length === expected.length && (0, node_crypto_1.timingSafeEqual)(provided, expected);
}
function getUsagePeriodKey(kind, date, timezone) {
    let parts;
    try {
        parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).formatToParts(date);
    }
    catch {
        parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).formatToParts(date);
    }
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const day = `${values.year}-${values.month}-${values.day}`;
    return kind === 'scan' ? day.slice(0, 7) : day;
}
function paymentExpiry(plan, now) {
    const expires = new Date(now);
    const day = expires.getUTCDate();
    expires.setUTCDate(1);
    if (plan === 'pro_monthly')
        expires.setUTCMonth(expires.getUTCMonth() + 1);
    else
        expires.setUTCFullYear(expires.getUTCFullYear() + 1);
    const lastDay = new Date(Date.UTC(expires.getUTCFullYear(), expires.getUTCMonth() + 1, 0)).getUTCDate();
    expires.setUTCDate(Math.min(day, lastDay));
    return expires.toISOString();
}
//# sourceMappingURL=security.js.map