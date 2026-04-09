import json
import os

class DBModel:
    def __init__(self, filename='data.json'):
        self.filename = filename
        self.data = self._load_data()

    def _load_data(self):
        if not os.path.exists(self.filename):
            default_data = {
                "orders": [
                    { "id": "#ORD-20260409", "customer": "华东教育集团", "product": "AI护眼灯 Pro", "amount": 150000, "quantity": 500, "time": "2026-04-09 10:30", "status": "待发货" },
                    { "id": "#ORD-20260408", "customer": "北方科技零售店", "product": "经典阅读灯 Std", "amount": 38000, "quantity": 200, "time": "2026-04-08 14:15", "status": "已发货" },
                    { "id": "#ORD-20260405", "customer": "星辰在线商城", "product": "AI护眼灯 Max", "amount": 450000, "quantity": 1000, "time": "2026-04-05 09:00", "status": "已完成" }
                ],
                "inventory": [
                    { "name": "AI护眼灯 Pro", "type": "成品", "current": 800, "safe": 500 },
                    { "name": "高显指LED灯珠", "type": "原材料", "current": 1200, "safe": 2000 },
                    { "name": "经典阅读灯 Std", "type": "成品", "current": 2400, "safe": 1000 }
                ],
                "finance": [
                    { "date": "2026-04-09", "type": "收入", "summary": "华东教育集团 - 订单尾款", "amount": 50000 },
                    { "date": "2026-04-08", "type": "支出", "summary": "采购部 - 铝合金材料款", "amount": -120000 },
                    { "date": "2026-04-05", "type": "收入", "summary": "星辰在线商城 - 预付款", "amount": 200000 }
                ],
                "production": [
                    { "task": "AI护眼灯 Pro 生产任务", "quantity": 500, "time": "2026-04-09 11:00", "status": "生产中" }
                ]
            }
            with open(self.filename, 'w', encoding='utf-8') as f:
                json.dump(default_data, f, ensure_ascii=False, indent=2)
            return default_data
            
        with open(self.filename, 'r', encoding='utf-8') as f:
            return json.load(f)

    def _save_data(self):
        with open(self.filename, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)

    def get_all(self):
        return self.data

    def add_order(self, order):
        self.data["orders"].insert(0, order)
        self._save_data()

    def update_inventory(self, name, item_type, qty, action):
        target = next((item for item in self.data["inventory"] if item["name"] == name), None)
        if not target:
            target = {"name": name, "type": item_type, "current": 0, "safe": 100}
            self.data["inventory"].append(target)
        
        if action == 'in':
            target["current"] += qty
        else:
            target["current"] -= qty
            
        self._save_data()

    def add_production(self, prod):
        self.data["production"].insert(0, prod)
        self._save_data()

    def add_finance(self, finance):
        self.data["finance"].insert(0, finance)
        self._save_data()