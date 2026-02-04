# Railway 部署说明

## 环境变量配置

在 Railway 中需要配置以下环境变量：

```
PORT=8080
DB_HOST=<Railway MySQL 主机地址>
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<Railway MySQL 密码>
DB_NAME=railway
```

## 数据库初始化

部署后需要执行以下 SQL：

1. `database.sql` - 创建相册表
2. `board_table.sql` - 创建留言板表

## 启动命令

```
npm start
```
