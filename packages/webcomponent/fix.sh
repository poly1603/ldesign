#!/bin/bash
file="src/components/progress/progress.tsx"
# Fix line 102-103 indentation
sed  -i  '102s/^        /    /'  "$file"
sed  -i  '103s/^        /    /'  "$file"
sed  -i  '105s/^        /    /'  "$file"
sed  -i  '106s/^        /    /'  "$file"

# Fix line 248 - add theme class properly  
sed  -i  "248s/.*/            this.theme !== 'default' ? \\`ldesign-progress--theme-\\${this.theme}\\` : '',/"  "$file"

# Add theme to renderCircleLike (after line 383)
sed  -i  "383a\            this.theme !== 'default' ? \\`ldesign-progress--theme-\\${this.theme}\\` : ''," "$file"
sed  -i  "384a\            this.type === 'dashboard' && this.dashboardVariant !== 'standard' ? \\`ldesign-progress--dashboard-\\${this.dashboardVariant}\\` : ''," "$file"

# Add theme to renderSteps (after line 538) 
sed  -i  "540a\            this.theme !== 'default' ? \\`ldesign-progress--theme-\\${this.theme}\\` : ''," "$file"

echo "Fixed!"
