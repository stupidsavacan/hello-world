const assert=require('assert'),fs=require('fs'),path=require('path');const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const value of ['settingsTransferRoot','src/ui/settingsExportImport.js','src/ui/SettingsTransferPanel.js','src/styles/settings-transfer.css'])assert.ok(html.includes(value),`missing ${value}`);
console.log('settings-transfer-bootstrap: ok');
