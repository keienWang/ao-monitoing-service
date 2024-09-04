const { readFileSync } = require("fs");
const path = require("path");
const { monitorService } = require('./monitorService');

// 加载监控配置
const configPath = path.join(__dirname, '../../config/monitor-config.json');
const monitorConfig = JSON.parse(readFileSync(configPath).toString());

function startMonitoring() {
  monitorConfig.forEach(config => {
    monitorService(config);
  });
}

module.exports = { startMonitoring };
