import os
import re

models_dir = os.path.join(os.path.dirname(__file__), 'models')

for filename in os.listdir(models_dir):
    if filename.endswith(".py"):
        filepath = os.path.join(models_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Pattern to find ForeignKey("table.id") without ondelete
        # It looks for ForeignKey("some_string") optionally followed by nullable=...
        # and replaces it with ForeignKey("some_string", ondelete="CASCADE")
        
        # We will split by lines and replace
        lines = content.split('\n')
        new_lines = []
        changed = False
        
        for line in lines:
            if 'ForeignKey(' in line and 'ondelete="CASCADE"' not in line:
                # Find the string inside ForeignKey( ... )
                match = re.search(r'ForeignKey\((["\'][^"\']+["\'])', line)
                if match:
                    table_ref = match.group(1)
                    # Replace ForeignKey("table_ref" with ForeignKey("table_ref", ondelete="CASCADE"
                    new_line = line.replace(
                        f'ForeignKey({table_ref}', 
                        f'ForeignKey({table_ref}, ondelete="CASCADE"'
                    )
                    new_lines.append(new_line)
                    changed = True
                    continue
            new_lines.append(line)
            
        if changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write('\n'.join(new_lines))
            print(f"Fixed {filename}")
