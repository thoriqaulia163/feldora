/**
 * Split Bill Database Layer — Barrel Export
 */

export { getDB, closeDB } from './database'
export {
  getAllParticipants,
  getParticipant,
  addParticipant,
  updateParticipant,
  deleteParticipant,
  participantNameExists,
  getAllBills,
  getActiveBills,
  getBillRecord,
  decryptBillPayload,
  createBill,
  updateBill,
  deleteBill,
  archiveBill,
  getSetting,
  setSetting,
  deleteSetting,
  hasSetting,
} from './services'
export type { ParticipantRecord, BillRecord, SplitBillDB, SettingsKey } from './schema'
export { DB_NAME, DB_VERSION } from './schema'
