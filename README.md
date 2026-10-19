# QPET LMS — Learning Management System

Production-ready, responsive, secure, and professional Learning Management System built for **QPET** to manage student registrations, course enrollments, course fees, installment payments, fee receipts, and certificates.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ (App Router, Server Actions & Route Handlers, TypeScript)
- **Database**: MongoDB with Mongoose (Atlas & local connection pooling)
- **UI & Styling**: Tailwind CSS (custom dark slate and teal/gold theme)
- **Icons**: `lucide-react`
- **Authentication**: Secure HTTP-only JWT session cookies with `jose` and `bcryptjs`
- **PDF Generation**: `jspdf` & `jspdf-autotable` with QR code generation via `qrcode`
- **Data Export**: RFC-4180 compliant CSV exports with UTF-8 BOM for Microsoft Excel

---

## 🚀 Key Features

### 1. Dual Portals & Role-Based Access Control
- **Admin Panel (`/admin/*`)**: Complete management of registrations, students, courses, enrollments, fees, installments, PDF fee receipts, certificate issuance/revocation, reports, and system audit logs.
- **Student Portal (`/student/*`)**: Secure portal where students view their personal profile, enrolled courses, fee balances, installment due dates, downloadable PDF receipts, and certificates.
- **Public Certificate Verification (`/verify-certificate`)**: Publicly accessible lookup page to verify certificate authenticity by number or QR code without leaking any PII (no phone, email, address, or DOB).

### 2. Atomic Sequential Enrollment Numbering (`QPET-YYYY-NNNNN`)
- Automatically generated on the server when a course enrollment is created.
- Format: `QPET-YYYY-NNNNN` (e.g. `QPET-2026-00001`).
- Atomic, concurrency-safe counter per calendar year powered by MongoDB's `$inc` operator.
- Permanent: Never modified or reused, even if cancelled.
- Pending registrations do not consume enrollment numbers until officially approved.

### 3. Course Management
- Pre-seeded with the 9 initial Computer Courses:
  1. Computer Fundamentals
  2. Basic Computer Course (BCC)
  3. Course on Computer Concepts (CCC)
  4. Computer Applications
  5. MS Office (Word, Excel, PowerPoint)
  6. Advanced Excel
  7. Internet & Email
  8. Hindi & English Typing
  9. Data Entry Operator (DEO)
- **Snapshot Preservation**: When an enrollment is created, an immutable snapshot of the agreed fee and course duration is saved. Future changes to default fees do not affect existing students.

### 4. Fees, Installments & Automatic PDF Receipts
- Supports **Full Payment** and **Installment-Based Payment** plans.
- Payment recording for **Cash**, **UPI**, and **Bank Transfer** with transaction references and server-side balance validation.
- Auto-allocates payments to pending or overdue installments.
- Generates a unique fee receipt (`QPET-REC-YYYY-NNNNN`) immediately after saving payment.
- Downloadable vector PDF receipt styled with institutional borders, financial breakdown, and signature blocks.

### 5. Manual Certificate Issuance & Revocation
- Certificate issuance is explicitly controlled by Admin.
- Auto-generates certificate numbers (`QPET-CERT-YYYY-NNNNN`) or allows custom numbering.
- Generates a landscape completion certificate PDF with embedded verification QR code.
- Immediate revocation support with audit reason.

### 6. Reports & Microsoft Excel CSV Export
- Exportable reports for:
  - Student Registration Records
  - Course-wise Enrollments
  - Payment Collection History
  - Course-wise Fee Collections
  - Outstanding Student Balances
  - Installment Schedules (Pending/Overdue)
  - Certificate Records
- Exports with UTF-8 BOM (`\uFEFF`) for immediate Microsoft Excel compatibility.

### 7. Audit Trail
- Comprehensive audit log for all payment recordings, receipt creations, certificate issuances, revocations, and student approvals.

---

## 💻 Getting Started

### Prerequisites
- Node.js 18+ (tested with v24.18.0)
- npm 10+
- MongoDB instance (MongoDB Atlas or local MongoDB)

### 1. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# MongoDB Database Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/qpet_lms?retryWrites=true&w=majority

# JWT Session Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Default Initial Administrator
DEFAULT_ADMIN_EMAIL=admin@qpet.org
DEFAULT_ADMIN_PASSWORD=Admin@QPET2026

# App URL
NEXT_PUBLIC_APP_NAME="QPET LMS"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Database
Seeds the 9 initial computer courses and the default Admin account:
```bash
node scripts/seed.js
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Credentials

- **Admin Login**:
  - URL: `/login` (Select Admin tab)
  - Identifier: `admin@qpet.org`
  - Password: `Admin@QPET2026`
- **Student Registration**:
  - URL: `/register`
  - Fill out form & select course -> wait for Admin approval under `/admin/registrations`.

---

## 🔒 Security Measures

1. **Password Hashing**: Salted `bcryptjs` hashing. Plaintext passwords are never stored.
2. **Session Security**: HTTP-only, secure, `SameSite=lax` signed JWT cookies.
3. **Role-Based Guards**: Strict server-side route guards on both API routes and Edge middleware.
4. **Data Isolation**: Students can query only their own records (`studentId` checked against verified session token).
5. **PII Protection**: Public certificate verification endpoint reveals zero contact or personal information.
6. **Idempotency & Concurrency**: Atomic counter increments prevent race conditions and duplicate enrollment numbers.

---

## 📦 Production Build

```bash
npm run build
npm start
```
