import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
import styles from "./NavBar.module.scss";

const NavBar = () => {
  const { t, i18n } = useTranslation();

  const links = [
    { to: "/", label: t("booking") },
    { to: "/clothes", label: t("clothesList") },
    { to: "/calendar", label: t("calendar") },
    { to: "/admin", label: t("admin") },
    { to: "/cleaning", label: t("cleaning") },
    { to: "/todays-rentals", label: t("todaysRentals") },
    { to: "/return-rentals", label: t("returnRentals") },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.linksContainer}>
        {links.map((link) => {
          return (
            <>
              <Tooltip
                id={link.to}
                key={link.label}
                content={link.label}
                className={styles.tooltip}
              />
              <NavLink
                data-tooltip-id={link.to}
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.active : ""}`
                }
              >
                {link.label}
                <span className={styles.underline} />
              </NavLink>
            </>
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
              className={`${styles.langButton} ${
                isActive ? styles.langButtonActive : ""
              }`}
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
