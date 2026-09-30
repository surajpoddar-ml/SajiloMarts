/**
 * SajiloMarts Payment QR Configuration Seed Script
 *
 * Seeds the PaymentConfig collection with QR code images for eSewa, Khalti, and MyPay.
 * Run this script after placing the QR images in client/src/assets/payment-qr/
 *
 * Expected files:
 *   - esewa-qr.jpg (eSewa QR - Chandani Kumari Shah, 9703440607)
 *   - khalti-qr.jpg (Khalti QR - Kailash Prasad Shah, 9703440607)
 *   - mypay-qr.jpg (MyPay QR - Kailash Prasad Shah, 9703440607)
 *
 * Usage: node server/src/scripts/seedPaymentQR.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment. Please set it in server/.env');
  process.exit(1);
}

// Import model after env is loaded
const PaymentConfigSchema = new mongoose.Schema({
  provider: { type: String, required: true, unique: true },
  qrImageData: { type: String, default: null },
  instructions: { type: String, default: null },
  accountName: { type: String, default: null },
  accountNumber: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  configuredBy: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true, collection: 'payment_configs' });

const PaymentConfig = mongoose.model('PaymentConfig', PaymentConfigSchema);

const QR_DIR = path.resolve(__dirname, '../../../client/src/assets/payment-qr');

const CONFIGS = [
  {
    provider: 'esewa',
    filename: 'esewa-qr.jpg',
    accountName: 'Chandani Kumari Shah',
    accountNumber: '9703440607',
    instructions: 'Open your eSewa Mobile App. Scan the SajiloMarts payment QR or search by account number. Enter the exact payment amount. Include your Sourcing Request Reference in remarks. Complete payment and copy the Transaction Code / Reference ID. Attach the payment receipt screenshot and submit.',
  },
  {
    provider: 'khalti',
    filename: 'khalti-qr.jpg',
    accountName: 'Kailash Prasad Shah',
    accountNumber: '9703440607',
    instructions: 'Open your Khalti Mobile App. Tap Send Money or Scan QR. Transfer the exact amount to SajiloMarts. Include your Sourcing Request Reference in remarks. Save payment proof and copy your Khalti Transaction ID. Enter transaction ID and upload screenshot.',
  },
  {
    provider: 'mypay',
    filename: 'mypay-qr.jpg',
    accountName: 'Kailash Prasad Shah',
    accountNumber: '9703440607',
    instructions: 'Open your MyPay Wallet App. Select Wallet Transfer or QR Pay. Input the exact payable amount. Include your Sourcing Request Reference in remarks. Save payment proof and copy the MyPay Reference Code. Enter the reference code and upload screenshot.',
  },
];

async function seedPaymentQR() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const config of CONFIGS) {
      const qrPath = path.join(QR_DIR, config.filename);
      let qrImageData = null;

      if (fs.existsSync(qrPath)) {
        const imageBuffer = fs.readFileSync(qrPath);
        const ext = path.extname(config.filename).replace('.', '');
        const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        qrImageData = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
        console.log(`📷 Loaded QR image for ${config.provider}: ${config.filename} (${imageBuffer.length} bytes)`);
      } else {
        console.warn(`⚠️  QR image not found for ${config.provider}: ${qrPath}`);
        console.warn(`   Place the ${config.filename} file in: ${QR_DIR}`);
      }

      await PaymentConfig.findOneAndUpdate(
        { provider: config.provider },
        {
          $set: {
            provider: config.provider,
            qrImageData,
            instructions: config.instructions,
            accountName: config.accountName,
            accountNumber: config.accountNumber,
            isActive: true,
          },
        },
        { upsert: true, new: true }
      );

      console.log(`✅ ${config.provider.toUpperCase()} configuration seeded${qrImageData ? ' with QR image' : ' (no QR image)'}`);
    }

    console.log('\n🎉 All payment QR configurations seeded successfully!');
    console.log('Configured providers: eSewa, Khalti, MyPay');
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Database connection closed.');
    process.exit(0);
  }
}

seedPaymentQR();
