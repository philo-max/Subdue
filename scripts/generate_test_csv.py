import csv
import os
import random
import sys
from datetime import datetime, timedelta

# Configure Windows terminal encoding to UTF-8
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def generate_alipay_csv(filepath):
    """
    Generates a mock Alipay CSV export file with recurring subscription payments.
    """
    headers = ["交易时间", "交易分类", "交易对方", "商品", "收/支", "金额(元)", "支付方式", "交易状态", "交易分类2", "资金状态"]
    
    # Subscription templates
    subs = [
        {"desc": "Netflix Standard Plan", "相手": "Netflix, Inc.", "amount": 35.00, "interval_days": 30, "cat": "流媒体"},
        {"desc": "Spotify Premium Family", "相手": "Spotify AB", "amount": 15.00, "interval_days": 30, "cat": "流媒体"},
        {"desc": "iCloud 200GB Storage", "相手": "Apple Storage", "amount": 21.00, "interval_days": 30, "cat": "云存储"},
        {"desc": "ChatGPT Plus", "相手": "OpenAI/ChatGPT", "amount": 145.00, "interval_days": 30, "cat": "AI工具"}, # Approx $20 in CNY
    ]
    
    # Normal one-off transactions
    one_offs = [
        {"desc": "煎饼果子加蛋", "相手": "路边摊小吃", "cat": "餐饮美食"},
        {"desc": "美团外卖黄焖鸡", "相手": "美团外卖商家", "cat": "餐饮美食"},
        {"desc": "滴滴打车出行费", "相手": "滴滴出行", "cat": "交通出行"},
        {"desc": "优衣库短袖衬衫", "相手": "优衣库旗舰店", "cat": "服饰装扮"},
    ]
    
    rows = []
    start_date = datetime.now() - timedelta(days=120)
    
    # 1. Generate recurring transactions
    for sub in subs:
        current_date = start_date + timedelta(days=random.randint(0, 15))
        while current_date < datetime.now():
            rows.append({
                "time": current_date.strftime("%Y-%m-%d %H:%M:%S"),
                "cat": "娱乐服务",
                "partner": sub["相手"],
                "product": sub["desc"],
                "dir": "支出",
                "amount": f"{sub['amount']:.2f}",
                "pay_method": "账户余额",
                "status": "交易成功",
                "cat2": sub["cat"],
                "funds": "已扣款"
            })
            current_date += timedelta(days=sub["interval_days"])
            
    # 2. Generate random one-off transactions
    current_date = start_date
    while current_date < datetime.now():
        # 1-3 transactions per day
        for _ in range(random.randint(1, 3)):
            item = random.choice(one_offs)
            amount = random.uniform(5.00, 99.00)
            tx_time = current_date + timedelta(hours=random.randint(8, 22), minutes=random.randint(0, 59))
            rows.append({
                "time": tx_time.strftime("%Y-%m-%d %H:%M:%S"),
                "cat": item["cat"],
                "partner": item["相手"],
                "product": item["desc"],
                "dir": "支出",
                "amount": f"{amount:.2f}",
                "pay_method": "花呗",
                "status": "交易成功",
                "cat2": item["cat"],
                "funds": "已扣款"
            })
        current_date += timedelta(days=1)
        
    # Sort by time descending
    rows.sort(key=lambda x: x["time"], reverse=True)
    
    # Write to CSV in GBK (typical Excel format for Chinese OS)
    with open(filepath, 'w', newline='', encoding='gbk', errors='ignore') as f:
        # Standard Alipay export banner mock
        f.write("支付宝交易记录明细\n")
        f.write("此文件为Subdue辅助测试生成\n")
        f.write("-------------------------------------------------------------------\n")
        
        writer = csv.writer(f)
        writer.writerow(headers)
        for r in rows:
            writer.writerow([
                r["time"], r["cat"], r["partner"], r["product"], r["dir"], 
                r["amount"], r["pay_method"], r["status"], r["cat2"], r["funds"]
            ])

def generate_wechat_csv(filepath):
    """
    Generates a mock WeChat Pay CSV export file with recurring subscription payments.
    """
    headers = ["交易时间", "交易类型", "交易对方", "商品", "收/支", "金额(元)", "支付方式", "当前状态", "交易单号", "商户单号", "备注"]
    
    # Subscription templates
    subs = [
        {"desc": "Bilibili大会员月付", "相手": "上海宽娱数码科技有限公司", "amount": 15.00, "interval_days": 30, "cat": "流媒体"},
        {"desc": "腾讯视频超级影视VIP", "相手": "腾讯计算机系统有限公司", "amount": 25.00, "interval_days": 30, "cat": "流媒体"},
        {"desc": "网易云音乐黑胶豪华VIP", "相手": "网易雷火科技有限公司", "amount": 15.00, "interval_days": 30, "cat": "流媒体"},
        {"desc": "淘宝88VIP年卡", "相手": "淘宝网购平台", "amount": 88.00, "interval_days": 365, "cat": "购物会员"},
    ]
    
    # One offs
    one_offs = [
        {"desc": "地铁出行扣费", "相手": "城市轨道交通公司", "type": "交通出行"},
        {"desc": "全家便利店三明治", "相手": "FamilyMart 全家", "type": "餐饮美食"},
        {"desc": "星巴克拿铁咖啡", "相手": "Starbucks 星巴克", "type": "餐饮美食"},
        {"desc": "瑞幸生椰拿铁", "相手": "Luckin Coffee 瑞幸咖啡", "type": "餐饮美食"},
    ]
    
    rows = []
    start_date = datetime.now() - timedelta(days=150)
    
    # 1. Generate subscriptions
    for sub in subs:
        current_date = start_date + timedelta(days=random.randint(0, 20))
        while current_date < datetime.now():
            rows.append({
                "time": current_date.strftime("%Y-%m-%d %H:%M:%S"),
                "type": "商户消费",
                "partner": sub["相手"],
                "product": sub["desc"],
                "dir": "支出",
                "amount": f"¥{sub['amount']:.2f}",
                "pay_method": "微信零钱",
                "status": "支付成功",
                "tx_id": f"WX{random.randint(1000000000, 9999999999)}",
                "merchant_id": f"MCH{random.randint(1000000000, 9999999999)}",
                "notes": "自动续费"
            })
            current_date += timedelta(days=sub["interval_days"])
            
    # 2. Generate one-offs
    current_date = start_date
    while current_date < datetime.now():
        for _ in range(random.randint(1, 2)):
            item = random.choice(one_offs)
            amount = random.uniform(8.00, 45.00)
            tx_time = current_date + timedelta(hours=random.randint(7, 21), minutes=random.randint(0, 59))
            rows.append({
                "time": tx_time.strftime("%Y-%m-%d %H:%M:%S"),
                "type": "商户消费",
                "partner": item["相手"],
                "product": item["desc"],
                "dir": "支出",
                "amount": f"¥{amount:.2f}",
                "pay_method": "零钱通",
                "status": "支付成功",
                "tx_id": f"WX{random.randint(1000000000, 9999999999)}",
                "merchant_id": f"MCH{random.randint(1000000000, 9999999999)}",
                "notes": "/"
            })
        current_date += timedelta(days=1)
        
    rows.sort(key=lambda x: x["time"], reverse=True)
    
    with open(filepath, 'w', newline='', encoding='gbk', errors='ignore') as f:
        f.write("微信支付账单明细\n")
        f.write("由Subdue辅助测试生成\n")
        f.write("微信昵称: TestUser\n")
        f.write("-------------------------------------------------------------------\n")
        
        writer = csv.writer(f)
        writer.writerow(headers)
        for r in rows:
            writer.writerow([
                r["time"], r["type"], r["partner"], r["product"], r["dir"],
                r["amount"], r["pay_method"], r["status"], r["tx_id"], r["merchant_id"], r["notes"]
            ])

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    files_dir = os.path.join(root_dir, "files")
    if not os.path.exists(files_dir):
        os.makedirs(files_dir)
        
    alipay_path = os.path.join(files_dir, "test_alipay.csv")
    wechat_path = os.path.join(files_dir, "test_wechat.csv")
    
    print("[+] 正在生成测试用支付宝账单 CSV...")
    generate_alipay_csv(alipay_path)
    print(f"[x] 生成成功：{alipay_path}")
    
    print("[+] 正在生成测试用微信支付账单 CSV...")
    generate_wechat_csv(wechat_path)
    print(f"[x] 生成成功：{wechat_path}")
    
    print("\n[*] 测试 CSV 账单生成完毕！您可以通过 Subdue Web 端系统设置中的『导入账单 (CSV)』来测试周期性订阅自动检测功能。")

if __name__ == "__main__":
    main()
