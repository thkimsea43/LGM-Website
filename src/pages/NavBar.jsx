import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const isHomePage = (location.pathname === "/")

  const closeMenu = () => {
    setMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (key) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <header className={`site-header ${isHomePage ? "transparent-header" : ""}`}>
      <div className="logo">
        <Link to="/" onClick={closeMenu}>
          <img src={`/${isHomePage ? "lgm_logo_white.png" : "lgm_logo.png"}`} alt="Church Logo" />
        </Link>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      <nav className={`navbar ${menuOpen ? "open" : ""}`}>
        <ul className="nav-list">
          {/* About Dropdown */}
          <li
            className={`nav-item dropdown ${
              openDropdown === "about" ? "open" : ""
            }`}
          >
            <span className="nav-link" onClick={() => toggleDropdown("about")}>
              About
            </span>
            <ul className="dropdown-menu">
              <li>
                <Link
                  to="/about/our_story"
                  className="dropdown-item"
                  onClick={closeMenu}
                >
                  Our Story
                </Link>
              </li>
              <li>
                <Link
                  to="/about/sunday_service"
                  className="dropdown-item"
                  onClick={closeMenu}
                >
                  Sunday Service
                </Link>
              </li>
              <li>
                <Link
                  to="/about/mission"
                  className="dropdown-item"
                  onClick={closeMenu}
                >
                  Mission & Vision
                </Link>
              </li>
              <li>
                <Link
                  to="/about/team"
                  className="dropdown-item"
                  onClick={closeMenu}
                >
                  Our Team
                </Link>
              </li>
            </ul>
          </li>

          {/* Ministries Dropdown */}
          <li
            className={`nav-item dropdown ${
              openDropdown === "ministries" ? "open" : ""
            }`}
          >
            <span
              className="nav-link"
              onClick={() => toggleDropdown("ministries")}
            >
              Ministries
            </span>
            <ul className="dropdown-menu">
              <li>
                <Link
                  to="/ministries/childrens"
                  className="dropdown-item"
                  onClick={closeMenu}
                >
                  Children's
                </Link>
              </li>
              <li>
                <Link
                  to="/ministries/youth_group"
                  className="dropdown-item"
                  onClick={closeMenu}
                >
                  Youth Group
                </Link>
              </li>
              <li>
                <Link
                  to="/ministries/campus"
                  className="dropdown-item"
                  onClick={closeMenu}
                >
                  Campus
                </Link>
              </li>
              <li>
                <Link
                  to="/ministries/post_grad"
                  className="dropdown-item"
                  onClick={closeMenu}
                >
                  Post-Grad
                </Link>
              </li>
              <li>
                <Link
                  to="/ministries/adult_family"
                  className="dropdown-item"
                  onClick={closeMenu}
                >
                  Adult / Family
                </Link>
              </li>
            </ul>
          </li>

          {/* Static Links */}
          <li className="nav-item">
            <Link to="/sermons" className="nav-link" onClick={closeMenu}>
              Sermons
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/bulletin" className="nav-link" onClick={closeMenu}>
              Bulletin
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/donate" className="nav-link donate" onClick={closeMenu}>
              Donate
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default NavBar;
