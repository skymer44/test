#!/bin/bash

# Script de commit rapide pour éviter les blocages
# Usage: ./quick-commit.sh "message de commit"

if [ -z "$1" ]; then
    echo "Usage: ./quick-commit.sh \"message de commit\""
    exit 1
fi

MESSAGE="$1"
TIMESTAMP=$(date +'%Y-%m-%d %H:%M')

echo "🚀 Commit rapide: $MESSAGE"

# Configuration Git anti-blocage
export GIT_EDITOR=true
export EDITOR=true
export VISUAL=true

# Add, commit et push en une fois
git add .
git commit -m "$MESSAGE - $TIMESTAMP" --no-edit
git push origin main

echo "✅ Terminé !"
