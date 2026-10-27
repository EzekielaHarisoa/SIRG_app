import { Outlet } from 'react-router-dom'
import RoleLayout from '../../layouts/RoleLayout.jsx'

/**
 * AppLayout — compatibility wrapper that delegates to RoleLayout.
 * Kept to satisfy the architecture contract; RoleLayout is the real shell.
 */
export default function AppLayout(props) {
  return (
    <RoleLayout {...props}>
      <Outlet />
    </RoleLayout>
  )
}
