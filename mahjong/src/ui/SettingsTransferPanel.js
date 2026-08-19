(function(global){
const S=global.Sanma,$=id=>document.getElementById(id);
function render(){S.SettingsExportImport.render($('settingsTransferRoot'),S.SettingsStorage.loadSettings(),{onImport(cfg){if(S.SettingsStorage.saveSettings(cfg)){alert('設定を読み込みました。再読み込みして反映します。');global.location.reload()}},onReset(){S.SettingsStorage.resetSettings();global.location.reload()}})}
$('settingsButton').addEventListener('click',render);
})(window);
