const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'ENOENT' || err.code === 'EPERM' || err.code === 'EACCES') return;
      throw err;
    }
  });
  return filelist;
};

const srcDir = path.join(__dirname, 'frontend/src');
const files = walkSync(srcDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

let totalChanges = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Colors
  content = content.replace(/bg-\[rgba\(24,24,27,0\.85\)\]/g, 'bg-[#18181b]');
  content = content.replace(/bg-\[#161b22\]/g, 'bg-[#18181b]');
  content = content.replace(/bg-\[#09090b\]/g, 'bg-[#0a0a0c]');
  
  // Borders
  content = content.replace(/border-\[#27272a\]/g, 'border-white/5');
  content = content.replace(/border-\[#30363d\]/g, 'border-white/5');
  content = content.replace(/border-zinc-700/g, 'border-white/5');
  content = content.replace(/border-zinc-800/g, 'border-white/5');

  // Shapes
  content = content.replace(/rounded-3xl/g, 'rounded-sm');
  content = content.replace(/rounded-2xl/g, 'rounded-sm');
  content = content.replace(/rounded-xl/g, 'rounded-sm');
  content = content.replace(/rounded-lg/g, 'rounded-sm');

  // Shadows
  content = content.replace(/shadow-2xl/g, 'shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]');
  content = content.replace(/shadow-xl/g, 'shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]');
  content = content.replace(/shadow-lg/g, 'shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]');
  
  // Effects
  content = content.replace(/ backdrop-blur-[a-z]+/g, '');
  content = content.replace(/backdrop-blur-[a-z]+/g, '');

  // Blues/Indigos to Zinc/White (excluding specific brand stuff if any)
  content = content.replace(/text-blue-[456]00/g, 'text-zinc-100');
  content = content.replace(/text-indigo-[456]00/g, 'text-zinc-100');
  content = content.replace(/bg-blue-[56]00/g, 'bg-zinc-100 text-black');
  content = content.replace(/bg-indigo-[56]00/g, 'bg-zinc-100 text-black');
  
  // Buttons that use green
  content = content.replace(/bg-\[#238636\] hover:bg-\[#2ea043\] text-white/g, 'bg-white hover:bg-zinc-200 text-black');

  if (original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    totalChanges++;
  }
});

console.log(`Updated ${totalChanges} files.`);
