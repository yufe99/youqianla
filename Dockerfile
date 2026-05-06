# 使用 Node.js 基础镜像
FROM node:22-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 运行阶段
FROM node:22-slim
WORKDIR /app

# 设置时区为北京时间
RUN apt-get update && apt-get install -y tzdata && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 复制构建产物和服务器脚本
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/package*.json ./

# 安装生产环境必要的运行工具
RUN npm install --production && npm install -g tsx

# 微信云托管默认建议监听 80 端口
ENV PORT=80
EXPOSE 80

# 启动命令
CMD ["tsx", "server.ts"]
