const { readFileSync, writeFileSync } = require("fs");
const path = require("path");
const { message, createDataItemSigner, result } = require("@permaweb/aoconnect");
const { sendEmail } = require('../utils/mailService');  // 使用修改后的sendEmail方法
const { logger } = require('../utils/logger');

// 加载钱包
const wallet = JSON.parse(readFileSync("./wallet.json").toString());

// 配置文件路径
const configPath = path.join(__dirname, '../../config/monitor-config.json');
// 加载监控配置
let monitorConfig = JSON.parse(readFileSync(configPath).toString());

async function checkLuaContract(configIndex) {
  const config = monitorConfig[configIndex];
  try {
    // 发送请求
    const response = await message({
      process: config.process,
      tags: config.tags,
      signer: createDataItemSigner(wallet),
      data: config.data || "",  // 如果配置中没有data字段，默认为空字符串
    });

    logger.info(`Message sent to process ${config.process} with action ${config.tags[0].value}`);

    // 获取结果
    const { Messages, Spawns, Output, Error } = await result({
      message: response,  // Arweave TXID of the message
      process: config.process,  // Arweave TXID of the process
    });

    // 解析Messages
    if (Messages && Messages.length > 0) {
      Messages.forEach((msg, index) => {
        logger.info(`Message ${index + 1} from process ${config.process}: ${JSON.stringify(msg)}`);
        
        // 解析和处理每个Message
        parseAndHandleMessage(msg, configIndex, config);
      });
    } else {
      logger.info(`No messages received for process ${config.process}`);
    }

    // 检查是否存在错误
    if (Error) {
      throw new Error(`Error in process ${config.process}: ${Error}`);
    }

    // 如果需要，可以对Output进行进一步处理
    logger.info(`Output for process ${config.process} with action ${config.tags[0].value}: ${JSON.stringify(Output)}`);

  } catch (error) {
    logger.error(`Error checking contract for process ${config.process} with action ${config.tags[0].value}: ${error.message}`);
    sendEmail(config.alertEmail, 'Error Notification', `Error checking contract for process ${config.process} with action ${config.tags[0].value}: ${error.message}`);
  }
}

// 自定义函数：解析和处理每个Message
function parseAndHandleMessage(msg, configIndex, config) {
  try {
    const data = JSON.parse(msg.Data);
    const action = msg.Tags.find(tag => tag.name === "Action")?.value;

    switch (action) {
      case "Get-Dashboard-Response":
        console.log("接收到:Get-Dashboard-Response");
        handleGetDashboardResponse(data, configIndex, config);
        break;

      case "Get-Chat-Answer-Response":
        console.log("接收到:Get-Chat-Answer-Response");
        handleGetChatAnswerResponse(data, configIndex);
        break;

      default:
        logger.info(`Unhandled action type: ${action}`);
    }
  } catch (err) {
    logger.error(`Error parsing message data: ${err.message}`);
  }
}

// 处理 "Get-Dashboard-Response" 的逻辑
function handleGetDashboardResponse(data, configIndex, config) {
  // 检查条件，如果满足则继续，如果不满足则触发警报
  if (data.granted_reward > 0 && data.participants > 0) {
    logger.info(`Get-Dashboard-Response meets the conditions for process ${monitorConfig[configIndex].process}`);
    // 满足条件，继续执行，可能更新配置文件或其他操作
    // updateConfigFile(configIndex, data.granted_reward, data.participants);
    sendEmail(config.alertEmail, 'Alert: Condition Not Met', data.participants); 
  } else {
    // 不满足条件，触发警报
    const errorMessage = `Alert: Process ${monitorConfig[configIndex].process} with action Get-Dashboard-Response did not meet the conditions. granted_reward: ${data.granted_reward}, participants: ${data.participants}`;
    logger.warn(errorMessage);
    sendEmail(config.alertEmail, 'Alert: Condition Not Met', errorMessage);  // 使用修改后的sendEmail方法
  }
}

// 更新配置文件
function updateConfigFile(configIndex, granted_reward, participants) {
  monitorConfig[configIndex].granted_reward = granted_reward;
  monitorConfig[configIndex].participants = participants;

  try {
    writeFileSync(configPath, JSON.stringify(monitorConfig, null, 2));
    logger.info(`Config file updated with granted_reward: ${granted_reward}, participants: ${participants}`);
  } catch (err) {
    logger.error(`Error writing to config file: ${err.message}`);
  }
}

// 处理 "Get-Chat-Answer-Response" 的逻辑
function handleGetChatAnswerResponse(data, configIndex) {
  if (data.answer) {
    logger.info(`Received answer for Get-Chat-Answer-Response: ${data.answer}`);
    // 根据需要更新配置或执行其他操作
  } else {
    const errorMessage = `Alert: No answer received for Get-Chat-Answer-Response`;
    logger.warn(errorMessage);
    sendEmail(monitorConfig[configIndex].alertEmail, 'Alert: No Answer Received', errorMessage);  // 使用修改后的sendEmail方法
  }
}

function monitorService() {
  monitorConfig.forEach((config, index) => {
    setInterval(() => checkLuaContract(index), config.interval);
  });
}

module.exports = { monitorService };
