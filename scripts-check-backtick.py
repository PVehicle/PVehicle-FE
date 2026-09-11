"""Tim backtick trong comment nam ben trong template literal.

Backtick o day ket thuc chuoi `template:` hoac `styles:` som, sinh ra
hang loat loi bien dich kho doc. Chay truoc moi lan build de bat som.
"""
import io
import glob
import re
import sys

bad = []
for path in glob.glob('src/**/*.ts', recursive=True):
    source = io.open(path, encoding='utf-8').read()
    for match in re.finditer(r"(template|styles):\s*`(.*?)`,\n", source, re.S):
        for line in match.group(2).split('\n'):
            stripped = line.strip()
            if stripped.startswith('//') and '`' in stripped:
                bad.append((path, stripped[:70]))

if bad:
    print('LOI: backtick trong comment cua template/styles:')
    for path, line in bad:
        print('  %s\n    %s' % (path, line))
    sys.exit(1)

print('OK: khong co backtick trong comment cua template/styles')
