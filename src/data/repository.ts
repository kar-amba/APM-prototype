import type {
  AppDocument,
  Asset,
  AssetAttributeValue,
  AttributeDefinition,
  Classification,
  CriticalityAssessment,
  Defect,
  FunctionalLocation,
  MaintenanceTask,
  Manufacturer,
  Notification,
  OrgUnit,
  Person,
  Reading,
  Route,
  RoundExecution,
  RoutePoint,
  Status,
  StatusScheme,
  Strategy,
  Transition,
  UnitOfMeasure,
} from '@/model';

/**
 * Слой доступа к данным. Остальной код зависит только от этого интерфейса,
 * а не от конкретного хранилища (in-memory / localStorage / Dexie / БД).
 *
 * Реализации режимов хранения подключаются в `data/index.ts` фабрикой —
 * остальной код при смене режима не меняется.
 */
export interface Repository<T extends { id: string }> {
  list(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  create(entity: T): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
}

/**
 * Совокупность репозиториев по всем сущностям v1. Разделы продукта работают с
 * данными только через эти репозитории.
 */
export interface AppRepository {
  // Реестр
  functionalLocations: Repository<FunctionalLocation>;
  assets: Repository<Asset>;
  // Классификация и атрибуты
  classifications: Repository<Classification>;
  attributeDefinitions: Repository<AttributeDefinition>;
  assetAttributeValues: Repository<AssetAttributeValue>;
  // Статусные схемы
  statusSchemes: Repository<StatusScheme>;
  statuses: Repository<Status>;
  transitions: Repository<Transition>;
  // Стратегии и мероприятия
  strategies: Repository<Strategy>;
  maintenanceTasks: Repository<MaintenanceTask>;
  // Обходы и маршруты
  routes: Repository<Route>;
  routePoints: Repository<RoutePoint>;
  roundExecutions: Repository<RoundExecution>;
  readings: Repository<Reading>;
  // Критичность
  criticalityAssessments: Repository<CriticalityAssessment>;
  // Надёжность
  defects: Repository<Defect>;
  notifications: Repository<Notification>;
  // Справочники
  manufacturers: Repository<Manufacturer>;
  orgUnits: Repository<OrgUnit>;
  persons: Repository<Person>;
  unitsOfMeasure: Repository<UnitOfMeasure>;
  documents: Repository<AppDocument>;
}
