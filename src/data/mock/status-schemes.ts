import type { Status, StatusScheme, Transition } from '@/model';

/**
 * Статусные схемы (демо). Базовая схема жизненного цикла актива повторяет
 * `assetStatusSchema` — полноценный конструктор появится в разделе «Статусные
 * схемы» (план 06).
 */
export const statusSchemeSeed: StatusScheme[] = [
  { id: 'ss-asset', code: 'ASSET-LIFECYCLE', name: 'Жизненный цикл актива', entityKind: 'asset' },
  { id: 'ss-defect', code: 'DEFECT-FLOW', name: 'Обработка дефекта', entityKind: 'analysis' },
];

export const statusSeed: Status[] = [
  // Схема актива
  { id: 'st-asset-op', schemeId: 'ss-asset', code: 'in_operation', name: 'В работе', tone: 'success', isInitial: true, isFinal: false },
  { id: 'st-asset-standby', schemeId: 'ss-asset', code: 'standby', name: 'В резерве', tone: 'info', isInitial: false, isFinal: false },
  { id: 'st-asset-maint', schemeId: 'ss-asset', code: 'maintenance', name: 'На обслуживании', tone: 'warning', isInitial: false, isFinal: false },
  { id: 'st-asset-fault', schemeId: 'ss-asset', code: 'fault', name: 'Неисправен', tone: 'error', isInitial: false, isFinal: false },
  { id: 'st-asset-decom', schemeId: 'ss-asset', code: 'decommissioned', name: 'Выведен из эксплуатации', tone: 'default', isInitial: false, isFinal: true },
  // Схема дефекта
  { id: 'st-def-open', schemeId: 'ss-defect', code: 'open', name: 'Открыт', tone: 'error', isInitial: true, isFinal: false },
  { id: 'st-def-prog', schemeId: 'ss-defect', code: 'in_progress', name: 'В работе', tone: 'warning', isInitial: false, isFinal: false },
  { id: 'st-def-resolved', schemeId: 'ss-defect', code: 'resolved', name: 'Устранён', tone: 'success', isInitial: false, isFinal: false },
  { id: 'st-def-closed', schemeId: 'ss-defect', code: 'closed', name: 'Закрыт', tone: 'default', isInitial: false, isFinal: true },
];

export const transitionSeed: Transition[] = [
  // Актив
  { id: 'tr-asset-op-maint', schemeId: 'ss-asset', fromStatusId: 'st-asset-op', toStatusId: 'st-asset-maint' },
  { id: 'tr-asset-op-fault', schemeId: 'ss-asset', fromStatusId: 'st-asset-op', toStatusId: 'st-asset-fault' },
  { id: 'tr-asset-op-standby', schemeId: 'ss-asset', fromStatusId: 'st-asset-op', toStatusId: 'st-asset-standby' },
  { id: 'tr-asset-standby-op', schemeId: 'ss-asset', fromStatusId: 'st-asset-standby', toStatusId: 'st-asset-op' },
  { id: 'tr-asset-maint-op', schemeId: 'ss-asset', fromStatusId: 'st-asset-maint', toStatusId: 'st-asset-op' },
  { id: 'tr-asset-fault-maint', schemeId: 'ss-asset', fromStatusId: 'st-asset-fault', toStatusId: 'st-asset-maint' },
  { id: 'tr-asset-maint-decom', schemeId: 'ss-asset', fromStatusId: 'st-asset-maint', toStatusId: 'st-asset-decom' },
  // Дефект
  { id: 'tr-def-open-prog', schemeId: 'ss-defect', fromStatusId: 'st-def-open', toStatusId: 'st-def-prog' },
  { id: 'tr-def-prog-resolved', schemeId: 'ss-defect', fromStatusId: 'st-def-prog', toStatusId: 'st-def-resolved' },
  { id: 'tr-def-resolved-closed', schemeId: 'ss-defect', fromStatusId: 'st-def-resolved', toStatusId: 'st-def-closed' },
];
