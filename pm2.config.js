module.exports = {
  name: "Node-Service-Monitor",  // 应用名称
  script: "npm",  // 实际启动脚本
  args: "run sever",  // 实际启动脚本
  cwd: "./",  // 当前工作路径
  watch: true,
  max_restarts: 10,
  // restart_delay: 1000 * 60 * 1,
  max_memory_restart: "1024M",
  min_uptime: '60s',
  "log_date_format": "YYYY-MM-DD HH:mm:ss",
  // autorestart: true,
  // watch: [  // 监听变化的目录，一旦变化，自动重启
  //   "model"
  //   "utils",
  //   "routers"
  // ],
  "ignore_watch": [  // 不监听的目录
    "node_modules",
    "logs",
    "public",
    "dist",
    ".nuxt",
    "static"
  ],
  "watch_options": {
    "followSymlinks": false
  },
  "pid_file": "./logs/pid.log",
  "error_file": "./logs/err.log",  // 错误日志路径
  "out_file": "./logs/out.log",  // 普通日志路径
  "env": {
    "NODE_ENV": "production"  // 环境参数，当前指定为生产环境
  }
}