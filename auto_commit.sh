#!/bin/bash

export PATH=/usr/bin:/bin:/usr/local/bin

cd /home/gaurav/Desktop/Path_Lab_Integration

# File update (agar nahi hai to ban jayegi)
echo "Updated on $(date)" >> daily_log.txt

# Git commands
/usr/bin/git add .
/usr/bin/git commit -m "Daily update: $(date)"
/usr/bin/git push origin main
