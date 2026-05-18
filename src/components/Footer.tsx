import {FaGithub, FaInfoCircle, FaLinkedin} from "react-icons/fa"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footerAttribution">
        <span className="footerAttributionLabel">Developed by</span>
        <a
          className="footerAttributionLink"
          href="https://www.linkedin.com/in/pavel-makhnev/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Pavel Makhnev on LinkedIn"
          title="Pavel Makhnev on LinkedIn"
        >
          <FaLinkedin className="footerAttributionIcon" />
          <span>Pavel Makhnev</span>
        </a>
      </div>
      <div className="footerLinks" aria-label="Project links">
        <a
          className="footerIconButton"
          href="https://github.com/serious-pavel/no-pressure"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository"
          title="GitHub repository"
        >
          <FaGithub />
        </a>
        <details className="footerDetails">
          <summary className="footerIconButton" aria-label="License information" title="License information">
            <FaInfoCircle />
          </summary>
          <div className="footerLicensePanel" role="note">
            <div>
              Font Awesome 5 icons are used through <a href="https://react-icons.github.io/react-icons/icons/fa/" target="_blank" rel="noopener noreferrer">react-icons</a>
              {" "}under the CC BY 4.0 license.
            </div>
            <div>
              The site icon comes from SVG Repo and is licensed under CC0.
            </div>
          </div>
        </details>
      </div>
    </footer>
  )
}

export default Footer
