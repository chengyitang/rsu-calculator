# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RSU Calculator is a multi-company RSU (Restricted Stock Unit) vesting value calculator, built as a static web app (HTML/CSS/JS, no build step). Users input their grant details and current stock price to see vested/unvested share values over time.

Amazon is the first supported company and serves as the reference implementation for adding new companies.

## Development

Open `index.html` directly in a browser — no server or build step required.

## Architecture

### Company Vesting Policies

Each company is defined as a configuration object with its vesting schedule. Amazon's schedule is the canonical example:

- **Year 1:** 5%
- **Year 2:** 15%
- **Year 3:** 40% (20% every 6 months)
- **Year 4:** 40% (20% every 6 months)

To add a new company, add a new entry to the `COMPANIES` config object with its vesting tranches (date offsets + percentage).

### Key Concepts

- **Grant**: Number of shares + grant date. Multiple grants can be active simultaneously.
- **Vesting tranche**: A scheduled release of shares (a percentage at a specific time offset from grant date).
- **Current value**: Vested shares × current stock price input by the user.
