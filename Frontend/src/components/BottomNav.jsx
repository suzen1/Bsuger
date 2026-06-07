import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const BottomNav = () => {
    const navigate = useNavigate()
    const location = useLocation()
    
    const items = [
        {
            icon: (color) => (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            ),
            label: "Home",
            path: "/dashboard"
        },
        {
            icon: (color) => (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="12" y2="12" />
                </svg>
            ),
            label: "Add Meal",
            path: "/meals"
        },
        {
            icon: (color) => (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
            ),
            label: "Reports",
            path: "/reports"
        },
        {
            icon: (color) => (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            ),
            label: "Profile",
            path: "/profile"
        }
    ]

    return (
        <div>
            {/* Added spacer to prevent contents being cut off by fixed navigation */}
            <div style={{ height: '80px' }} />
            <nav style={{
                position: "fixed", 
                bottom: 0, 
                left: 0, 
                right: 0,
                background: "rgba(10, 15, 13, 0.95)", 
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderTop: "1px solid #1a2e23",
                display: "flex", 
                justifyContent: "space-around", 
                alignItems: "center",
                height: 70, 
                zIndex: 100,
                boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.5)"
            }}>
                {items.map(item => {
                    const isActive = location.pathname === item.path
                    const color = isActive ? "#10b981" : "#6b7280"
                    
                    return (
                        <button 
                            key={item.label} 
                            onClick={() => navigate(item.path)} 
                            style={{
                                display: "flex", 
                                flexDirection: "column", 
                                alignItems: "center",
                                gap: 4, 
                                background: "none", 
                                border: "none", 
                                cursor: "pointer",
                                padding: "8px 16px", 
                                borderRadius: 16,
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                outline: "none"
                            }}
                        >
                            <div style={{ 
                                transition: "transform 0.2s ease",
                                transform: isActive ? "scale(1.1) translateY(-2px)" : "scale(1)",
                                filter: isActive ? "drop-shadow(0 0 8px rgba(16,185,129,0.6))" : "none"
                            }}>
                                {item.icon(color)}
                            </div>
                            <span style={{
                                fontSize: 10, 
                                fontWeight: isActive ? 700 : 500,
                                color: color,
                                fontFamily: "'Plus Jakarta Sans', sans-serif", 
                                letterSpacing: 0.5,
                                transition: "color 0.3s ease",
                                textShadow: isActive ? "0 0 8px rgba(16,185,129,0.3)" : "none"
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

export default BottomNav;