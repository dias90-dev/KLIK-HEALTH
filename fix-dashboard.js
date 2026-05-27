import fs from 'fs';

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
