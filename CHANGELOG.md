# 0.4.0 (2023-03-08)

Features

- Abolish Terminal first structure. All HTMLElements are treated as components.
- Making code more readable for future writing of doc.
- Making api more easy to use for future bundle.

Fix

- BUGS in 0.3.0

# 0.3.0 (2023-03-06)

Features

- start to write change log
- **cmd**: add split

BUGS

(!) Circular dependency
src/terminal/terminal.ts -> src/shell/xdsh.ts -> src/terminal/terminal.ts