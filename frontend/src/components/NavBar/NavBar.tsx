import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
import styles from "./NavBar.module.scss";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

const NavBar = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { to: "/", label: t("booking") },
    { to: "/clothes", label: t("clothesList") },
    { to: "/calendar", label: t("calendar") },
    { to: "/admin", label: t("admin") },
    { to: "/cleaning", label: t("cleaning") },
    { to: "/today-rentals", label: t("todayRentals") },
    { to: "/return-rentals", label: t("returnRentals") },
    { to: "/booking-history", label: t("bookingHistory") },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const toggleMenu = () => {
    console.log("Toggling menu");
    setIsOpen((prev) => !prev);
  };

  return (
    <nav className={styles.navbar}>
      <div
        className={`${styles.burger} ${isOpen ? styles.active : ""}`}
        onClick={toggleMenu}
      >
        <FiMenu className={styles.iconMenu} size={26} />
        <FiX className={styles.iconClose} size={26} />
      </div>

      <div
        className={`${styles.linksContainer} ${isOpen ? styles.mobileOpen : ""}`}
      >
        {links.map((link) => {
          return (
            <>
              <Tooltip
                id={link.to}
                content={link.label}
                className={styles.tooltip}
              />

              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.active : ""}`
                }
              >
                {link.label}
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
