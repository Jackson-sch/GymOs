# Security & Audit Patterns

## Audit Log Schema Suggestion

Add this to your `schema.prisma` to track sensitive administrative actions.

```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String   // e.g., "DELETE_MEMBER", "UPDATE_MEMBERSHIP_PRICE"
  entity    String   // e.g., "Member", "Membership"
  entityId  String
  details   Json?    // Store old/new values
  ipAddress String?
  createdAt DateTime @default(now())
}
```

## Secure Action Pattern

Use this template for every Server Action.

```typescript
export async function secureAction(data: any) {
  // 1. Authenticate
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  // 2. Validate Input
  const validatedData = schema.parse(data);

  // 3. Authorize (RBAC)
  if (session.user.role !== "ADMIN") throw new Error("Forbidden");

  // 4. Execute Scoped Logic
  const result = await prisma.entity.update({
    where: { id: validatedData.id, organizationId: session.user.orgId },
    data: validatedData
  });

  // 5. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE_ENTITY",
      entity: "Entity",
      entityId: result.id,
      details: { change: "..." }
    }
  });

  return result;
}
```
