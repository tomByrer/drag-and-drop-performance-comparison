import { css } from '@emotion/react';
import { useRef, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  DroppableProvided,
  resetServerContext,
} from 'react-beautiful-dnd';

import { ColumnMap, getInitialData } from '../../data/tasks';
import { columnGap, gridSize } from '../../util/constants';
import { Column } from './column';

const boardStyles = css({
  display: 'flex',
  padding: columnGap,
  justifyContent: 'center',
  flexDirection: 'row',

  // gap: columnGap,
  '> *': {
    marginLeft: columnGap / 2,
    marginRight: columnGap / 2,
  },
});

export default function Board() {
  const [data, setData] = useState<{
    columnMap: ColumnMap;
    orderedColumnIds: string[];
  }>(() => getInitialData());

  return (
    <DragDropContext onDragEnd={() => console.log('TODO: reorder')}>
      <Droppable droppableId="board" type="COLUMN" direction="horizontal">
        {(provided: DroppableProvided) => (
          <div css={boardStyles} ref={provided.innerRef} {...provided.droppableProps}>
            {data.orderedColumnIds.map((columnId, index) => {
              return <Column column={data.columnMap[columnId]} key={columnId} index={index} />;
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
