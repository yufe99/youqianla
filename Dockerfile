# 使用 Node.js 20 作为基础镜像
FROM node:22-slim

# 设置工作目录
WORKDIR /app

# 复制依赖定义文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制所有源代码
COPY . .

# 执行前端构建 (生成 dist 目录)
RUN npm run build

# 暴露 3000 端口 (AI Studio 默认端口)
# 注意：微信云托管默认监听 80，可以在管理后台修改或将服务改为监听 80
EXPOSE 3000

# 设置生产环境标识
ENV NODE_ENV=production

# 启动服务器
CMD ["npm", "start"]
