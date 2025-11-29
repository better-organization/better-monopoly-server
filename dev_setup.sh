#!/bin/sh
# dev_setup.sh: Set up git hooks for development

HOOKS_DIR=".git/hooks"

# Pre-push hook: run lint and tests before pushing
cat <<'EOF' > "$HOOKS_DIR/pre-push"
#!/bin/sh
  yarn lint
if [ $? -ne 0 ]; then
  echo "Lint failed. Push aborted."
  exit 1
fi
  yarn test
if [ $? -ne 0 ]; then
  echo "Tests failed. Push aborted."
  exit 1
fi
echo "Lint and tests passed. Proceeding with push."
exit 0
EOF
chmod +x "$HOOKS_DIR/pre-push"

echo "Git hooks installed: pre-push (lint & test)"
