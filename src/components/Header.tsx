import type {AppUser} from "../types.ts"
import {FaGoogle, FaSignOutAlt} from "react-icons/fa"

interface HeaderProps {
  user: AppUser | null
  isLoading: boolean
  hasApiBaseUrl: boolean
  onSignIn: () => void
  onSignOut: () => void
}

const Header = ({user, isLoading, hasApiBaseUrl, onSignIn, onSignOut}: HeaderProps) => {
  return (
    <header>
      <img src="/pulse-line-svgrepo-com.svg" alt="pulse"/>
      <div>O PRESSURE</div>
      <div className="headerAuth">
        {!hasApiBaseUrl && <span className="headerStatus">local mode</span>}
        {hasApiBaseUrl && isLoading && <span className="headerStatus">loading session</span>}
        {hasApiBaseUrl && !isLoading && !user && (
          <button type="button" className="headerAction" onClick={onSignIn}>
            <FaGoogle />
            <span>Google sign-in</span>
          </button>
        )}
        {user && (
          <>
            <span className="headerUser">{user.name}</span>
            <button type="button" className="headerAction" onClick={onSignOut}>
              <FaSignOutAlt />
              <span>Sign out</span>
            </button>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
