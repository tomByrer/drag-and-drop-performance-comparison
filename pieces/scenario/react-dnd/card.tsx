/* eslint-disable @repo/internal/react/consistent-css-prop-usage */
import { memo, useEffect, useRef, useState } from 'react';

import { css, jsx } from '@emotion/react';

import { token } from '@atlaskit/tokens';

import { Item } from '../../data/tasks';
import { fallbackColor } from '../../util/fallback';
import { useDrag, useDragDropManager, useDrop } from 'react-dnd';
import mergeRefs from './merge-refs';
import DropIndicator from './drop-indicator';
import { cardGap } from '../../util/constants';
import { Edge, getClosestEdge } from './get-closest-edge';

const cardStyles = css({
  display: 'flex',
  height: 'calc(var(--grid) * 7)',
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--grid)',
  flexDirection: 'row',
  background: token('elevation.surface.raised', fallbackColor),
  borderRadius: 'calc(var(--grid) / 2)',
  boxShadow: `0px 0px 1px rgba(9, 30, 66, 0.31), 0px 1px 1px rgba(9, 30, 66, 0.25)`,
  '--local-line-height': '2px',
  userSelect: 'none',
});

const idStyles = css({
  position: 'absolute',
  top: 'var(--grid)',
  right: 'var(--grid)',
  color: token('color.text.disabled', fallbackColor),
  fontSize: '10px',
});

function DragIcon({ state }: { state: DraggableState }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.70711 9.70711L6.41421 9L5 7.58579L4.29289 8.29289L5.70711 9.70711ZM2 12L1.29289 11.2929L0.585786 12L1.29289 12.7071L2 12ZM4.29289 15.7071L5 16.4142L6.41421 15L5.70711 14.2929L4.29289 15.7071ZM8.29289 4.29289L7.58579 5L9 6.41421L9.70711 5.70711L8.29289 4.29289ZM12 2L12.7071 1.29289L12 0.585786L11.2929 1.29289L12 2ZM14.2929 5.70711L15 6.41421L16.4142 5L15.7071 4.29289L14.2929 5.70711ZM15.7071 19.7071L16.4142 19L15 17.5858L14.2929 18.2929L15.7071 19.7071ZM12 22L11.2929 22.7071L12 23.4142L12.7071 22.7071L12 22ZM9.70711 18.2929L9 17.5858L7.58579 19L8.29289 19.7071L9.70711 18.2929ZM19.7071 8.29289L19 7.58579L17.5858 9L18.2929 9.70711L19.7071 8.29289ZM22 12L22.7071 12.7071L23.4142 12L22.7071 11.2929L22 12ZM18.2929 14.2929L17.5858 15L19 16.4142L19.7071 15.7071L18.2929 14.2929ZM4.29289 8.29289L1.29289 11.2929L2.70711 12.7071L5.70711 9.70711L4.29289 8.29289ZM1.29289 12.7071L4.29289 15.7071L5.70711 14.2929L2.70711 11.2929L1.29289 12.7071ZM9.70711 5.70711L12.7071 2.70711L11.2929 1.29289L8.29289 4.29289L9.70711 5.70711ZM11.2929 2.70711L14.2929 5.70711L15.7071 4.29289L12.7071 1.29289L11.2929 2.70711ZM14.2929 18.2929L11.2929 21.2929L12.7071 22.7071L15.7071 19.7071L14.2929 18.2929ZM12.7071 21.2929L9.70711 18.2929L8.29289 19.7071L11.2929 22.7071L12.7071 21.2929ZM18.2929 9.70711L21.2929 12.7071L22.7071 11.2929L19.7071 8.29289L18.2929 9.70711ZM21.2929 11.2929L18.2929 14.2929L19.7071 15.7071L22.7071 12.7071L21.2929 11.2929ZM2 13H22V11H2V13ZM11 2V22H13V2H11Z"
        fill={
          state === 'dragging'
            ? token('color.text.disabled', fallbackColor)
            : `${token('color.icon.brand', fallbackColor)}`
        }
      />
    </svg>
  );
}

type DraggableState = 'idle' | 'generate-preview' | 'dragging';
const cardText: { [State in DraggableState]: string } = {
  'generate-preview': 'Drag preview',
  idle: 'Draggable',
  dragging: 'Draggable source',
};

const cardTextStyles = css({
  margin: 0,
});
const cardTextDraggingStyles = css({
  color: token('color.text.disabled', fallbackColor),
});

function CardText({ state }: { state: DraggableState }) {
  return (
    <h4 css={[cardTextStyles, state === 'dragging' ? cardTextDraggingStyles : undefined]}>
      {cardText[state]}
    </h4>
  );
}

export const Card = memo(function Card({ item }: { item: Item }) {
  const itemId = item.itemId;
  const dropTargetRef = useRef<HTMLDivElement | null>(null);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: 'CARD',
    hover: (item, monitor) => {
      const edge = getClosestEdge({
        ref: dropTargetRef,
        allowedEdges: ['bottom', 'top'],
        client: monitor.getClientOffset(),
      });
      setClosestEdge(edge);
    },
    collect: (monitor) => {
      const isOver = monitor.isOver();
      return {
        isOver: isOver,
      };
    },
  }));

  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: 'CARD',
      item: { type: 'card', itemId: itemId },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [],
  );

  const state: DraggableState = isDragging ? 'dragging' : 'idle';

  return (
    <div
      css={cardStyles}
      ref={mergeRefs([dragRef, dropRef, dropTargetRef])}
      data-testid={`item-${item.itemId}`}
    >
      <span css={idStyles}>ID: {itemId}</span>
      <DragIcon state={state} />
      <CardText state={state} />
      <DropIndicator edge={isOver ? closestEdge : null} gap={cardGap} />
    </div>
  );
});
