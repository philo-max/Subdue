import os
import sys

def count_lines(filepath):
    """
    Counts total lines, blank lines, comment lines, and physical code lines in a file.
    """
    total = 0
    blank = 0
    comment = 0
    code = 0
    
    # Try different encodings
    encodings = ['utf-8', 'gbk', 'gb18030', 'utf-16']
    content = []
    
    for enc in encodings:
        try:
            with open(filepath, 'r', encoding=enc) as f:
                content = f.readlines()
            break
        except UnicodeDecodeError:
            continue
            
    if not content:
        # Fallback to binary/ignore errors
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.readlines()
        except Exception:
            return 0, 0, 0, 0
            
    ext = os.path.splitext(filepath)[1].lower()
    
    for line in content:
        total += 1
        stripped = line.strip()
        
        if not stripped:
            blank += 1
            continue
            
        # Check for single line comments
        if ext in ['.js', '.jsx', '.ts', '.tsx']:
            if stripped.startswith('//') or stripped.startswith('/*') or stripped.endswith('*/'):
                comment += 1
            else:
                code += 1
        elif ext in ['.py']:
            if stripped.startswith('#'):
                comment += 1
            else:
                code += 1
        elif ext in ['.css']:
            if stripped.startswith('/*') or stripped.endswith('*/'):
                comment += 1
            else:
                code += 1
        elif ext in ['.html']:
            if stripped.startswith('<!--') or stripped.endswith('-->'):
                comment += 1
            else:
                code += 1
        else:
            code += 1
            
    return total, blank, comment, code

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Folders to scan
    scan_configs = [
        {
            "name": "Web 前端 (Vite + React)",
            "dir": os.path.join(root_dir, "src"),
            "exts": ['.js', '.jsx', '.css', '.html']
        },
        {
            "name": "Mobile 移动端 (Expo + React Native)",
            "dir": os.path.join(root_dir, "mobile"),
            "exts": ['.ts', '.tsx'],
            "exclude_dirs": ["node_modules", ".expo", ".vscode", "assets", "dist"]
        },
        {
            "name": "Python 后端与脚本",
            "dir": os.path.join(root_dir, "scripts"),
            "exts": ['.py']
        }
    ]
    
    print("=" * 65)
    print("               SUBDUE 代码行数统计报表 (软著申报专用)")
    print("=" * 65)
    print(f"{'组件/目录':<35} | {'总行数':>7} | {'空白行':>6} | {'注释行':>6} | {'有效代码':>7}")
    print("-" * 65)
    
    grand_total = 0
    grand_blank = 0
    grand_comment = 0
    grand_code = 0
    
    for config in scan_configs:
        target_dir = config["dir"]
        if not os.path.exists(target_dir):
            continue
            
        comp_total = 0
        comp_blank = 0
        comp_comment = 0
        comp_code = 0
        
        exclude_dirs = config.get("exclude_dirs", ["node_modules", "dist", "build"])
        
        for root, dirs, files in os.walk(target_dir):
            # Prune directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in config["exts"]:
                    path = os.path.join(root, file)
                    t, b, c, cd = count_lines(path)
                    
                    comp_total += t
                    comp_blank += b
                    comp_comment += c
                    comp_code += cd
                    
        print(f"{config['name']:<35} | {comp_total:>7} | {comp_blank:>6} | {comp_comment:>6} | {comp_code:>7}")
        
        grand_total += comp_total
        grand_blank += comp_blank
        grand_comment += comp_comment
        grand_code += comp_code
        
    print("-" * 65)
    print(f"{'合计 (Grand Total)':<35} | {grand_total:>7} | {grand_blank:>6} | {grand_comment:>6} | {grand_code:>7}")
    print("=" * 65)
    print(f"软著有效申报代码行数 (有效代码): {grand_code} 行")
    print(f"软著所需 60 页源代码估算 (按每页 50 行有效代码计): 最多可提供 {grand_code // 50} 页。")
    print("=" * 65)

if __name__ == "__main__":
    main()
