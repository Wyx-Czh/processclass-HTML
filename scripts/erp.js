// 检查登录状态
const currentUser = sessionStorage.getItem('erpUser');
if (!currentUser) {
    window.location.href = 'login.html';
}
const userData = JSON.parse(currentUser || '{}');

const API_BASE_URL = 'http://127.0.0.1:5050/api';
let db = { orders: [], inventory: [], finance: [], production: [] };

async function loadData() {
    try {
        // 先尝试请求真实后端
        const response = await fetch(`${API_BASE_URL}/data`);
        if (!response.ok) throw new Error('网络响应错误');
        db = await response.json();
        renderAll();
    } catch (error) {
        console.warn("无法连接到后端服务器，正在切换为只读演示模式 (加载本地静态数据)...");
        try {
            // 后端不可用时，请求本地存放的模拟数据 (用于 GitHub Pages 展示)
            const fallbackResponse = await fetch('backend/data.json');
            if (!fallbackResponse.ok) throw new Error('本地演示数据加载失败');
            db = await fallbackResponse.json();
            
            // 提示用户当前处于演示模式
            const alertBox = document.createElement('div');
            alertBox.className = 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 fixed top-0 left-0 w-full z-50 shadow-md';
            alertBox.innerHTML = '<strong>⚠️ 演示模式：</strong> 未检测到本地后端服务器，当前已切换至只读演示模式。所有数据修改将不会被永久保存。';
            document.body.prepend(alertBox);
            
            renderAll();
        } catch (fallbackError) {
            console.error("加载数据失败:", fallbackError);
            alert("无法加载数据：既无法连接后端，也无法读取本地演示文件。");
        }
    }
}

function formatCurrency(num) {
    return '¥ ' + num.toLocaleString();
}

function getCurrentTime() {
    const now = new Date();
    return now.toISOString().slice(0, 16).replace('T', ' ');
}

function getCurrentDate() {
    const now = new Date();
    return now.toISOString().slice(0, 10);
}

// 渲染所有视图
function renderAll() {
    renderOrders();
    renderInventory();
    renderFinance();
    renderProduction();
    renderDashboardStats();
}

function renderOrders() {
    const tbodySales = document.getElementById('sales-orders-body');
    const tbodyDash = document.getElementById('dashboard-orders-body');
    
    let html = '';
    let dashHtml = '';
    
    db.orders.forEach((order, index) => {
        let statusColor = order.status === '已发货' ? 'green' : (order.status === '待发货' ? 'yellow' : 'blue');
        let row = `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-primary font-medium">${order.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.customer}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.product}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.quantity}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(order.amount)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.time}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${statusColor}-100 text-${statusColor}-800">${order.status}</span>
                </td>
            </tr>
        `;
        html += row;
        if (index < 5) dashHtml += row; // dashboard 仅显示最近 5 条
    });
    
    if(tbodySales) tbodySales.innerHTML = html;
    if(tbodyDash) tbodyDash.innerHTML = dashHtml;
}

function renderInventory() {
    const tbody = document.getElementById('inventory-body');
    let html = '';
    
    db.inventory.forEach(item => {
        let isWarning = item.current < item.safe;
        let isExcess = item.current > item.safe * 2;
        let status = isWarning ? '短缺' : (isExcess ? '积压' : '正常');
        let statusColor = isWarning ? 'red' : (isExcess ? 'yellow' : 'green');
        let currentClass = isWarning ? 'text-red-600 font-bold' : 'text-gray-900';
        
        html += `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.type}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${currentClass}">${item.current}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.safe}</td>
                <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 py-1 text-xs rounded-full bg-${statusColor}-100 text-${statusColor}-800">${status}</span></td>
            </tr>
        `;
    });
    
    if(tbody) tbody.innerHTML = html;
}

function renderFinance() {
    const tbody = document.getElementById('finance-body');
    let html = '';
    let totalIncome = 0;
    let totalExpense = 0;
    
    db.finance.forEach(item => {
        let isIncome = item.type === '收入';
        if(isIncome) totalIncome += item.amount;
        else totalExpense += Math.abs(item.amount);
        
        let typeColor = isIncome ? 'green' : 'red';
        let sign = isIncome ? '+' : '-';
        let amountColor = isIncome ? 'text-green-600' : 'text-red-600';
        
        html += `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.date}</td>
                <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 py-1 text-xs rounded bg-${typeColor}-100 text-${typeColor}-800">${item.type}</span></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.summary}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${amountColor} text-right">${sign} ${Math.abs(item.amount).toLocaleString()}</td>
            </tr>
        `;
    });
    
    if(tbody) tbody.innerHTML = html;
    
    document.getElementById('finance-income').innerText = formatCurrency(totalIncome);
    document.getElementById('finance-expense').innerText = formatCurrency(totalExpense);
    document.getElementById('finance-profit').innerText = formatCurrency(totalIncome - totalExpense);
}

function renderProduction() {
    const container = document.getElementById('production-lines-body');
    let html = '';
    
    if (db.production.length === 0) {
        html = '<p class="text-sm text-gray-500">当前暂无生产任务</p>';
    } else {
        db.production.forEach(prod => {
            html += `
                <div class="border rounded-md p-4 flex justify-between items-center">
                    <div class="flex items-center">
                        <div class="w-3 h-3 rounded-full bg-green-500 mr-3 animate-pulse"></div>
                        <div>
                            <p class="font-medium text-gray-900">${prod.task}</p>
                            <p class="text-xs text-gray-500">计划生产数量: ${prod.quantity} | 下达时间: ${prod.time}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">${prod.status}</span>
                    </div>
                </div>
            `;
        });
    }
    if(container) container.innerHTML = html;
}

function renderDashboardStats() {
    let totalRevenue = db.orders.reduce((sum, order) => sum + Number(order.amount), 0);
    let totalOrders = db.orders.length;
    let totalWarnings = db.inventory.filter(i => i.current < i.safe).length;
    let totalProd = db.production.length;
    
    document.getElementById('dash-revenue').innerText = formatCurrency(totalRevenue);
    document.getElementById('dash-orders').innerText = totalOrders + ' 单';
    document.getElementById('dash-warnings').innerText = totalWarnings + ' 项';
    document.getElementById('dash-production').innerText = totalProd + ' 项';
}

// --- 事件处理函数 ---

async function handleAddOrder() {
    let customer = prompt("请输入客户名称：", "新客户");
    if (!customer) return;
    let product = prompt("请输入产品名称：", "AI护眼灯 标准版");
    if (!product) return;
    let quantity = prompt("请输入数量：", "100");
    if (!quantity || isNaN(quantity)) return;
    let amount = prompt("请输入订单总金额：", "30000");
    if (!amount || isNaN(amount)) return;
    
    let newOrder = {
        id: '#ORD-' + new Date().getTime().toString().slice(-8),
        customer: customer,
        product: product,
        quantity: parseInt(quantity),
        amount: parseFloat(amount),
        time: getCurrentTime(),
        status: '待发货'
    };
    
    try {
        await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newOrder)
        });
        await loadData();
        alert("订单新增成功！");
    } catch (e) {
        console.error(e);
        alert("提交失败！");
    }
}

async function handleInventory(type) {
    let actionName = type === 'in' ? '入库' : '出库';
    let itemName = prompt(`请输入要${actionName}的物料/产品名称：`, "AI护眼灯 Pro");
    if (!itemName) return;
    
    let targetItem = db.inventory.find(i => i.name === itemName);
    let itemType = "原材料";
    if (!targetItem) {
        if (type === 'in') {
            let confirmNew = confirm(`未找到 "${itemName}"，是否作为新物料添加？`);
            if (confirmNew) {
                itemType = prompt("请输入物料类型 (成品/原材料)：", "原材料") || "原材料";
            } else {
                return;
            }
        } else {
            alert(`库存中未找到 "${itemName}"！`);
            return;
        }
    } else {
        itemType = targetItem.type;
    }
    
    let qty = prompt(`请输入${actionName}数量：`, "100");
    if (!qty || isNaN(qty)) return;
    qty = parseInt(qty);
    
    if (type === 'out' && targetItem && targetItem.current < qty) {
        alert(`出库失败！当前库存 (${targetItem.current}) 不足。`);
        return;
    }
    
    try {
        await fetch(`${API_BASE_URL}/inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: itemName, type: itemType, qty: qty, action: type })
        });
        await loadData();
        alert(`${actionName}成功！`);
    } catch (e) {
        console.error(e);
        alert("提交失败！");
    }
}

async function handleAddProduction() {
    let product = prompt("请输入要生产的产品名称：", "AI护眼灯 Pro");
    if (!product) return;
    let quantity = prompt("请输入计划生产数量：", "200");
    if (!quantity || isNaN(quantity)) return;
    
    let newProd = {
        task: `${product} 生产任务`,
        quantity: parseInt(quantity),
        time: getCurrentTime(),
        status: '生产中'
    };
    
    try {
        await fetch(`${API_BASE_URL}/production`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProd)
        });
        await loadData();
        alert("生产指令已下达！");
    } catch (e) {
        console.error(e);
        alert("提交失败！");
    }
}

async function handleAddFinance() {
    let type = prompt("请输入记账类型 (收入/支出)：", "收入");
    if (type !== '收入' && type !== '支出') {
        alert("类型只能是“收入”或“支出”");
        return;
    }
    let summary = prompt("请输入摘要/说明：", "日常报销");
    if (!summary) return;
    let amount = prompt("请输入金额：", "1000");
    if (!amount || isNaN(amount)) return;
    
    let newFin = {
        date: getCurrentDate(),
        type: type,
        summary: summary,
        amount: type === '支出' ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount))
    };
    
    try {
        await fetch(`${API_BASE_URL}/finance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFin)
        });
        await loadData();
        alert("记账成功！");
    } catch (e) {
        console.error(e);
        alert("提交失败！");
    }
}

function logout() {
    sessionStorage.removeItem('erpUser');
    window.location.href = 'login.html';
}

// 初始化页面渲染
document.addEventListener('DOMContentLoaded', () => {
    // 动态渲染用户信息
    if (userData.name) {
        document.getElementById('userNameDisplay').innerText = userData.name;
        document.getElementById('userRoleDisplay').innerText = userData.role;
        document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?name=${userData.name}&background=random`;
    }
    
    loadData();

    // 初始化图表
    const ctx = document.getElementById('salesChart').getContext('2d');
    const salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [
                {
                    label: '订单量 (台)',
                    data: [1200, 1900, 3000, 5000],
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                },
                {
                    label: '生产量 (台)',
                    type: 'line',
                    data: [1000, 2000, 2800, 5200],
                    backgroundColor: 'rgba(30, 64, 175, 0)',
                    borderColor: 'rgb(30, 64, 175)',
                    borderWidth: 2,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});

// 标签切换逻辑
function switchTab(tabId) {
    const titles = {
        'dashboard': '总览仪表盘',
        'sales': '销售与订单管理',
        'production': '生产与制造执行 (MES)',
        'inventory': '库存台账与调拨',
        'finance': '财务报表与对账'
    };
    document.getElementById('pageTitle').innerText = titles[tabId] || '智光ERP';

    document.querySelectorAll('.tab-view').forEach(el => el.classList.add('hidden'));
    document.getElementById('view-' + tabId).classList.remove('hidden');

    document.querySelectorAll('#sidebarNav .nav-item').forEach(el => {
        el.classList.remove('bg-gray-800', 'text-white');
        el.classList.add('text-gray-400');
    });
    const activeNav = document.querySelector(`#sidebarNav .nav-item[data-target="${tabId}"]`);
    if (activeNav) {
        activeNav.classList.remove('text-gray-400', 'hover:bg-gray-800', 'hover:text-white');
        activeNav.classList.add('bg-gray-800', 'text-white');
    }
}
