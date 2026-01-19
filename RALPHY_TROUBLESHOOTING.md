# Troubleshooting Ralphy

Common issues and fixes when running Ralphy. This guide is designed for both humans and AI agents to diagnose and fix Ralphy issues.

---

## Quick Start Checklist (Run This First)

Before debugging, run this checklist to fix the most common issues:

```bash
# 1. Fix Windows line endings (CRLF → LF)
sed -i 's/\r$//' ralphy.sh

# 2. Fix arithmetic bug that causes instant exit
sed -i 's/((iteration++))/((iteration++)) || true/g' ralphy.sh

# 3. Create progress.txt if missing
touch progress.txt

# 4. For OpenCode: Create opencode.json config
cat > opencode.json << 'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "model": "zai-coding-plan/glm-4.7"
}
EOF

# 5. Verify PRD.md exists and has uncompleted tasks
grep -c '^\- \[ \]' PRD.md
```

---

## Ralphy Exits Immediately After Showing Header

**Symptoms:**
```
============================================
Ralphy - Running until PRD is complete
Engine: OpenCode
Source: markdown (PRD.md)
============================================
```
Then immediately returns to shell prompt with no error message.

### Cause 1: Windows CRLF Line Endings (Most Common)

If `ralphy.sh` was edited or transferred on Windows, it may have CRLF (`\r\n`) line endings instead of Unix LF (`\n`).

**Diagnosis:**
```bash
file ralphy.sh
```

If output includes `with CRLF` or `CRLF, LF line terminators`, this is the problem.

**Fix:**
```bash
sed -i 's/\r$//' ralphy.sh
```

Or in PowerShell using Git Bash:
```powershell
& "C:\Program Files\Git\bin\bash.exe" -c "sed -i 's/\r$//' ralphy.sh"
```

### Cause 2: Arithmetic Bug with `set -e`

The script uses `set -euo pipefail` which exits on any command returning non-zero. The line `((iteration++))` when `iteration=0` evaluates to `((0))` which returns exit code 1.

**Diagnosis:**
Check if lines ~1577 and ~2023 have:
```bash
((iteration++))
```

**Fix:**
Change both occurrences to:
```bash
((iteration++)) || true
```

**Quick fix command:**
```bash
sed -i 's/((iteration++))/((iteration++)) || true/g' ralphy.sh
```

### Cause 3: PRD.md Not Found

**Diagnosis:**
```bash
ls -la PRD.md
```

**Fix:**
Create a PRD.md file with tasks:
```markdown
# Tasks

- [ ] First task to complete
- [ ] Second task to complete
```

### Cause 4: All Tasks Already Complete

**Diagnosis:**
```bash
grep -c '^\- \[ \]' PRD.md   # Uncompleted tasks
grep -c '^\- \[x\]' PRD.md   # Completed tasks
```

If uncompleted count is 0, all tasks are done.

**Fix:**
Add new uncompleted tasks or reset completed tasks by changing `[x]` back to `[ ]`.

### Cause 5: AI CLI Not Authenticated

**Diagnosis:**
```bash
# For OpenCode
opencode auth list

# For Claude Code
claude --version

# For Codex
codex --version
```

**Fix:**
Authenticate with your chosen AI provider before running Ralphy.

---

## OpenCode Not Executing Tasks Properly

**Symptoms:**
- Ralphy shows "Done" for each task but completed count stays at 0
- OpenCode outputs "I need to read your PRD" or similar
- Malformed function calls in output (XML-like tags printed as text)
- Tasks cycle endlessly without progress

**Cause:**
Missing `opencode.json` configuration file in the project directory.

**Fix:**
Create an `opencode.json` file in your project root:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "zai-coding-plan/glm-4.7"
}
```

Replace the model with your preferred provider/model. Available models can be listed with:
```bash
opencode models
```

**Common models:**
- `zai-coding-plan/glm-4.7` - Z.AI GLM 4.7 (recommended for coding tasks)
- `opencode/glm-4.7-free` - OpenCode free tier
- `github-copilot/claude-sonnet-4` - GitHub Copilot with Claude
- `github-copilot/gpt-4o` - GitHub Copilot with GPT-4o

---

## Verbose Mode for Debugging

Run with `--verbose` to see detailed output:
```bash
./ralphy.sh --opencode --verbose
```

---

## Running on Windows

Always use Git Bash to run Ralphy on Windows:
```powershell
& "C:\Program Files\Git\bin\bash.exe" ralphy.sh --opencode
```

Or from Git Bash directly:
```bash
./ralphy.sh --opencode
```

**Important Windows-specific issues:**
1. Line endings MUST be LF, not CRLF
2. Use Git Bash, not PowerShell or CMD directly
3. Paths with spaces need proper quoting

---

## Complete Diagnostic Checklist

Run these commands to diagnose issues:

```bash
# 1. Check line endings (should NOT mention CRLF)
file ralphy.sh

# 2. Check PRD exists and has tasks
ls PRD.md && grep -c '^\- \[ \]' PRD.md

# 3. Check progress.txt exists
ls progress.txt || touch progress.txt

# 4. Check AI CLI is available
which opencode || which claude || which codex

# 5. Check OpenCode config exists (for --opencode mode)
cat opencode.json 2>/dev/null || echo "No opencode.json - create one!"

# 6. Check OpenCode authentication
opencode auth list

# 7. Run verbose mode
./ralphy.sh --opencode --verbose
```

---

## Quick Fix Script

Save this as `fix-ralphy.sh` and run it to fix all common issues at once:

```bash
#!/bin/bash
set -e

echo "Fixing Ralphy issues..."

# Fix CRLF line endings
if file ralphy.sh | grep -q CRLF; then
  echo "Fixing CRLF line endings..."
  sed -i 's/\r$//' ralphy.sh
fi

# Fix arithmetic bug
if grep -q '((iteration++))$' ralphy.sh; then
  echo "Fixing arithmetic bug..."
  sed -i 's/((iteration++))/((iteration++)) || true/g' ralphy.sh
fi

# Create progress.txt if missing
if [[ ! -f progress.txt ]]; then
  echo "Creating progress.txt..."
  echo "# Progress Log" > progress.txt
fi

# Check for opencode.json
if [[ ! -f opencode.json ]]; then
  echo ""
  echo "WARNING: No opencode.json found!"
  echo "Create one with your preferred model:"
  echo ""
  echo 'cat > opencode.json << EOF'
  echo '{'
  echo '  "$schema": "https://opencode.ai/config.json",'
  echo '  "model": "zai-coding-plan/glm-4.7"'
  echo '}'
  echo 'EOF'
  echo ""
fi

# Verify PRD.md
if [[ ! -f PRD.md ]]; then
  echo "ERROR: PRD.md not found! Create a PRD with tasks."
  exit 1
fi

remaining=$(grep -c '^\- \[ \]' PRD.md 2>/dev/null || echo "0")
echo ""
echo "Fixes applied successfully!"
echo "PRD.md has $remaining uncompleted tasks."
echo ""
echo "Run Ralphy with:"
echo "  ./ralphy.sh --opencode"
```

---

## PRD.md Format Reference

Ralphy expects this markdown format:

```markdown
# Project Name

## Phase 1: Setup
- [ ] First uncompleted task
- [ ] Second uncompleted task
- [x] Completed task (will be skipped)

## Phase 2: Implementation
- [ ] Another task
- [ ] Yet another task
```

**Rules:**
- Tasks start with `- [ ]` (uncompleted) or `- [x]` (completed)
- Ralphy processes tasks top-to-bottom
- Ralphy marks tasks complete by changing `[ ]` to `[x]`
- Comments, headers, and other markdown are ignored

---

## Engine-Specific Notes

### OpenCode
- Requires `opencode.json` in project root
- Uses `@file` syntax to include file contents
- Authenticate with: `opencode auth`

### Claude Code
- Default engine, no config file needed
- Uses `-p` flag for prompts
- Authenticate with: `claude auth`

### Codex
- Uses `codex exec --full-auto`
- Authenticate with: `codex auth`

### Cursor
- Uses `agent` CLI
- Requires Cursor to be installed with CLI enabled

---

## Still Having Issues?

1. **Check the output file**: Ralphy writes AI output to a temp file. Run with `--verbose` to see the path.

2. **Test the AI CLI directly**:
   ```bash
   # Test OpenCode
   opencode run "Say hello"

   # Test Claude Code
   claude -p "Say hello"
   ```

3. **Check for conflicting processes**: Kill any hung Ralphy processes:
   ```bash
   pkill -f ralphy.sh
   ```

4. **Start fresh**: Delete temp files and try again:
   ```bash
   rm -f progress.txt
   touch progress.txt
   ./ralphy.sh --opencode
   ```
