import { useState } from 'react';
import { Tree, type NodeRendererProps } from 'react-arborist';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { LocationNode } from './lib';
import { useResizeObserver } from './useResizeObserver';
import styles from './AssetRegistry.module.css';

interface LocationTreeProps {
  data: LocationNode[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function TreeNode({ node, style, dragHandle }: NodeRendererProps<LocationNode>) {
  const isFolder = node.isInternal;
  const classes = [styles.treeNode, node.isSelected && styles.treeNodeSelected]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={dragHandle} style={style} className={classes} onClick={() => node.select()}>
      <span
        className={styles.treeToggle}
        onClick={(e) => {
          e.stopPropagation();
          node.toggle();
        }}
      >
        {isFolder &&
          (node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
      </span>
      <span className={styles.treeName}>{node.data.name}</span>
      <span className={styles.treeCode}>{node.data.code}</span>
    </div>
  );
}

export function LocationTree({ data, selectedId, onSelect }: LocationTreeProps) {
  const { t } = useTranslation();
  const [term, setTerm] = useState('');
  const { ref, width, height } = useResizeObserver<HTMLDivElement>();

  return (
    <>
      <div className={styles.treeSearch}>
        <input
          type="search"
          className="input"
          placeholder={t('registry.treeSearchPlaceholder')}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </div>
      <div ref={ref} className={styles.paneBody}>
        <Tree<LocationNode>
          data={data}
          idAccessor="id"
          childrenAccessor="children"
          openByDefault
          width={width || 280}
          height={height || 480}
          indent={16}
          rowHeight={32}
          searchTerm={term}
          searchMatch={(node, search) =>
            node.data.name.toLowerCase().includes(search.toLowerCase()) ||
            node.data.code.toLowerCase().includes(search.toLowerCase())
          }
          selection={selectedId ?? undefined}
          onSelect={(nodes) => onSelect(nodes[0]?.id ?? null)}
        >
          {TreeNode}
        </Tree>
      </div>
    </>
  );
}
