// 用户数据配置 (姓名: {hash(学号), 岗位})
// 使用 SHA-256 加密存储密码（学号），防止源码泄露真实学号信息
const users = {
    "王磊": { hash: "a50c906ad5c7ca8a122f8016f0866d9c89b93ad38eeaeebd113bcf99b592b3db", role: "研发管理" },
    "孙锦昊": { hash: "40ba9e59f7497d3e3a8d73a043437b07d2bbbf5d3d7897204e8962daa03838d9", role: "设备管理" },
    "莫洪涛": { hash: "ca6add434753cbedcc8757580153fe8fee8cb07a6cc3d3768fcc529a7c9102d6", role: "计划管理" },
    "柯扬帆": { hash: "e30bd966785459430d36922043c815bbf16494913a195e44cc69eb8324bbb0b7", role: "厂长" },
    "陈则豪": { hash: "af57eb01d6457e9a1f0a500c6b222e2a9fbeb77b41eda5531bcaf34e3f6bf562", role: "信息管理" },
    "吴哲志": { hash: "07ad56d8c60680843ad47b66218666214814ba2a2ba053e5492d47c2d707f689", role: "人力资源管理" },
    "卢书宇": { hash: "4a9cd9baf6322cc02592fc4c94cd38a40a560437151802ca6c76e14d69763efa", role: "财务管理" },
    "何静": { hash: "ac815bc69214d3fb5fc71b0c49a911e60b4abb5f0393f260063c72fc6f7c1eed", role: "采购管理" },
    "郑亚宁": { hash: "ea9212e42751d6d3f694f692917e4d28bc18d05c4870c188797c880631f4a648", role: "质量管理" },
    "谢敦旭": { hash: "18d4095721319130cea693a2ac08993e9f71e593097b48749b996428d94d8238", role: "物流管理" }
};

// 简单的 SHA-256 加密函数
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('errorMessage');

    const hashedPassword = await sha256(password);

    if (users[username] && users[username].hash === hashedPassword) {
        // 登录成功，隐藏错误并记录用户信息到 SessionStorage
        errorDiv.classList.add('hidden');
        sessionStorage.setItem('erpUser', JSON.stringify({
            name: username,
            role: users[username].role
        }));
        // 跳转到 ERP 页面
        window.location.href = 'erp.html';
    } else {
        // 登录失败，显示错误提示
        errorDiv.classList.remove('hidden');
    }
});