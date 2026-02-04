# 推送代码到 GitHub

## 第一步：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: 例如 `startup-album` 或任何你喜欢的名字
   - **Description**: 可选
   - **Public** 或 **Private**: 选择 Public（Vercel 和 Railway 都支持）
   - **不要勾选** "Add a README file"（我们已经有代码了）
3. 点击 "Create repository"

## 第二步：推送代码

创建仓库后，GitHub 会显示一个页面。复制你的仓库 URL（类似 `https://github.com/你的用户名/仓库名.git`）

然后在命令行执行：

```bash
cd C:\Users\15487\Desktop\startUp
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin master
```

**注意**：将 `你的用户名/仓库名` 替换成你实际的 GitHub 用户名和仓库名。

## 第三步：验证

推送成功后，刷新 GitHub 仓库页面，你应该能看到所有文件。

## 下一步

代码推送成功后，就可以开始部署了：
1. 部署后端到 Railway
2. 部署前端到 Vercel

详细步骤请参考 `QUICK_DEPLOY_GUIDE.md`
