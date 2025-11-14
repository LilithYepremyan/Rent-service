import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./NavBar.module.scss";

const NavBar = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const links = [
    { to: "/", label: t("booking") },
    { to: "/clothes", label: t("clothesList") },
    { to: "/calendar", label: t("calendar") },
    { to: "/admin", label: t("admin") },
    { to: "/cleaning", label: t("cleaning") },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.linksContainer}>
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={styles.link}
              style={{
                color: isActive ? "#2563eb" : undefined,
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = "#3b82f6";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = "#4b5563";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {link.label}
              <span
                className={styles.underline}
                style={{
                  width: isActive ? "100%" : "0",
                  opacity: isActive ? 1 : 0,
                }}
              ></span>
            </Link>
          );
        })}
      </div>

      <div className={styles.langContainer}>
        {["ru", "en", "am"].map((lng) => {
          const isActive = i18n.language === lng;
          return (
            <button
              key={lng}
              onClick={() => changeLanguage(lng)}
              className={styles.langButton}
              style={{
                background: isActive
                  ? "linear-gradient(to right, #3b82f6, #1d4ed8)"
                  : "rgba(255,255,255,0.3)",
                color: isActive ? "#fff" : "#4b5563",
                boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
                transform: isActive ? "scale(1.05)" : "scale(1)",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.background =
                    "linear-gradient(to right, #dbeafe, #bfdbfe)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = "rgba(255,255,255,0.3)";
              }}
            >
              {lng}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default NavBar;
