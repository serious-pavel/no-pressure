import type {AppUser} from "../types.ts"
import {FaGoogle, FaSignOutAlt} from "react-icons/fa"

interface HeaderProps {
  user: AppUser | null
  isLoading: boolean
  onSignIn: () => void
  onSignOut: () => void
}

const Header = ({user, isLoading, onSignIn, onSignOut}: HeaderProps) => {
  return (
    <header>
      <img src="/pulse-line-svgrepo-com.svg" alt="pulse"/>
      <div>O PRESSURE</div>
      <div className="headerAuth">
        {isLoading && <span className="headerStatus">loading session</span>}
        {!isLoading && !user && (
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
