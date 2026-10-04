# PostgreSQL & Prisma Database Setup Guide

A structured guide for setting up a PostgreSQL database and running migrations using Prisma ORM.

---

## 1. PostgreSQL Database Setup

### Step 1: Open PostgreSQL CLI
Connect to PostgreSQL as the default `postgres` superuser:

```bash
sudo -u postgres psql
```

### Step 2: Create a New Database
Run the SQL command to create your database:

```sql
CREATE DATABASE resumegeniedb;
```

> **Note:** End SQL statements with a semicolon `;`.

### Step 3: Test the Database Connection
Exit the psql shell using `\q`, then connect directly to your newly created database to verify:

```bash
sudo -u postgres psql -d resumegeniedb
```

Inside the PostgreSQL prompt, verify the active database:

```sql
SELECT current_database();
```

Exit the shell:

```sql
\q
```

---

## 2. Prisma ORM Setup & Migration

### Step 1: Initialize Prisma
Create a `prisma` folder and a `schema.prisma` file in your project directory (or run `npx prisma init`):

```bash
npx prisma init
```

### Step 2: Configure Environment & Schema
1. Open `.env` and set your database connection URL:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/resumegeniedb?schema=public"
   ```
2. Define your models inside `prisma/schema.prisma`.

### Step 3: Format & Validate Schema
Format your Prisma schema to adhere to canonical styling:

```bash
npx prisma format
```

Check the schema for any syntax errors or broken relations:

```bash
npx prisma validate
```

### Step 4: Run Initial Migration
Generate and apply the initial migration to create database tables:

```bash
npx prisma migrate dev --name init
```

---

## 3. Handy Reference Commands

| Command | Description |
| :--- | :--- |
| `sudo -u postgres psql` | Connect to PostgreSQL as superuser |
| `\l` | List all databases (inside psql) |
| `\dt` | List all tables in current database (inside psql) |
| `npx prisma studio` | Open Prisma Studio GUI to view/edit database records |
| `npx prisma generate` | Regenerate Prisma Client after schema changes |