import LoadingState from './LoadingState.jsx'
import ErrorState from './ErrorState.jsx'
import EmptyState from './EmptyState.jsx'

/**
 * AsyncBoundary — renders the right state for an async query.
 * Props: { loading, error, data, onRetry, emptyLabel, children }
 * children is a render function receiving `data` when loaded & non-empty.
 */
export default function AsyncBoundary({
  loading,
  error,
  data,
  onRetry,
  emptyLabel,
  emptyHint,
  isEmpty,
  children,
}) {
  if (loading) return <LoadingState />
  if (error) return <ErrorState error={error} onRetry={onRetry} />
  const empty = isEmpty ? isEmpty(data) : !data || (Array.isArray(data) && data.length === 0)
  if (empty) return <EmptyState label={emptyLabel} hint={emptyHint} />
  return typeof children === 'function' ? children(data) : children
}
