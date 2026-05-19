import {FaHeartPulse} from "react-icons/fa6"
import type {AppUser} from "../types.ts"
import {FaGoogle, FaBars} from "react-icons/fa"
import DropdownMenu from "./DropdownMenu.tsx";
import DropdownMenuItem from "./DropdownMenuItem.tsx";

interface HeaderProps {
  user: AppUser | null
  isLoading: boolean
  onSignIn: () => void
  onSignOut: () => void
}

const Header = ({user, isLoading, onSignIn, onSignOut}: HeaderProps) => {
  return (
    <header>
      <div className="headerLogo">
        <FaHeartPulse className="headerLogoIcon"/>
        <span>NO PRESSURE</span>
      </div>
      <div className="headerAuth">
        {isLoading && <span className="headerStatus">loading session</span>}
        {!isLoading && !user && (
          <button type="button" className="headerAction" onClick={onSignIn}>
            <FaGoogle/>
            <span>Google sign-in</span>
          </button>
        )}
        {user && (
          <>
            <span className="headerUser">{user.name}</span>
            <DropdownMenu classExtension="extMainMenu" Icon={FaBars}>
              <DropdownMenuItem onClick={onSignOut}>Sign out</DropdownMenuItem>
            </DropdownMenu>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
