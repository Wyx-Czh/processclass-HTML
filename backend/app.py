from flask import Flask, jsonify, request
from flask_cors import CORS
from models import DBModel
import os

# 初始化 Flask 应用（Controller层）
app = Flask(__name__)
# 允许跨域请求，方便前后端分离开发
CORS(app)

# 初始化 Model 层
db_path = os.path.join(os.path.dirname(__file__), 'data.json')
db = DBModel(db_path)

# ================= 路由与业务逻辑控制 (Controller) =================

@app.route('/api/data', methods=['GET'])
def get_all_data():
    """获取系统所有数据"""
    return jsonify(db.get_all()), 200

@app.route('/api/orders', methods=['POST'])
def add_order():
    """新增订单"""
    new_order = request.json
    if not new_order:
        return jsonify({"error": "No data provided"}), 400
    db.add_order(new_order)
    return jsonify({"message": "success", "order": new_order}), 201

@app.route('/api/inventory', methods=['POST'])
def update_inventory():
    """库存出入库"""
    data = request.json
    if not data or 'name' not in data or 'action' not in data:
        return jsonify({"error": "Invalid data"}), 400
        
    db.update_inventory(
        data['name'], 
        data.get('type', '原材料'), 
        data.get('qty', 0), 
        data['action']
    )
    return jsonify({"message": "success"}), 200

@app.route('/api/production', methods=['POST'])
def add_production():
    """下达生产指令"""
    new_prod = request.json
    if not new_prod:
        return jsonify({"error": "No data provided"}), 400
    db.add_production(new_prod)
    return jsonify({"message": "success"}), 201

@app.route('/api/finance', methods=['POST'])
def add_finance():
    """新增财务流水"""
    new_fin = request.json
    if not new_fin:
        return jsonify({"error": "No data provided"}), 400
    db.add_finance(new_fin)
    return jsonify({"message": "success"}), 201

if __name__ == '__main__':
    print("ERP 后端服务已启动！运行在 http://127.0.0.1:5050")
    app.run(debug=True, host='127.0.0.1', port=5050)
