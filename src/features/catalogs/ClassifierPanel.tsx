import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { AttributeDefinition, Classification, UnitOfMeasure } from '@/model';
import { Badge, Button, EmptyState } from '@/shared/ui';
import styles from './Catalogs.module.css';

interface ClassNode extends Classification {
  children: ClassNode[];
  depth: number;
}

/** Разворачивает классы в плоский список с глубиной (для отступов в дереве). */
function flattenTree(classes: Classification[]): ClassNode[] {
  const byParent = new Map<string | null, Classification[]>();
  for (const c of classes) {
    const list = byParent.get(c.parentId) ?? [];
    list.push(c);
    byParent.set(c.parentId, list);
  }
  const result: ClassNode[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const c of byParent.get(parentId) ?? []) {
      result.push({ ...c, children: [], depth });
      walk(c.id, depth + 1);
    }
  };
  walk(null, 0);
  return result;
}

interface ClassifierPanelProps {
  classifications: Classification[];
  attributeDefs: AttributeDefinition[];
  units: UnitOfMeasure[];
  selectedClassId: string | null;
  onSelectClass: (id: string) => void;
  onAddClass: () => void;
  onEditClass: (cls: Classification) => void;
  onDeleteClass: (cls: Classification) => void;
  onAddAttribute: () => void;
  onEditAttribute: (attr: AttributeDefinition) => void;
  onDeleteAttribute: (attr: AttributeDefinition) => void;
}

export function ClassifierPanel({
  classifications,
  attributeDefs,
  units,
  selectedClassId,
  onSelectClass,
  onAddClass,
  onEditClass,
  onDeleteClass,
  onAddAttribute,
  onEditAttribute,
  onDeleteAttribute,
}: ClassifierPanelProps) {
  const { t } = useTranslation();
  const nodes = useMemo(() => flattenTree(classifications), [classifications]);
  const selectedClass = classifications.find((c) => c.id === selectedClassId);
  const unitCodes = useMemo(
    () => new Map(units.map((u) => [u.id, u.code])),
    [units],
  );
  const classAttributes = useMemo(
    () => attributeDefs.filter((d) => d.classificationId === selectedClassId),
    [attributeDefs, selectedClassId],
  );

  const formatRange = (attr: AttributeDefinition) => {
    if (attr.min === undefined && attr.max === undefined) return '';
    return `${attr.min ?? '−∞'} … ${attr.max ?? '+∞'}`;
  };

  return (
    <div className={styles.classifierLayout}>
      <section className={styles.pane}>
        <header className={styles.paneHeader}>
          <span>{t('catalogs.classifier.treeTitle')}</span>
          <Button size="sm" onClick={onAddClass}>
            <Plus size={15} />
            {t('catalogs.classifier.addClass')}
          </Button>
        </header>
        <div className={styles.paneBody}>
          <ul className={styles.classTree}>
            {nodes.map((node) => (
              <li key={node.id}>
                <button
                  type="button"
                  className={[
                    styles.classItem,
                    node.id === selectedClassId && styles.classItemActive,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ paddingLeft: `${12 + node.depth * 18}px` }}
                  onClick={() => onSelectClass(node.id)}
                >
                  <span className={styles.classItemName}>{node.name}</span>
                  <span className={styles.classItemCode}>{node.code}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.pane}>
        {!selectedClass ? (
          <EmptyState
            title={t('catalogs.classifier.selectClass')}
            description={t('catalogs.classifier.selectClassHint')}
          />
        ) : (
          <>
            <header className={styles.paneHeader}>
              <span className="flex items-center gap-2">
                {selectedClass.name}
              </span>
              <span className={styles.paneActions}>
                <Button
                  size="sm"
                  variant="ghost"
                  title={t('common.edit')}
                  aria-label={t('common.edit')}
                  onClick={() => onEditClass(selectedClass)}
                >
                  <Pencil size={15} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  title={t('common.delete')}
                  aria-label={t('common.delete')}
                  onClick={() => onDeleteClass(selectedClass)}
                >
                  <Trash2 size={15} />
                </Button>
              </span>
            </header>
            <div className={styles.paneBody}>
              <div className={styles.attributesHeader}>
                <span>{t('catalogs.classifier.attributesTitle')}</span>
                <Button size="sm" variant="secondary" onClick={onAddAttribute}>
                  <Plus size={14} />
                  {t('catalogs.classifier.addAttribute')}
                </Button>
              </div>
              {classAttributes.length === 0 ? (
                <p className={styles.emptyHint}>
                  {t('catalogs.classifier.noAttributes')}
                </p>
              ) : (
                <ul className={styles.attributeList}>
                  {classAttributes.map((attr) => (
                    <li key={attr.id} className={styles.attributeItem}>
                      <div className={styles.attributeMain}>
                        <span className={styles.attributeName}>
                          {attr.name}
                        </span>
                        <span className={styles.attributeCode}>
                          {attr.code}
                        </span>
                      </div>
                      <Badge tone="default">
                        {t(`attributeType.${attr.valueType}`)}
                      </Badge>
                      {attr.unitId && (
                        <span className={styles.attributeMeta}>
                          {unitCodes.get(attr.unitId)}
                        </span>
                      )}
                      {formatRange(attr) && (
                        <span className={styles.attributeMeta}>
                          {formatRange(attr)}
                        </span>
                      )}
                      <span className={styles.attributeActions}>
                        <Button
                          size="sm"
                          variant="ghost"
                          title={t('common.edit')}
                          aria-label={t('common.edit')}
                          onClick={() => onEditAttribute(attr)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          title={t('common.delete')}
                          aria-label={t('common.delete')}
                          onClick={() => onDeleteAttribute(attr)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
