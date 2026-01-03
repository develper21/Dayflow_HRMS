import { describe, it, expect } from 'vitest'
import { generateEmployeeId, formatCurrency, formatDate, calculateWorkHours } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('generateEmployeeId', () => {
    it('should generate employee ID in correct format', () => {
      const employeeId = generateEmployeeId('GC', 'John', 'Doe', 2024, 1)
      expect(employeeId).toBe('GCJODO240001')
    })

    it('should handle different names', () => {
      const employeeId = generateEmployeeId('ABC', 'Alice', 'Smith', 2023, 123)
      expect(employeeId).toBe('ABALSM230123')
    })
  })

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const formatted = formatCurrency(50000)
      expect(formatted).toContain('₹')
      expect(formatted).toContain('50,000')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15')
      const formatted = formatDate(date)
      expect(formatted).toBeDefined()
    })
  })

  describe('calculateWorkHours', () => {
    it('should calculate work hours correctly', () => {
      const checkIn = new Date('2024-01-15T09:00:00')
      const checkOut = new Date('2024-01-15T18:00:00')
      const hours = calculateWorkHours(checkIn, checkOut)
      expect(hours).toBe(9)
    })
  })
})
