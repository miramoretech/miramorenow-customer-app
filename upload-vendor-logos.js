import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration (use your anon key – it's safe for this script)
const supabaseUrl = 'https://dxwmzkvhckjzacfozgrv.supabase.co';
const supabaseAnonKey = 'sb_publishable_ZSq1MxnQI2mwN-SrrwdIRw_fJgi-DUT';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Map vendor names to local image file paths (adjust these paths to match your actual files)
// If your images are in a different folder, change the path accordingly.
const vendorImages = [
  { name: 'Amala Oriki', file: 'src/assets/vendors/amala-oriki-logo.png' },
  { name: 'Cravings by K.O.L', file: 'src/assets/vendors/cravings-logo.png' },
  { name: 'Yoghurt_Arcade', file: 'src/assets/vendors/yoghurt-arcade-logo.png' },
  { name: 'Mr. Good Grill Resto', file: 'src/assets/vendors/mr-good-grill-logo.png' },
  { name: 'Hair & Locs_by_Effa', file: 'src/assets/vendors/hair-locs-logo.png' },
];

async function uploadLogo(vendorName, filePath) {
  try {
    // Resolve absolute path
    const fullPath = path.resolve(__dirname, filePath);
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ File not found: ${fullPath} – skipping ${vendorName}`);
      return;
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(fullPath);
    // Create a safe file name (no spaces or special characters)
    const fileName = `${vendorName.replace(/[^a-z0-9]/gi, '_')}.png`;

    // Upload to Supabase Storage bucket 'vendor-logos'
    const { error: uploadError } = await supabase.storage
      .from('vendor-logos')
      .upload(fileName, fileBuffer, { upsert: true, contentType: 'image/png' });
    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from('vendor-logos').getPublicUrl(fileName);

    // Update the vendors table
    const { error: updateError } = await supabase
      .from('vendors')
      .update({ store_logo_url: publicUrl })
      .eq('store_name', vendorName);
    if (updateError) throw updateError;

    console.log(`✅ ${vendorName} → ${publicUrl}`);
  } catch (err) {
    console.error(`❌ Failed for ${vendorName}:`, err.message);
  }
}

async function main() {
  console.log('🚀 Starting vendor logo upload...');
  for (const vendor of vendorImages) {
    await uploadLogo(vendor.name, vendor.file);
  }
  console.log('🏁 Done.');
}

main();