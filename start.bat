@echo off
chcp 65001 >nul
echo ========================================
echo      欢迎使用 智光科技 ERP 系统
echo ========================================
echo.

echo [1/2] 正在启动后端服务 (端口 5050)...
start "智光ERP - 后端服务" cmd /k "cd backend && python -m pip install flask flask-cors -i https://pypi.tuna.tsinghua.edu.cn/simple && python app.py"

echo [2/2] 正在启动前端服务 (端口 8088)...
start "智光ERP - 前端服务" cmd /k "python -m http.server 8088"

echo.
echo ========================================
echo 启动完成！
echo.
echo 前端官网与系统入口: http://localhost:8088
echo 后端数据接口地址:   http://127.0.0.1:5050
echo.
echo (注意：系统已经为您打开了两个黑色的命令行窗口，请保持它们运行，关闭窗口即停止对应服务)
echo ========================================
echo.
pause