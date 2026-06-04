import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark, Plus, Search, Trash2, X } from 'lucide-react';
import {
  assetStatusSchema,
  criticalityLevelSchema,
  type AttributeDefinition,
  type Classification,
  type FunctionalLocation,
} from '@/model';
import { Button, Modal } from '@/shared/ui';
import { useSearchStore } from './searchStore';
import { hasActiveFilters, type AttributeOperator } from './lib';
import styles from './Search.module.css';

interface FilterPanelProps {
  classifications: Classification[];
  locations: FunctionalLocation[];
  attributeDefs: AttributeDefinition[];
  manufacturers: string[];
  owners: string[];
  planners: string[];
}

const OPERATORS: AttributeOperator[] = ['gte', 'lte', 'eq'];

export function FilterPanel({
  classifications,
  locations,
  attributeDefs,
  manufacturers,
  owners,
  planners,
}: FilterPanelProps) {
  const { t } = useTranslation();
  const filters = useSearchStore((s) => s.filters);
  const setFilters = useSearchStore((s) => s.setFilters);
  const setAttribute = useSearchStore((s) => s.setAttribute);
  const resetFilters = useSearchStore((s) => s.resetFilters);
  const savedViews = useSearchStore((s) => s.savedViews);
  const saveView = useSearchStore((s) => s.saveView);
  const loadView = useSearchStore((s) => s.loadView);
  const deleteView = useSearchStore((s) => s.deleteView);

  const [saveOpen, setSaveOpen] = useState(false);
  const [viewName, setViewName] = useState('');

  const classNameById = new Map(classifications.map((c) => [c.id, c.name]));
  const selectedAttr = attributeDefs.find(
    (d) => d.id === filters.attribute.attributeId,
  );
  const isNumericAttr = selectedAttr?.valueType === 'number';

  const handleSaveView = () => {
    const name = viewName.trim();
    if (!name) return;
    saveView(name);
    setViewName('');
    setSaveOpen(false);
  };

  return (
    <div className={styles.filterPanel}>
      <div className={styles.filterScroll}>
        <div className={styles.field}>
          <label className="label">{t('search.query')}</label>
          <div className={styles.searchInput}>
            <Search size={15} className={styles.searchIcon} />
            <input
              className="input"
              placeholder={t('search.queryPlaceholder')}
              value={filters.query}
              onChange={(e) => setFilters({ query: e.target.value })}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className="label">{t('search.class')}</label>
          <select
            className="input"
            value={filters.classificationId}
            onChange={(e) => setFilters({ classificationId: e.target.value })}
          >
            <option value="">{t('common.all')}</option>
            {classifications.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className="label">{t('search.location')}</label>
          <select
            className="input"
            value={filters.locationId}
            onChange={(e) => setFilters({ locationId: e.target.value })}
          >
            <option value="">{t('common.all')}</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className="label">{t('search.status')}</label>
            <select
              className="input"
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
            >
              <option value="">{t('common.all')}</option>
              {assetStatusSchema.options.map((s) => (
                <option key={s} value={s}>
                  {t(`assetStatus.${s}`)}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className="label">{t('search.criticality')}</label>
            <select
              className="input"
              value={filters.criticality}
              onChange={(e) => setFilters({ criticality: e.target.value })}
            >
              <option value="">{t('common.all')}</option>
              {criticalityLevelSchema.options.map((c) => (
                <option key={c} value={c}>
                  {t(`criticalityLevel.${c}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className="label">{t('search.manufacturer')}</label>
          <select
            className="input"
            value={filters.manufacturer}
            onChange={(e) => setFilters({ manufacturer: e.target.value })}
          >
            <option value="">{t('common.all')}</option>
            {manufacturers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className="label">{t('search.owner')}</label>
            <select
              className="input"
              value={filters.owner}
              onChange={(e) => setFilters({ owner: e.target.value })}
            >
              <option value="">{t('common.all')}</option>
              {owners.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className="label">{t('search.planner')}</label>
            <select
              className="input"
              value={filters.planner}
              onChange={(e) => setFilters({ planner: e.target.value })}
            >
              <option value="">{t('common.all')}</option>
              {planners.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.attributeBlock}>
          <label className="label">{t('search.attributeTitle')}</label>
          <select
            className="input"
            value={filters.attribute.attributeId}
            onChange={(e) =>
              setAttribute({ attributeId: e.target.value, value: '' })
            }
          >
            <option value="">{t('common.none')}</option>
            {attributeDefs.map((d) => (
              <option key={d.id} value={d.id}>
                {`${classNameById.get(d.classificationId) ?? ''} — ${d.name}`}
              </option>
            ))}
          </select>
          {filters.attribute.attributeId && (
            <div className={styles.fieldRow}>
              <select
                className="input"
                value={filters.attribute.operator}
                disabled={!isNumericAttr}
                onChange={(e) =>
                  setAttribute({ operator: e.target.value as AttributeOperator })
                }
              >
                {OPERATORS.map((op) => (
                  <option key={op} value={op}>
                    {t(`search.operators.${op}`)}
                  </option>
                ))}
              </select>
              <input
                className="input"
                type={isNumericAttr ? 'number' : 'text'}
                placeholder={t('search.value')}
                value={filters.attribute.value}
                onChange={(e) => setAttribute({ value: e.target.value })}
              />
            </div>
          )}
        </div>
      </div>

      <div className={styles.filterActions}>
        <Button
          variant="secondary"
          size="sm"
          disabled={!hasActiveFilters(filters)}
          onClick={resetFilters}
        >
          <X size={14} />
          {t('search.resetFilters')}
        </Button>
        <Button size="sm" onClick={() => setSaveOpen(true)}>
          <Bookmark size={14} />
          {t('search.saveView')}
        </Button>
      </div>

      <div className={styles.viewsBlock}>
        <div className={styles.viewsTitle}>{t('search.viewsTitle')}</div>
        {savedViews.length === 0 ? (
          <p className="text-muted text-sm">{t('search.noViews')}</p>
        ) : (
          <ul className={styles.viewsList}>
            {savedViews.map((view) => (
              <li key={view.id} className={styles.viewItem}>
                <button
                  type="button"
                  className={styles.viewLoad}
                  title={t('search.loadView')}
                  onClick={() => loadView(view.id)}
                >
                  <Bookmark size={13} />
                  <span>{view.name}</span>
                </button>
                <Button
                  size="sm"
                  variant="ghost"
                  title={t('search.deleteView')}
                  aria-label={t('search.deleteView')}
                  onClick={() => {
                    if (window.confirm(t('search.deleteViewConfirm')))
                      deleteView(view.id);
                  }}
                >
                  <Trash2 size={13} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={saveOpen}
        title={t('search.saveViewTitle')}
        onClose={() => setSaveOpen(false)}
        size="sm"
      >
        <div className={styles.field}>
          <label className="label label-required">{t('search.viewName')}</label>
          <input
            className="input"
            value={viewName}
            autoFocus
            onChange={(e) => setViewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveView();
            }}
          />
        </div>
        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={() => setSaveOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSaveView} disabled={!viewName.trim()}>
            <Plus size={14} />
            {t('common.save')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
