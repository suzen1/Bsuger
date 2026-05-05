import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const ButtomNave = () => {
    const navigate = useNavigate()
    const location = useLocation()
    return (
        <div>
            <nav style={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                background: "#fff", borderTop: "1px solid #e8faf4",
                display: "flex", justifyContent: "space-around", alignItems: "center",
                height: 64, zIndex: 100,
                boxShadow: "0 -4px 20px rgba(16,185,129,0.08)"
            }}>
                {[
                    { icon: "🏠", label: "Home", path: "/dashbord" },
                    { icon: "➕", label: "Add Meal", path: "/mealogger" },
                    { icon: "📋", label: "Reports", path: "/reports" },
                    { icon: "👤", label: "Profile", path: "/profile" },
                ].map(item => {
                    const isActive = location.pathname === item.path
                    return (
                        <button key={item.label} onClick={() => navigate(item.path)} style={{
                            display: "flex", flexDirection: "column", alignItems: "center",
                            gap: 2, background: "none", border: "none", cursor: "pointer",
                            padding: "6px 12px", borderRadius: 12,
                            opacity: isActive ? 1 : 0.5
                        }}>
                            <span style={{ fontSize: 20 }}>{item.icon}</span>
                            <span style={{
                                fontSize: 9, fontWeight: isActive ? 700 : 500,
                                color: isActive ? "#10b981" : "#6b7280",
                                fontFamily: "inherit", letterSpacing: 0.5
                            }}>
                                {item.label}
                            </span>
                        </button>
                    )
                })}
            </nav>
        </div>
    )
}

export default ButtomNave