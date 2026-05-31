/**
 * Сиды демо-предприятия «ГлоуБайт-Металл» (металлургический / обогатительный
 * комбинат). Тематические файлы агрегируются здесь; репозиторий валидирует их
 * Zod-схемами при загрузке. Представительный срез по всем цехам — объём можно
 * масштабировать к целевому (150–300 единиц) добавлением записей в `assets.ts`.
 */
export { functionalLocationSeed } from './functional-locations';
export { assetSeed } from './assets';
export { classificationSeed, attributeDefinitionSeed } from './classifications';
export { assetAttributeValueSeed } from './attribute-values';
export { statusSchemeSeed, statusSeed, transitionSeed } from './status-schemes';
export { strategySeed, maintenanceTaskSeed } from './strategies';
export {
  routeSeed,
  routePointSeed,
  roundExecutionSeed,
  readingSeed,
} from './routes';
export { criticalityAssessmentSeed } from './criticality';
export { defectSeed, notificationSeed } from './reliability';
export {
  unitOfMeasureSeed,
  manufacturerSeed,
  orgUnitSeed,
  personSeed,
} from './catalogs';
export { documentSeed } from './documents';
