/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 *
 * Script: Generate RSA Keypair & Production License Keys
 * 
 * Usage 1 (Generate Keys): npx ts-node scripts/generate-license.ts --init
 * Usage 2 (Generate Lic):  npx ts-node scripts/generate-license.ts "Customer Name" ./private_key.pem [daysValid]
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function generateKeyPair() {
    console.log('⏳ Generating RSA 4096-bit key pair (this may take a moment)...');

    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    const privPath = path.resolve(process.cwd(), 'private_key.pem');
    const pubPath = path.resolve(process.cwd(), 'public_key.pem');

    fs.writeFileSync(privPath, privateKey);
    fs.writeFileSync(pubPath, publicKey);

    console.log('\n✅ Key Pair Generated Successfully!');
    console.log('══════════════════════════════════════════════════════');
    console.log(`🔒 Private Key: ${privPath}`);
    console.log(`   (Keep this absolutely SECRET. NEVER commit this to GitHub!)`);
    console.log();
    console.log(`🔓 Public Key:  ${pubPath}`);
    console.log(`   (This goes into the customer's .env file as LICENSE_PUBLIC_KEY)`);
    console.log('══════════════════════════════════════════════════════\n');
}

function generateLicenseKey(licensee: string, privateKeyPem: string, validDays: number = 365): string {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validDays);

    const payloadObj = {
        licensee,
        expiresAt: expiresAt.toISOString()
    };

    const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64');

    const sign = crypto.createSign('SHA256');
    sign.update(payload);
    sign.end();

    const signature = sign.sign(privateKeyPem, 'base64');

    return `${payload}.${signature}`;
}

function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error('\n❌ Error: Missing arguments.');
        console.log('\nUsage 1 (Initialize Keypair):');
        console.log('  npx ts-node scripts/generate-license.ts --init');
        console.log('\nUsage 2 (Generate License):');
        console.log('  npx ts-node scripts/generate-license.ts "Customer Name" path/to/private_key.pem [daysValid]');
        console.log('\nExample:');
        console.log('  npx ts-node scripts/generate-license.ts "Ameen Store HQ" ./private_key.pem 365\n');
        process.exit(1);
    }

    if (args[0] === '--init') {
        generateKeyPair();
        process.exit(0);
    }

    if (args.length < 2) {
        console.error('❌ Error: Missing Customer Name or Private Key path.');
        process.exit(1);
    }

    const licensee = args[0];
    const privKeyPath = path.resolve(process.cwd(), args[1]);
    const days = args[2] ? parseInt(args[2], 10) : 365;

    if (isNaN(days) || days <= 0) {
        console.error('\n❌ Error: [daysValid] must be a positive number.\n');
        process.exit(1);
    }

    if (!fs.existsSync(privKeyPath)) {
        console.error(`\n❌ Error: Private key file not found at ${privKeyPath}\n`);
        process.exit(1);
    }

    const privateKeyPem = fs.readFileSync(privKeyPath, 'utf8');

    // Make sure it's a private key
    if (!privateKeyPem.includes('PRIVATE KEY')) {
        console.error('\n❌ Error: The provided file does not appear to be a valid PEM private key.\n');
        process.exit(1);
    }

    try {
        const key = generateLicenseKey(licensee, privateKeyPem, days);

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);

        console.log('\n✅ License Key Generated Successfully!');
        console.log('══════════════════════════════════════════════════════');
        console.log(`👤 Licensee:  ${licensee}`);
        console.log(`⏳ Valid For: ${days} days`);
        console.log(`📅 Expires:   ${expiryDate.toDateString()}`);
        console.log('');
        console.log('🔐 LICENSE_KEY:');
        console.log(key);
        console.log('══════════════════════════════════════════════════════');
        console.log('\nHow to use in production:');
        console.log('1. Set LICENSE_KEY in the customer\'s .env file to the string above.');
        console.log('2. Set LICENSE_PUBLIC_KEY in the customer\'s .env file to the contents of public_key.pem.');
        console.log('   (Note: depending on the server environment, they may need to replace actual newlines with \\n)\n');

    } catch (err: any) {
        console.error(`\n❌ Error generating license: ${err.message}\n`);
        process.exit(1);
    }
}

main();
