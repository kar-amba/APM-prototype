import type { z } from 'zod';
import {
  assetAttributeValueSchema,
  assetSchema,
  attributeDefinitionSchema,
  classificationSchema,
  criticalityAssessmentSchema,
  defectSchema,
  documentSchema,
  functionalLocationSchema,
  maintenanceTaskSchema,
  manufacturerSchema,
  notificationSchema,
  orgUnitSchema,
  personSchema,
  readingSchema,
  roundExecutionSchema,
  routePointSchema,
  routeSchema,
  statusSchema,
  statusSchemeSchema,
  strategySchema,
  transitionSchema,
  unitOfMeasureSchema,
} from '@/model';
import type { AppRepository } from './repository';
import {
  assetAttributeValueSeed,
  assetSeed,
  attributeDefinitionSeed,
  classificationSeed,
  criticalityAssessmentSeed,
  defectSeed,
  documentSeed,
  functionalLocationSeed,
  maintenanceTaskSeed,
  manufacturerSeed,
  notificationSeed,
  orgUnitSeed,
  personSeed,
  readingSeed,
  roundExecutionSeed,
  routePointSeed,
  routeSeed,
  statusSchemeSeed,
  statusSeed,
  strategySeed,
  transitionSeed,
  unitOfMeasureSeed,
} from './mock';

/** Минимальная форма сущности — у всех есть строковый `id`. */
export type Entity = { id: string };

/**
 * Описатель датасета: ключ репозитория, Zod-схема (для валидации на границе) и
 * сид. Единый источник для всех режимов хранения и для сброса к исходным данным.
 */
export interface EntityDescriptor {
  key: keyof AppRepository;
  schema: z.ZodType<Entity>;
  seed: readonly Entity[];
}

/** Хелпер: проверяет на этапе компиляции, что сид соответствует схеме. */
function ds<T extends Entity>(
  key: keyof AppRepository,
  schema: z.ZodType<T>,
  seed: readonly T[],
): EntityDescriptor {
  return { key, schema: schema as unknown as z.ZodType<Entity>, seed };
}

/** Все датасеты приложения (порядок учитывает зависимости при сидировании). */
export const DATASETS: EntityDescriptor[] = [
  ds('functionalLocations', functionalLocationSchema, functionalLocationSeed),
  ds('assets', assetSchema, assetSeed),
  ds('classifications', classificationSchema, classificationSeed),
  ds('attributeDefinitions', attributeDefinitionSchema, attributeDefinitionSeed),
  ds('assetAttributeValues', assetAttributeValueSchema, assetAttributeValueSeed),
  ds('statusSchemes', statusSchemeSchema, statusSchemeSeed),
  ds('statuses', statusSchema, statusSeed),
  ds('transitions', transitionSchema, transitionSeed),
  ds('strategies', strategySchema, strategySeed),
  ds('maintenanceTasks', maintenanceTaskSchema, maintenanceTaskSeed),
  ds('routes', routeSchema, routeSeed),
  ds('routePoints', routePointSchema, routePointSeed),
  ds('roundExecutions', roundExecutionSchema, roundExecutionSeed),
  ds('readings', readingSchema, readingSeed),
  ds('criticalityAssessments', criticalityAssessmentSchema, criticalityAssessmentSeed),
  ds('defects', defectSchema, defectSeed),
  ds('notifications', notificationSchema, notificationSeed),
  ds('manufacturers', manufacturerSchema, manufacturerSeed),
  ds('orgUnits', orgUnitSchema, orgUnitSeed),
  ds('persons', personSchema, personSeed),
  ds('unitsOfMeasure', unitOfMeasureSchema, unitOfMeasureSeed),
  ds('documents', documentSchema, documentSeed),
];
