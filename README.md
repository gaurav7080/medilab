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
└── public/
    ├── index.html
    ├── explore.html
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

Then open `http://localhost:8000/public/index.html` in your browser.

## Contents

- `public/index.html` — Login page
- `public/explore.html` — Explore page
- `public/register.html` — User registration page
- `public/dashboard.html` — Main dashboard
- `public/book-test.html` — Book laboratory tests
- `public/bookings.html` — View bookings
- `public/manage-tests.html` — Manage available tests
- `public/reports.html` — View reports
- `public/upload-reports.html` — Upload new reports
- `public/assets/css/` — Stylesheets
- `public/assets/js/` — JavaScript logic

## Notes

- This repository is organized as a static website project.
- Keep all HTML pages inside `public/` so the site can be served cleanly.
- Use `.gitignore` to exclude editor and system files.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
