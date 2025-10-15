#!/bin/bash
cd "D:\WorkBench\ldesign\packages\webcomponent"
sed -i '248s/.*/            this.theme !== '\''default'\'' ? `ldesign-progress--theme-${this.theme}` : '\'''',/' src/components/progress/progress.tsx
