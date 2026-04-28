import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
import styles from "./NavBar.module.scss";
import { useState } from "react";
import { FiMenu, FiX, FiGlobe, FiChevronDown } from "react-icons/fi";

const NavBar = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const links = [
    { to: "/", label: t("booking") },
    { to: "/clothes", label: t("clothesList") },
    { to: "/calendar", label: t("calendar") },
    { to: "/admin", label: t("admin") },
    { to: "/cleaning", label: t("cleaning") },
    { to: "/today-rentals", label: t("todayRentals") },
    { to: "/return-rentals", label: t("returnRentals") },
    { to: "/booking-history", label: t("bookingHistory") },
    { to: "/archived-clothes", label: t("archivedClothes") },
  ];

  const languages = ["ru", "en", "am"];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLangOpen(false);
    setIsOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <button
        type="button"
        className={`${styles.burger} ${isOpen ? styles.active : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <FiMenu className={styles.iconMenu} size={26} />
        <FiX className={styles.iconClose} size={26} />
      </button>

      <div
        className={`${styles.menuSection} ${isOpen ? styles.mobileOpen : ""}`}
      >
        <div className={styles.linksContainer}>
          {links.map((link) => (
            <div key={link.to} id={link.to}>
              {!isOpen && (
                <Tooltip
                  id={link.to}
                  content={link.label}
                  className={styles.tooltip}
                />
              )}
              <NavLink
                to={link.to}
                onClick={() => setIsOpen(false)}
                data-tooltip-id={link.to}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.active : ""}`
                }
              >
                {link.label}
              </NavLink>
            </div>
          ))}
        </div>

        <div className={styles.langWrapper}>
          <button
            type="button"
            className={styles.langToggle}
            onClick={() => setIsLangOpen((prev) => !prev)}
          >
            <FiGlobe size={18} />
            <span className={styles.currentLang}>{i18n.language}</span>
            <FiChevronDown
              size={16}
              className={`${styles.chevron} ${
                isLangOpen ? styles.chevronOpen : ""
              }`}
            />
          </button>

          {isLangOpen && (
            <div className={styles.langDropdown}>
              {languages.map((lng) => {
                const isActive = i18n.language === lng;

                return (
                  <button
                    key={lng}
                    type="button"
                    onClick={() => changeLanguage(lng)}
                    className={`${styles.langOption} ${
                      isActive ? styles.langOptionActive : ""
                    }`}
                  >
                    {lng.toUpperCase()}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
