import type { Status, StatusScheme, Transition } from '@/model';

/**
 * Сервис применения статусных схем: определяет разрешённые переходы между
 * состояниями. UI и репозиторий обращаются к нему, чтобы смена статуса сущности
 * уважала настроенную схему (см. план 06 «Статусные схемы»).
 */

/** Схема, применимая к типу сущности (первая подходящая по `entityKind`). */
export function findSchemeForEntity(
  entityKind: StatusScheme['entityKind'],
  schemes: StatusScheme[],
): StatusScheme | undefined {
  return schemes.find((s) => s.entityKind === entityKind);
}

/** Состояния конкретной схемы. */
export function statusesOfScheme(
  schemeId: string,
  statuses: Status[],
): Status[] {
  return statuses.filter((s) => s.schemeId === schemeId);
}

/** Переходы конкретной схемы. */
export function transitionsOfScheme(
  schemeId: string,
  transitions: Transition[],
): Transition[] {
  return transitions.filter((t) => t.schemeId === schemeId);
}

/** Разрешён ли переход из одного состояния в другое (тот же статус — всегда). */
export function isTransitionAllowed(
  fromStatusId: string,
  toStatusId: string,
  transitions: Transition[],
): boolean {
  if (fromStatusId === toStatusId) return true;
  return transitions.some(
    (t) => t.fromStatusId === fromStatusId && t.toStatusId === toStatusId,
  );
}

/** Состояния, в которые разрешён переход из текущего по схеме. */
export function allowedNextStatuses(
  currentStatusId: string,
  statuses: Status[],
  transitions: Transition[],
): Status[] {
  const targetIds = new Set(
    transitions
      .filter((t) => t.fromStatusId === currentStatusId)
      .map((t) => t.toStatusId),
  );
  return statuses.filter((s) => targetIds.has(s.id));
}
