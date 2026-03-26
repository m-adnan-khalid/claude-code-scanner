#!/usr/bin/env node
// Cross-platform OS notification when Claude needs user approval
const { execSync } = require('child_process');

const MSG = 'Claude Code needs your approval';

function tryExec(cmd) {
  try { execSync(cmd, { stdio: 'ignore', timeout: 5000 }); return true; } catch { return false; }
}

function hasCommand(name) {
  try {
    const check = process.platform === 'win32' ? `where ${name}` : `command -v ${name}`;
    execSync(check, { stdio: 'ignore' });
    return true;
  } catch { return false; }
}

if (process.platform === 'darwin') {
  // macOS
  tryExec(`osascript -e 'display notification "${MSG}" with title "Claude Code"'`);
} else if (process.platform === 'win32') {
  // Windows — non-blocking balloon tip notification
  tryExec(`powershell.exe -NoProfile -Command "[void][System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); $n=New-Object System.Windows.Forms.NotifyIcon; $n.Icon=[System.Drawing.SystemIcons]::Information; $n.Visible=$true; $n.ShowBalloonTip(3000,'Claude Code','${MSG}',[System.Windows.Forms.ToolTipIcon]::Info); Start-Sleep -Milliseconds 100; $n.Dispose()"`);
} else {
  // Linux
  if (hasCommand('notify-send')) {
    tryExec(`notify-send "Claude Code" "${MSG}"`);
  }
}
