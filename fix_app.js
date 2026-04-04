const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. replace data-text="ADP" and > ADP < with adper
app = app.replace(/data-text="ADP"/g, 'data-text="adper"');
app = app.replace(/>\s*ADP\s*</g, '>\n          adper\n        <');

// 2. remove the profile pic completely
app = app.replace(/\{aboutData\.profile_image[\s\S]*?\}\)/g, '');

// 3. change adp@nfsu to adper@nexus
app = app.replace(/<span className="text-text-dim">adp<\/span>@nfsu/g, '<span className="text-text-dim">adper</span>@nexus');

// 4. remove monkeytype from Profiles
let profiles = JSON.parse(fs.readFileSync('src/data/profiles.json', 'utf-8'));
profiles = profiles.filter(p => p.name !== 'Monkeytype');
fs.writeFileSync('src/data/profiles.json', JSON.stringify(profiles, null, 2));

// 5. remove monkeytype from Social
let social = JSON.parse(fs.readFileSync('src/data/social.json', 'utf-8'));
delete social.monkeytype;
fs.writeFileSync('src/data/social.json', JSON.stringify(social, null, 2));

// 6. Include full name in the info structure on the right side.
app = app.replace(/\[\'handle\', aboutData\.handle, \'text-cyan\'\],/g, `['name', aboutData.name, 'text-mint'],\n            ['handle', aboutData.handle, 'text-cyan'],`);

// 7. change boot sequence log text to use adper
app = app.replace(/> kernel init · adp\/personal-v2\.0/g, '> kernel init · adper/personal-v2.0');

fs.writeFileSync('src/App.tsx', app);
console.log('App updated');
