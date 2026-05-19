# Safiba — Nigeria's Safety Intelligence Platform

Landing page + admin portal built with Next.js 16, Tailwind CSS, AWS DynamoDB, and AWS Cognito.

---

## AWS Setup

### 1. DynamoDB — Waitlist table

Create a table in the AWS Console (or via CLI):

```
Table name:   safiba-waitlist
Partition key: pk (String)
Sort key:      sk (String)
```

No secondary indexes needed for the waitlist. Billing mode: On-demand.

### 2. Cognito — Admin User Pool

1. Go to AWS Console → Cognito → Create User Pool
2. Sign-in options: **Email**
3. App client:
   - App type: **Public client**
   - Auth flows: enable **ALLOW_USER_PASSWORD_AUTH**
   - No client secret (public client)
4. Copy the **App client ID** → set as `COGNITO_USER_POOL_CLIENT_ID`
5. Create an admin user:
   - Console → User Pool → Users → Create user
   - Enter email + temporary password
   - User must change password on first login (use the AWS CLI or Console to set a permanent password)

### 3. IAM Permissions

The Amplify execution role (or local IAM user) needs:

```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:PutItem",
    "dynamodb:GetItem",
    "dynamodb:Scan",
    "dynamodb:DeleteItem"
  ],
  "Resource": "arn:aws:dynamodb:*:*:table/safiba-waitlist"
}
```

For Cognito:
```json
{
  "Effect": "Allow",
  "Action": [
    "cognito-idp:InitiateAuth",
    "cognito-idp:GlobalSignOut",
    "cognito-idp:GetUser"
  ],
  "Resource": "*"
}
```

---

## Environment Variables

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

On Amplify, set these in:
**Amplify Console → App → Environment variables**

| Variable | Description |
|---|---|
| `AWS_REGION` | e.g. `us-east-1` |
| `DYNAMODB_WAITLIST_TABLE` | DynamoDB table name (default: `safiba-waitlist`) |
| `COGNITO_USER_POOL_CLIENT_ID` | Cognito App Client ID |

> On Amplify, `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are **not needed** — the execution role provides credentials automatically.

---

## Local Development

```bash
cd safiba
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page.
Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin portal.

---

## Routes

| Route | Description |
|---|---|
| `/` | Public landing page with waitlist form |
| `/admin/login` | Admin sign-in (Cognito) |
| `/admin` | Dashboard — stats + signup chart |
| `/admin/waitlist` | Waitlist management + CSV export |
| `/admin/users` | User management (coming soon) |
| `/admin/incidents` | Incident management (coming soon) |
| `/admin/missing-persons` | Missing persons registry (coming soon) |
| `/admin/waitlist/export` | CSV download endpoint |

---

## Architecture

```
Next.js (Amplify)
├── Landing page          → Server Action → DynamoDB (waitlist)
├── Admin portal
│   ├── Auth              → AWS Cognito (USER_PASSWORD_AUTH)
│   ├── Session           → HTTP-only cookie (access token)
│   ├── Waitlist CRUD     → DynamoDB Scan/Delete
│   └── CSV export        → Route Handler
└── proxy.ts              → Cookie-based route guard for /admin/*
```

---

## Deploying to Amplify

1. Push to your Git repository
2. In Amplify Console → Connect branch
3. Build settings are auto-detected for Next.js
4. Add environment variables in Amplify Console
5. Ensure the Amplify service role has the IAM permissions above
