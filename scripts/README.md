# Database Seeding Scripts

## Seed Teams and Matches

This script populates the database with all 48 World Cup 2026 teams and group stage matches.

### Features:
- ✅ Creates all 48 teams with flags, FIFA codes, and group assignments
- ✅ Creates all group stage matches (104 matches)
- ✅ **Converts all times to Romanian time (EEST, UTC+3)**
- ✅ Idempotent - can be run multiple times safely

### Usage:

```bash
npm run seed
```

### What it does:

1. **Seeds Teams** (48 teams across 12 groups A-L)
   - Team name, FIFA code, flag emoji, group assignment

2. **Seeds Group Stage Matches** (104 matches)
   - Match number, teams, scheduled time (in Romanian time), group, stage
   - All times are converted from various UTC offsets to **EEST (UTC+3)**

### Time Conversion Example:

Original: `2026-06-11, 13:00 UTC-6` (Mexico City time)
Converted: `2026-06-11, 22:00 EEST` (Romanian time)

### Important Notes:

- **Run this ONCE** after setting up the database
- If you need to re-seed, **delete all teams and matches first** or reset the database:
  ```bash
  npx prisma migrate reset
  npm run seed
  ```

- The script uses the JSON files:
  - `worldcup_teams_meta.json` - Team information
  - `worldcup.json` - Match schedule

### Troubleshooting:

If you get errors about duplicate teams:
```bash
# Reset the database and re-seed
npx prisma migrate reset
npm run seed
```

If you need to update match times or teams:
1. Edit the JSON files
2. Reset and re-seed the database
