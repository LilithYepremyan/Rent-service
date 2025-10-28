import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

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

  const navbarStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    // width: "100%",
    // maxWidth: "1200px",
    // margin: "1.5rem auto",
    padding: "1rem 2rem",
    // borderRadius: "24px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(15px)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    border: "1px solid rgba(255,255,255,0.25)",
    transition: "all 0.3s ease",
  };

  const linksContainerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "2rem",
  };

  const linkStyle: React.CSSProperties = {
    position: "relative",
    fontWeight: 600,
    color: "#4b5563",
    letterSpacing: "0.05em",
    textDecoration: "none",
    transition: "all 0.3s ease",
  };

  const underlineStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    bottom: "-4px",
    height: "2px",
    borderRadius: "9999px",
    background: "linear-gradient(to right, #60a5fa, #2563eb)",
    transition: "all 0.3s ease-in-out",
  };

  const langContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.75rem",
  };

  const langButtonBase: React.CSSProperties = {
    padding: "0.4rem 1rem",
    borderRadius: "12px",
    fontSize: "0.875rem",
    fontWeight: 600,
    textTransform: "uppercase",
    transition: "all 0.3s ease",
    cursor: "pointer",
    border: "none",
    backdropFilter: "blur(5px)",
  };

  return (
    <nav style={navbarStyle}>
      <div style={linksContainerStyle}>
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                ...linkStyle,
                color: isActive ? "#2563eb" : linkStyle.color,
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
                style={{
                  ...underlineStyle,
                  width: isActive ? "100%" : "0",
                  opacity: isActive ? 1 : 0,
                }}
              ></span>
            </Link>
          );
        })}
      </div>

      <div style={langContainerStyle}>
        {["ru", "en", "am"].map((lng) => {
          const isActive = i18n.language === lng;
          return (
            <button
              key={lng}
              onClick={() => changeLanguage(lng)}
              style={{
                ...langButtonBase,
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
