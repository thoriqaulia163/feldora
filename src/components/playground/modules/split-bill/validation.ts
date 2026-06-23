/**
 * Split Bill Form Validation
 *
 * Rules:
 * - Title required
 * - At least 2 participants
 * - All participants must have at least 1 item with price > 0
 * - Custom mode: sum of customTotals must equal total bill
 */

import { computeTotalBill, computeCustomTotalsSum, formatCurrency } from './splitCalculator'
import type { BillFormErrors, BillFormState } from './types'

/**
 * Validate the entire bill form.
 */
export function validateBillForm(state: BillFormState): BillFormErrors {
  const errors: BillFormErrors = {}

  if (!state.title.trim()) {
    errors.title = 'Title is required'
  }

  if (state.participants.length < 2) {
    errors.participants = 'At least 2 people required'
  }

  // Check items exist
  const totalItems = state.participants.reduce((sum, p) => sum + p.items.length, 0)
  if (totalItems === 0) {
    errors.items = 'Add at least 1 item'
  } else {
    const emptyPriceItems = state.participants.flatMap((p) =>
      p.items.filter((item) => item.price <= 0)
    )
    if (emptyPriceItems.length > 0) {
      errors.items = `${emptyPriceItems.length} item(s) have no price`
    }
  }

  // Custom mode: sum check
  if (state.splitMode === 'custom' && state.participants.length >= 2) {
    const totalBill = computeTotalBill(state.participants)
    const customSum = computeCustomTotalsSum(state.participants)
    if (totalBill > 0 && Math.abs(customSum - totalBill) > 0.01) {
      errors.customTotals = `Custom totals (${formatCurrency(customSum)}) must equal bill total (${formatCurrency(totalBill)})`
    }
  }

  return errors
}

/**
 * Check if form has any errors.
 */
export function hasErrors(errors: BillFormErrors): boolean {
  return Object.keys(errors).length > 0
}

/**
 * Collect all error messages into a single array for toast display.
 */
export function collectErrorMessages(errors: BillFormErrors): string[] {
  return Object.values(errors).filter((v): v is string => !!v)
}
