#!/bin/bash

export PATH=/usr/bin:/bin:/usr/local/bin

cd /home/gaurav/Desktop/Path_Lab_Integration

# Internet check
ping -c 1 google.com > /dev/null 2>&1 || exit 0

# Aaj ke commits count karo
COUNT=$(git log --since="today" --oneline | grep -c "Daily update")

# Agar already 4 commits ho gaye → stop
if [ "$COUNT" -ge 4 ]; then
  echo "Limit reached today $(date)" >> cron_debug.txt
  exit 0
fi

# File update
echo "Updated on $(date)" >> daily_log.txt

# Git commands
/usr/bin/git add .
/usr/bin/git commit -m "Daily update: $(date)"
/usr/bin/git push origin main >> cron_debug.txt 2>&1
