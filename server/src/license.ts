/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import crypto from 'crypto';

const BANNER = `
╔══════════════════════════════════════════════════════════╗
║             Grocery POS App — Licensed Software         ║
║      Copyright (c) 2026 Ameen Al-Sanabani               ║
║      PolyForm Noncommercial License 1.0.0               ║
╚══════════════════════════════════════════════════════════╝
`;

/**
 * Validates a license key using HMAC-SHA256.
 *
 * The LICENSE_KEY format is: "<payload>.<signature>"
 * - payload: base64-encoded JSON with { licensee, expiresAt }
 * - signature: RSA-SHA256 signature of payload using private key in base64
 *
 * In development mode (NODE_ENV !== 'production'), validation
 * is skipped with a warning so local dev is not blocked.
 */
export function validateLicense(): void {
    console.log(BANNER);

    const env = process.env.NODE_ENV || 'development';

    if (env !== 'production') {
        console.warn(
            '⚠️  License validation skipped (NODE_ENV=%s). ' +
            'Set NODE_ENV=production to enforce license checks.',
            env
        );
        return;
    }

    const licenseKey = process.env.LICENSE_KEY;
    const licensePublicKey = process.env.LICENSE_PUBLIC_KEY;

    if (!licenseKey || !licensePublicKey) {
        console.error(
            '❌ LICENSE_KEY and LICENSE_PUBLIC_KEY must be set in production.\n' +
            '   Contact Ameen Al-Sanabani for a valid license key.'
        );
        process.exit(1);
    }

    const parts = licenseKey.split('.');
    if (parts.length !== 2) {
        console.error('❌ Invalid license key format.');
        process.exit(1);
    }

    const [payload, signature] = parts;

    // Verify RSA signature
    try {
        // Format the public key if it was passed as a single string missing physical newlines
        // Sometimes Docker/systemd eats the actual newlines unless specific formats are used
        const formattedKey = licensePublicKey.includes('-----BEGIN PUBLIC KEY----- ')
            ? licensePublicKey.replace(/-----BEGIN PUBLIC KEY----- /, '-----BEGIN PUBLIC KEY-----\n')
                .replace(/ -----END PUBLIC KEY-----/, '\n-----END PUBLIC KEY-----')
                .replace(/ /g, '\n') // A naive way to put back broken spaces, but usually it works fine if env var handles \n
            : licensePublicKey.replace(/\\n/g, '\n');

        const verify = crypto.createVerify('SHA256');
        verify.update(payload);
        verify.end();

        const isValid = verify.verify(formattedKey, signature, 'base64');

        if (!isValid) {
            console.error('❌ License key signature verification failed (Invalid signature).');
            process.exit(1);
        }
    } catch (e: any) {
        console.error('❌ Missing or invalid LICENSE_PUBLIC_KEY format.', e.message);
        process.exit(1);
    }

    // Decode and check expiry
    try {
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));

        if (decoded.expiresAt && new Date(decoded.expiresAt) < new Date()) {
            console.error('❌ License key has expired. Contact Ameen Al-Sanabani for renewal.');
            process.exit(1);
        }

        console.log(`✅ Licensed to: ${decoded.licensee || 'Unknown'}`);
    } catch {
        console.error('❌ Failed to decode license key payload.');
        process.exit(1);
    }
}

// Key generation moved entirely to scripts/generate-license.ts
// to keep the server code footprint clean and avoid accidentally exposing signing logic.
