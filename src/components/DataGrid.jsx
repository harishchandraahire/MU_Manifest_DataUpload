import { memo, useMemo, useRef, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250]
const ROW_HEIGHT = 40
const DEFAULT_COL_WIDTH = 160
const COLUMN_GAP = 8 // px — must match .datagrid-row's column-gap (0.5rem) in App.css

function matchesSearch(record, columns, search) {
  if (!search) return true
  const needle = search.toLowerCase()
  return columns.some((col) => String(record.data[col.key] ?? '').toLowerCase().includes(needle))
}

function DataGrid({ columns, records, onRowClick }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 })
  const scrollRef = useRef(null)

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (statusFilter === 'valid' && !r.isValid) return false
      if (statusFilter === 'invalid' && r.isValid) return false
      return matchesSearch(r, columns, search)
    })
  }, [records, columns, search, statusFilter])

  const tableColumns = useMemo(() => {
    const base = [
      {
        id: 'rowNumber',
        header: '#',
        accessorFn: (r) => r.rowNumber,
        cell: (info) => info.getValue(),
        size: 56,
      },
      {
        id: 'status',
        header: 'Status',
        accessorFn: (r) => r.isValid,
        cell: (info) =>
          info.getValue() ? (
            <span className="pill pill-emerald">Valid</span>
          ) : (
            <span className="pill pill-red">{Object.keys(info.row.original.fieldErrors).length} error(s)</span>
          ),
        size: 100,
      },
    ]
    const schemaCols = columns.map((col) => ({
      id: col.key,
      header: col.label,
      accessorFn: (r) => r.data[col.key],
      size: DEFAULT_COL_WIDTH,
      cell: (info) => {
        const record = info.row.original
        const error = record.fieldErrors[col.key]
        return (
          <span
            title={error || undefined}
            className={error ? 'text-red-600 underline decoration-red-300 decoration-dotted' : undefined}
          >
            {String(info.getValue() ?? '')}
          </span>
        )
      },
    }))
    return [...base, ...schemaCols]
  }, [columns])

  const table = useReactTable({
    data: filteredRecords,
    columns: tableColumns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const pageRows = table.getRowModel().rows
  const leafColumns = table.getAllLeafColumns()

  // Shared, fixed-width column template applied identically to the header
  // and every body row so columns can never drift out of alignment between
  // rows (which is what happens with native <table> markup once rows are
  // absolutely positioned for virtualization).
  const gridTemplate = leafColumns.map((col) => `${col.columnDef.size || DEFAULT_COL_WIDTH}px`).join(' ')
  // Must include the row's column-gap: CSS Grid adds that between every pair of
  // tracks on top of their own widths, so leaving it out here under-measures the
  // real rendered width — the fixed-width body rows (below) then fall short of
  // their true content width and lose their last column(s)' background/border.
  const gridWidth =
    leafColumns.reduce((sum, col) => sum + (col.columnDef.size || DEFAULT_COL_WIDTH), 0) +
    Math.max(leafColumns.length - 1, 0) * COLUMN_GAP

  const rowVirtualizer = useVirtualizer({
    count: pageRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  })

  const pageCount = table.getPageCount()
  const pageIndex = table.getState().pagination.pageIndex

  return (
    <div className="datagrid">
      <div className="datagrid-toolbar">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            table.setPageIndex(0)
          }}
          placeholder="Search barcode, sender name…"
          className="datagrid-search"
          aria-label="Search records"
        />
        <div className="datagrid-filter-group" role="group" aria-label="Filter by status">
          {['all', 'valid', 'invalid'].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setStatusFilter(key)
                table.setPageIndex(0)
              }}
              className={`datagrid-filter-btn ${statusFilter === key ? 'datagrid-filter-btn-active' : ''}`}
            >
              {key === 'all' ? 'All' : key === 'valid' ? 'Valid' : 'Invalid'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <div ref={scrollRef} className="datagrid-scroll">
          <div style={{ minWidth: `${gridWidth}px` }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <div
                key={headerGroup.id}
                className="datagrid-row datagrid-header-row"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                {headerGroup.headers.map((header) => (
                  <div
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="datagrid-cell datagrid-header-cell"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted()] ?? ''}
                  </div>
                ))}
              </div>
            ))}

            <div style={{ position: 'relative', height: `${rowVirtualizer.getTotalSize()}px` }}>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = pageRows[virtualRow.index]
                const record = row.original
                return (
                  <div
                    key={row.id}
                    onClick={() => onRowClick?.(record)}
                    className={`datagrid-row datagrid-body-row ${record.isValid ? '' : 'datagrid-body-row-invalid'}`}
                    style={{
                      gridTemplateColumns: gridTemplate,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: `${gridWidth}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <div key={cell.id} className="datagrid-cell">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
          {pageRows.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-[var(--text-muted)]">No records match your search.</p>
          )}
        </div>

        <div className="datagrid-pagination">
          <div className="flex items-center gap-2">
            <label htmlFor="page-size" className="text-xs text-[var(--text-muted)]">
              Rows per page
            </label>
            <select
              id="page-size"
              value={pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="datagrid-page-size"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <button type="button" className="btn-secondary btn-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Previous
            </button>
            <span>
              Page{' '}
              <input
                type="number"
                min={1}
                max={Math.max(pageCount, 1)}
                value={pageIndex + 1}
                onChange={(e) => {
                  const page = Number(e.target.value) - 1
                  if (!Number.isNaN(page)) table.setPageIndex(Math.min(Math.max(page, 0), Math.max(pageCount - 1, 0)))
                }}
                className="datagrid-page-input"
              />{' '}
              of {Math.max(pageCount, 1)}
            </span>
            <button type="button" className="btn-secondary btn-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </button>
          </div>

          <span className="text-xs text-[var(--text-muted)]">{filteredRecords.length} record(s)</span>
        </div>
      </div>
    </div>
  )
}

export default memo(DataGrid)
