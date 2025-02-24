import { memo, useRef, useState } from 'react';

import { css } from '@emotion/react';

import { token } from '@atlaskit/tokens';

import { ColumnType } from '../../data/tasks';
import { cardGap, columnGap } from '../../util/constants';
import { fallbackColor } from '../../util/fallback';

import { useDrag, useDrop } from 'react-dnd';
import { Card } from './card';
import mergeRefs from './merge-refs';
import { Edge, getClosestEdge } from './get-closest-edge';
import DropIndicator from './drop-indicator';

const columnStyles = css({
  display: 'flex',
  width: '250px',
  flexDirection: 'column',
  background: token('elevation.surface.sunken', fallbackColor),
  borderRadius: 'calc(var(--grid) * 2)',
  // transition: `background ${mediumDurationMs}ms ${easeInOut}`,
  position: 'relative',
});

const scrollContainerStyles = css({
  height: '80vh',
  overflowY: 'auto',
});

const cardListStyles = css({
  display: 'flex',
  boxSizing: 'border-box',
  minHeight: '100%',
  padding: 'var(--grid)',
  gap: cardGap,
  flexDirection: 'column',
});

const columnHeaderStyles = css({
  display: 'flex',
  padding: 'calc(var(--grid) * 2) calc(var(--grid) * 2) calc(var(--grid) * 1)',
  justifyContent: 'space-between',
  flexDirection: 'row',
  color: token('color.text.subtlest', fallbackColor),
  // cursor: 'grab',
  userSelect: 'none',
});

const columnHeaderIdStyles = css({
  color: token('color.text.disabled', fallbackColor),
  fontSize: '10px',
});

const isDraggingOverColumnStyles = css({
  background: token('color.background.selected.hovered', fallbackColor),
});

export const Column = memo(function Column({ column }: { column: ColumnType }) {
  const dropTargetRef = useRef<HTMLDivElement | null>(null);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  const [{ isOver }, cardDropRef] = useDrop(() => ({
    accept: 'CARD',
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const [{ isColumnOver }, columnDropRef] = useDrop(() => ({
    accept: 'COLUMN',
    hover: (item, monitor) => {
      if (!monitor.canDrop()) {
        setClosestEdge(null);
        return;
      }
      const edge = getClosestEdge({
        ref: dropTargetRef,
        allowedEdges: ['left', 'right'],
        client: monitor.getClientOffset(),
      });
      setClosestEdge(edge);
    },
    canDrop(item, monitor) {
      if (typeof item === 'object' && item != null) {
        return (item as any).columnId !== column.columnId;
      }
      return true;
    },
    collect: (monitor) => ({
      isColumnOver: monitor.isOver(),
    }),
  }));

  const [{ isDragging }, dragHandleRef, draggableRef] = useDrag(() => ({
    type: 'COLUMN',
    item: { columnId: column.columnId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      css={[columnStyles, isOver && isDraggingOverColumnStyles]}
      ref={mergeRefs([draggableRef, columnDropRef, dropTargetRef])}
    >
      <div
        css={columnHeaderStyles}
        ref={dragHandleRef}
        data-testid={`column-${column.columnId}--header`}
      >
        <h6>{column.title}</h6>
        <span css={columnHeaderIdStyles}>ID: {column.columnId}</span>
      </div>
      <div css={scrollContainerStyles}>
        <div css={cardListStyles} ref={cardDropRef}>
          {column.items.map((item) => (
            <Card item={item} key={item.itemId} />
          ))}
        </div>
      </div>
      <DropIndicator edge={isColumnOver ? closestEdge : null} gap={columnGap} />
    </div>
  );
});
