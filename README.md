# ao-monitoing-service
# AO Monitoring Service

AO Monitoring Service 是一个用于监控 AO 链上 Lua 合约的服务。该服务会定期检查合约的状态，并在出现异常时发送报警邮件。

## 目录结构

```plaintext
ao-monitoring-service/
│
├── config/
│   └── monitor-config.json       # 监控配置文件
│
├── node_modules/                 # Node.js 依赖模块
│
├── src/
│   ├── monitor/
│   │   ├── index.js              # 入口文件，启动监控服务
│   │   ├── monitorService.js     # 核心监控逻辑
│   │   └── wallet.json           # 钱包配置文件
│   │
│   └── utils/
│       ├── logger.js             # 日志工具
│       ├── mailService.js        # 邮件服务工具
│       └── index.js              # 工具入口文件
│
├── .gitignore                    # Git 忽略文件
├── monitoring.log                # 日志文件
├── package.json                  # Node.js 项目配置文件
├── package-lock.json             # 依赖锁文件
└── README.md                     # 项目说明文件
```

## 启动命令
``` 
node src/monitor/index.js
``` 
## 查看日志
``` 
tail -f monitoring.log
``` 
## 增加接口可通过配置文件配置，及修改src/monitorService.js 的接口返回处理即可