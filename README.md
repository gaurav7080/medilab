# MediLab - Medical Laboratory Management System

![version](https://img.shields.io/badge/version-1.0.0-blue)
![license](https://img.shields.io/badge/license-MIT-green)
![status](https://img.shields.io/badge/status-Active-brightgreen)

A static web-based **Medical Laboratory Management System** built with HTML, CSS, and JavaScript for managing patient bookings, reports, and lab operations.

## Project layout

```
/path-lab-integration/
├── README.md
├── LICENSE
├── .gitignore
├── auto_commit.sh
├── daily_log.txt
├── index.html
├── login.html
├── register.html
├── dashboard.html
├── book-test.html
├── bookings.html
├── manage-tests.html
├── reports.html
├── upload-reports.html
└── assets/
    ├── css/
    │   ├── explore.css
    │   └── style.css
    └── js/
        └── script.js
```

## Getting started

### Run locally

Open a terminal in the repository root and run one of these commands:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html` in your browser.

## Contents

- `index.html` — Login page
- `explore.html` — Explore page
- `register.html` — User registration page
- `dashboard.html` — Main dashboard
- `book-test.html` — Book laboratory tests
- `bookings.html` — View bookings
- `manage-tests.html` — Manage available tests
- `reports.html` — View reports
- `upload-reports.html` — Upload new reports
- `assets/css/` — Stylesheets
- `assets/js/` — JavaScript logic

## Notes

- This repository is organized as a static website project.
- Keep all HTML pages inside the root folder so the site can be served cleanly.
- Use `.gitignore` to exclude editor and system files.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
