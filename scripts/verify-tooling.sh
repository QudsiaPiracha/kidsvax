#!/bin/bash
set -e

echo "Verifying project tooling..."

# GitHub CLI
if command -v gh &> /dev/null; then
  if gh auth status &> /dev/null; then
    echo "✓ GitHub CLI authenticated"
  else
    echo "✗ GitHub CLI not authenticated. Run: gh auth login"
    exit 1
  fi
else
  echo "⚠ GitHub CLI not installed. Run: brew install gh"
fi

# Vercel CLI
if command -v vercel &> /dev/null; then
  if vercel whoami &> /dev/null; then
    echo "✓ Vercel CLI authenticated"
  else
    echo "✗ Vercel CLI not authenticated. Run: vercel login"
    exit 1
  fi
else
  echo "⚠ Vercel CLI not installed. Run: npm i -g vercel"
fi

# Supabase CLI
if command -v supabase &> /dev/null; then
  if supabase projects list &> /dev/null 2>&1; then
    echo "✓ Supabase CLI authenticated"
  else
    echo "✗ Supabase CLI not authenticated. Run: supabase login"
    exit 1
  fi
else
  echo "⚠ Supabase CLI not installed. Run: brew install supabase/tap/supabase"
fi

# Node.js
if command -v node &> /dev/null; then
  echo "✓ Node.js $(node -v)"
else
  echo "✗ Node.js not installed"
  exit 1
fi

# Expo CLI
if command -v npx &> /dev/null && npx expo --version &> /dev/null; then
  echo "✓ Expo CLI available"
else
  echo "⚠ Expo CLI not available. Will be installed with dependencies."
fi

echo ""
echo "Tooling verification complete!"
