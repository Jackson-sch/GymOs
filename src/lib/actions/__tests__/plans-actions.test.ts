import { describe, it, expect, vi } from 'vitest';

// Create a deep mock for prisma
const mockPrisma = vi.hoisted(() => ({
  plan: {
    findMany: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock session verification
import { getPlansAction } from '../plans-actions';

vi.mock('@/lib/security', () => ({
  verifySession: vi.fn().mockResolvedValue(true),
}));

describe('Plans Server Actions', () => {
  it('should return a list of plans successfully', async () => {
    // Arrange
    const mockPlans = [
      { id: '1', name: 'Plan A', price: 100, _count: { memberships: 5 } }
    ];
    
    mockPrisma.plan.findMany.mockResolvedValue(mockPlans);

    // Act
    const result = await getPlansAction();

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(mockPrisma.plan.findMany).toHaveBeenCalledTimes(1);
  });

  it('should handle errors gracefully', async () => {
    // Arrange
    mockPrisma.plan.findMany.mockRejectedValue(new Error('Database error'));

    // Act
    const result = await getPlansAction();

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Error al cargar planes');
  });
});
