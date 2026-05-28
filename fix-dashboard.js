import fs from 'fs';
import path from 'path';

// Fix DoctorDashboard template HTML if active
const filepath = 'src/components/DoctorDashboard.tsx';
if (fs.existsSync(filepath)) {
  let content = fs.readFileSync(filepath, 'utf8');
  let lines = content.split('\n');
  let fixed = false;

  const newLines = lines.map((line) => {
    if (line.includes('KlikHealth IA Engine</span>') && line.includes('</div>')) {
      fixed = true;
      return '        </div>';
    }
    return line;
  });

  if (fixed) {
    fs.writeFileSync(filepath, newLines.join('\n'), 'utf8');
    console.log('Successfully repaired DoctorDashboard.tsx!');
  } else {
    console.log('DoctorDashboard.tsx is already clean.');
  }
} else {
  console.log('DoctorDashboard.tsx not found.');
}

// Automatically replicate logo to launcher icon locations
try {
  const sourceImage = 'src/assets/images/klikhealth_logo_1779971360796.png';
  if (fs.existsSync(sourceImage)) {
    console.log(`Source logo image found: ${sourceImage}`);
    
    // Define all destination paths requested by build system and launcher guidelines
    const targets = [
      'assets/ic_launcher.png',
      'assets/ic_launcher_round.png',
      'assets/.aistudio/ic_launcher.png',
      'assets/.aistudio/ic_launcher_round.png'
    ];

    targets.forEach((targetPath) => {
      const destDir = path.dirname(targetPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
        console.log(`Created destination directory: ${destDir}`);
      }
      fs.copyFileSync(sourceImage, targetPath);
      console.log(`Successfully copied launcher icon to: ${targetPath}`);
    });
  } else {
    console.warn(`Warning: Source logo image not found at ${sourceImage}`);
  }
} catch (err) {
  console.error('Error during icon replication:', err);
}
