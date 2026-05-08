---
name: testing-and-security
description: Standards and patterns for ensuring GymOS reliability through comprehensive testing and robust security practices.
---

# Testing and Security Skill

This skill defines the mandatory patterns and practices for maintaining the integrity, reliability, and security of the GymOS application.

## 🛡️ Security Best Practices

### 1. Authentication & Authorization
- **Auth Guarding**: Every Server Action and Route Handler MUST verify the user's session using `auth.api.getSession()`.
- **RBAC (Role-Based Access Control)**: Verify roles for administrative actions. Do not rely solely on being "logged in".
- **Sensitive Data Scoping**: Always filter database queries by `userId` or `memberId` to prevent IDOR (Insecure Direct Object Reference) vulnerabilities.

```typescript
// ✅ Good: Scoped by memberId from session
const member = await prisma.member.findUnique({ where: { userId: session.user.id } });
const data = await prisma.workoutLog.findMany({ where: { memberId: member.id } });
```

### 2. Input Validation
- Use **Zod** for all external inputs (Server Actions, API bodies).
- Never trust client-side data. Re-validate everything on the server.
- Sanitize strings to prevent XSS if they are to be rendered as HTML (though React handles most of this).

### 3. Database Security
- **Prisma Best Practices**: Use parameterized queries (handled by Prisma by default).
- **Environment Variables**: Never hardcode secrets. Use `.env` and ensure it's in `.gitignore`.
- **Audit Logs**: Critical actions (deletes, financial changes, role updates) MUST be logged in an `AuditLog` table.

## 🧪 Testing Strategy

### 1. Unit Testing (Logic)
- Use **Vitest** for testing utility functions and complex business logic.
- Target: 100% coverage for calculation logic (e.g., membership pricing, attendance stats).

### 2. Integration Testing (Actions)
- Test Server Actions by mocking the Prisma client and Auth session.
- Ensure failure cases (unauthorized, invalid input) are explicitly tested.

### 3. E2E Testing (User Flows)
- Use **Playwright** for critical path testing:
    - Member Login -> Check-in -> Workout Logging.
    - Admin Login -> Create Member -> Assign Membership.

## 📝 Error Handling & Logging
- **User-Facing Errors**: Use generic, helpful messages. Never leak stack traces or DB schema details to the client.
- **Internal Logs**: Use `console.error` with the full error object for server-side debugging.
- **Toast Notifications**: Always provide visual feedback for success/failure in the UI.

## 🛠️ Recommended Tools
- **Vitest**: Fast unit/integration testing.
- **Playwright**: Reliable E2E testing.
- **Zod**: Schema-first validation.
- **Better Auth**: Secure, extensible authentication.

## 🚨 Security Checklist
- [ ] Is this action protected by a session check?
- [ ] Are the inputs validated with Zod?
- [ ] Is the data query scoped to the current user/organization?
- [ ] Are we logging this critical change?
- [ ] Is sensitive information (passwords, tokens) handled only on the server?
