import styled from '@emotion/styled'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { AppTheme } from '../theme'
import type { Transaction } from '../types'
import { formatKRW } from '../lib/money'
import { useLedger } from '../context/LedgerContext'

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Empty = styled.p`
  margin: 24px 0;
  text-align: center;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
  font-size: 14px;
`

const Item = styled.li<{ dragging?: boolean }>`
  display: flex;
  align-items: stretch;
  gap: 10px;
  padding: 12px 12px 12px 10px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.md}px;
  background: ${(p) => (p.theme as AppTheme).colors.surface};
  border: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  box-shadow: ${(p) => (p.dragging ? (p.theme as AppTheme).shadow : 'none')};
  opacity: ${(p) => (p.dragging ? 0.92 : 1)};
  transform: ${(p) => (p.dragging ? 'scale(1.01)' : 'none')};
`

const Handle = styled.button`
  flex: 0 0 28px;
  align-self: center;
  display: grid;
  place-items: center;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
  font-size: 18px;
  padding: 0;
  border-radius: ${(p) => (p.theme as AppTheme).radius.sm}px;
  &:active {
    background: ${(p) => (p.theme as AppTheme).colors.elevated};
  }
`

const Body = styled.div`
  flex: 1;
  min-width: 0;
`

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
`

const Cat = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${(p) => (p.theme as AppTheme).colors.accent};
  background: ${(p) => (p.theme as AppTheme).colors.accentSoft};
  padding: 2px 8px;
  border-radius: 999px;
`

const Amount = styled.span`
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.03em;
`

const Memo = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${(p) => (p.theme as AppTheme).colors.muted};
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
`

const MiniBtn = styled.button`
  font-size: 12px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: ${(p) => (p.theme as AppTheme).radius.sm}px;
  border: 1px solid ${(p) => (p.theme as AppTheme).colors.border};
  background: ${(p) => (p.theme as AppTheme).colors.elevated};
  color: ${(p) => (p.theme as AppTheme).colors.text};
`

function RowBody({ tx }: { tx: Transaction }) {
  return (
    <Body>
      <Top>
        <Cat>{tx.category}</Cat>
        <Amount>{formatKRW(tx.amount)}</Amount>
      </Top>
      {tx.memo ? <Memo>{tx.memo}</Memo> : <Memo style={{ opacity: 0.5 }}>메모 없음</Memo>}
    </Body>
  )
}

function StaticRow({
  tx,
  onEdit,
  onDelete,
}: {
  tx: Transaction
  onEdit: (t: Transaction) => void
  onDelete: (id: string) => Promise<void>
}) {
  return (
    <Item>
      <RowBody tx={tx} />
      <Actions>
        <MiniBtn type="button" onClick={() => onEdit(tx)}>
          수정
        </MiniBtn>
        <MiniBtn
          type="button"
          onClick={() => {
            void onDelete(tx.id).catch((e: unknown) =>
              window.alert(e instanceof Error ? e.message : '삭제에 실패했습니다.'),
            )
          }}
        >
          삭제
        </MiniBtn>
      </Actions>
    </Item>
  )
}

function SortableRow({
  tx,
  onEdit,
  onDelete,
}: {
  tx: Transaction
  onEdit: (t: Transaction) => void
  onDelete: (id: string) => Promise<void>
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tx.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Item ref={setNodeRef} style={style} dragging={isDragging}>
      <Handle type="button" aria-label="순서 변경" {...listeners} {...attributes}>
        ⣿
      </Handle>
      <RowBody tx={tx} />
      <Actions>
        <MiniBtn type="button" onClick={() => onEdit(tx)}>
          수정
        </MiniBtn>
        <MiniBtn
          type="button"
          onClick={() => {
            void onDelete(tx.id).catch((e: unknown) =>
              window.alert(e instanceof Error ? e.message : '삭제에 실패했습니다.'),
            )
          }}
        >
          삭제
        </MiniBtn>
      </Actions>
    </Item>
  )
}

interface Props {
  date: string
  items: Transaction[]
  onEdit: (t: Transaction) => void
  /** 전체 보기 등: 드래그 정렬 비활성 */
  readOnly?: boolean
}

export function SortableDayList({ date, items, onEdit, readOnly }: Props) {
  const { reorderDay, deleteTransaction } = useLedger()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    void reorderDay(date, String(active.id), String(over.id)).catch((err: unknown) =>
      window.alert(err instanceof Error ? err.message : '순서 저장에 실패했습니다.'),
    )
  }

  if (items.length === 0) {
    return <Empty>이 날짜에는 내역이 없습니다.</Empty>
  }

  if (readOnly) {
    return (
      <List>
        {items.map((tx) => (
          <StaticRow key={tx.id} tx={tx} onEdit={onEdit} onDelete={deleteTransaction} />
        ))}
      </List>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <List>
          {items.map((tx) => (
            <SortableRow key={tx.id} tx={tx} onEdit={onEdit} onDelete={deleteTransaction} />
          ))}
        </List>
      </SortableContext>
    </DndContext>
  )
}
