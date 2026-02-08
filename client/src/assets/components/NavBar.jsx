import React, { useState, useEffect } from "react";
import NavItem from "./NavItem";
const navItems = [
  {
    title: "Team",
    route: "/team",
  },
  {
    title: "Charts",
    route: "/charts",
  },
  {
    title: "Scoring",
    route: "/",
  },
  {
    title: "Admin",
    route: "/admin",
  }
];

function NavBar() {
  return (
    <div className="nav-container">
      {navItems.map((item, index) => (
        <NavItem key={index} title={item.title} route={item.route} />
      ))}
    </div>
  );
}

export default NavBar;
