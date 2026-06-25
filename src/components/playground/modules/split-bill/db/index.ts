/**
 * Split Bill Database Layer — Barrel Export
 */

export { getDB, closeDB, deleteDatabase } from './database'
export {
  getAllParticipants,
  addParticipant,
  updateParticipant,
  deleteParticipant,
  participantNameExists,
  getActiveBills,
  getBillRecord,
  decryptBillTitle,
  decryptBillPayload,
  createBill,
  updateBill,
  deleteBill,
  archiveBill,
  getSetting,
  setSetting,
  deleteSetting,
  hasSetting,
  type DecryptedParticipant,
  type BillListRecord,
} from './services'
export type { ParticipantRecord, BillRecord, SplitBillDB, SettingsKey } from './schema'
export { DB_NAME, DB_VERSION } from './schema'
