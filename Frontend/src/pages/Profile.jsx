import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { profileAPI, authAPI } from '../services/api';

const Profile = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        age: '',
        phone: '',
        bloodType: '',
        targetFasting: 100,
        targetPostMeal: 140,
        medications: '',
        doctorName: '',
        doctorPhone: ''
    });

    const [editData, setEditData] = useState(profile);

    // Interactive UI states
    const [focusedField, setFocusedField] = useState(null);
    const [btnHover, setBtnHover] = useState(null);

    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await profileAPI.getProfile();
                setProfile(data);
                setEditData(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching profile:', err);
                if (err.message.includes("401") || err.message.includes("Unauthorized")) {
                    localStorage.clear();
                    navigate("/");
                } else {
                    setError('Failed to load profile. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleEdit = () => {
        setIsEditing(true);
        setEditData(profile);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: (name === 'age' || name === 'targetFasting' || name === 'targetPostMeal') 
                ? (value === '' ? '' : Number(value)) 
                : value
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await profileAPI.updateProfile(editData);
            setProfile(editData);
            setIsEditing(false);
            setError(null);
            alert('Profile updated successfully!');
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authAPI.logout();
        navigate("/");
    };

    const getInputStyle = (name) => ({
        width: "100%",
        background: "#0d1611",
        border: focusedField === name ? "1.5px solid #10b981" : "1.5px solid #1a2e23",
        borderRadius: 12,
        padding: "11px 14px",
        fontSize: 14,
        fontFamily: "inherit",
        outline: "none",
        boxSizing: "border-box",
        color: "#e8fdf4",
        boxShadow: focusedField === name ? "0 0 12px rgba(16,185,129,0.2)" : "none",
        transition: "all 0.2s"
    });

    if (loading && !isEditing) {
        return (
            <div style={{
                background: '#0a0f0d',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 54, margin: 0, animation: "float 2s infinite ease-in-out" }}>👤</p>
                    <p style={{ color: '#10b981', fontWeight: 600, fontSize: 14, marginTop: 16, letterSpacing: 0.5 }}>
                        LOADING PROFILE...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            background: '#0a0f0d',
            color: '#e8fdf4',
            minHeight: '100vh',
            paddingBottom: 90,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            animation: "fadeIn 0.5s ease-out"
        }}>
            {/* Header with Green Tint Hero Gradient */}
            <div style={{
                background: 'linear-gradient(135deg, #0a0f0d 0%, #0d1f15 100%)',
                borderBottom: '1px solid #1a2e23',
                padding: '24px 20px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
                <h1 style={{
                    margin: '8px 0',
                    fontSize: 32,
                    fontFamily: "'DM Serif Display', serif",
                    fontWeight: 400,
                    color: '#e8fdf4',
                    textShadow: "0 0 10px rgba(232,253,244,0.15)"
                }}>
                    My Profile
                </h1>
                <p style={{ margin: 0, color: '#6b7280', fontSize: 13, fontWeight: 500 }}>
                    Manage your health information
                </p>
            </div>

            {/* Error Notification */}
            {error && (
                <div style={{
                    background: '#1a0000',
                    color: '#f87171',
                    padding: '12px 16px',
                    margin: '16px',
                    borderRadius: 14,
                    border: '1px solid #ef4444',
                    fontSize: 13,
                    boxShadow: "0 4px 20px rgba(239,68,68,0.15)"
                }}>
                    ❌ {error}
                </div>
            )}

            <div style={{ padding: '24px 16px', maxWidth: 600, margin: '0 auto' }}>
                {/* Profile Avatar Card with Neon Glow */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{
                        width: 84,
                        height: 84,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 40,
                        margin: '0 auto',
                        color: '#fff',
                        boxShadow: '0 0 24px rgba(16,185,129,0.45)',
                        filter: "drop-shadow(0 0 8px rgba(16,185,129,0.3))"
                    }}>
                        👤
                    </div>
                    <h2 style={{
                        margin: '16px 0 6px',
                        fontFamily: "'DM Serif Display', serif",
                        color: '#e8fdf4',
                        fontSize: 24,
                        fontWeight: 400
                    }}>
                        {profile.name || 'User'}
                    </h2>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: 13, fontWeight: 500 }}>
                        {profile.email}
                    </p>
                </div>

                {!isEditing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Personal Information Card */}
                        <div style={{
                            background: '#111814',
                            borderRadius: 20,
                            padding: 20,
                            border: '1px solid #1a2e23',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }}>
                            <h3 style={{
                                margin: '0 0 16px',
                                color: '#10b981',
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: 1.5
                            }}>
                                PERSONAL INFORMATION
                            </h3>
                            <div style={{ display: 'grid', gap: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a2e23', paddingBottom: 10, fontSize: 13 }}>
                                    <span style={{ color: '#6b7280' }}>Age:</span>
                                    <span style={{ fontWeight: 600, color: '#e8fdf4' }}>{profile.age ? `${profile.age} years` : 'Not set'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a2e23', paddingBottom: 10, fontSize: 13 }}>
                                    <span style={{ color: '#6b7280' }}>Phone:</span>
                                    <span style={{ fontWeight: 600, color: '#e8fdf4' }}>{profile.phone || 'Not set'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#6b7280' }}>Blood Type:</span>
                                    <span style={{ fontWeight: 600, color: '#e8fdf4' }}>{profile.bloodType || 'Not set'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Health Targets Card */}
                        <div style={{
                            background: '#111814',
                            borderRadius: 20,
                            padding: 20,
                            border: '1px solid #1a2e23',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }}>
                            <h3 style={{
                                margin: '0 0 16px',
                                color: '#10b981',
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: 1.5
                            }}>
                                TARGET SUGAR VALUES
                            </h3>
                            <div style={{ display: 'grid', gap: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a2e23', paddingBottom: 10, fontSize: 13 }}>
                                    <span style={{ color: '#6b7280' }}>Fasting Target:</span>
                                    <span style={{ fontWeight: 600, color: '#34d399' }}>{profile.targetFasting} mg/dL</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#6b7280' }}>Post-Meal Target:</span>
                                    <span style={{ fontWeight: 600, color: '#34d399' }}>{profile.targetPostMeal} mg/dL</span>
                                </div>
                            </div>
                        </div>

                        {/* Medical Information Card */}
                        <div style={{
                            background: '#111814',
                            borderRadius: 20,
                            padding: 20,
                            border: '1px solid #1a2e23',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }}>
                            <h3 style={{
                                margin: '0 0 16px',
                                color: '#10b981',
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: 1.5
                            }}>
                                MEDICAL INFORMATION
                            </h3>
                            <div style={{ display: 'grid', gap: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a2e23', paddingBottom: 10, fontSize: 13 }}>
                                    <span style={{ color: '#6b7280' }}>Medications:</span>
                                    <span style={{ fontWeight: 600, color: '#e8fdf4' }}>{profile.medications || 'None'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a2e23', paddingBottom: 10, fontSize: 13 }}>
                                    <span style={{ color: '#6b7280' }}>Doctor Name:</span>
                                    <span style={{ fontWeight: 600, color: '#e8fdf4' }}>{profile.doctorName || 'Not set'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#6b7280' }}>Doctor Phone:</span>
                                    <span style={{ fontWeight: 600, color: '#e8fdf4' }}>{profile.doctorPhone || 'Not set'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Edit Profile Button */}
                        <button
                            onClick={handleEdit}
                            onMouseEnter={() => setBtnHover('edit')}
                            onMouseLeave={() => setBtnHover(null)}
                            style={{
                                width: '100%',
                                padding: 14,
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 14,
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                boxShadow: btnHover === 'edit' ? '0 4px 20px rgba(16,185,129,0.5)' : '0 4px 14px rgba(16,185,129,0.3)',
                                transform: btnHover === 'edit' ? 'scale(1.01)' : 'scale(1)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Edit Profile
                        </button>

                        {/* Logout Button (Red Tint style) */}
                        <button
                            onClick={handleLogout}
                            onMouseEnter={() => setBtnHover('logout')}
                            onMouseLeave={() => setBtnHover(null)}
                            style={{
                                width: '100%',
                                padding: 14,
                                background: '#1a0000',
                                color: '#f87171',
                                border: '1.5px solid #ef4444',
                                borderRadius: 14,
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                boxShadow: btnHover === 'logout' ? '0 4px 20px rgba(239,68,68,0.25)' : 'none',
                                transform: btnHover === 'logout' ? 'scale(1.01)' : 'scale(1)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Log Out
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Edit Personal Information Card */}
                        <div style={{
                            background: '#111814',
                            borderRadius: 20,
                            padding: 20,
                            border: '1px solid #1a2e23',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }}>
                            <h3 style={{
                                margin: '0 0 16px',
                                color: '#10b981',
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: 1.5
                            }}>
                                EDIT PERSONAL INFORMATION
                            </h3>
                            <div style={{ display: 'grid', gap: 14 }}>
                                <div>
                                    <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: "block", marginBottom: 6 }}>NAME</span>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editData.name}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField("name")}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Name"
                                        style={getInputStyle("name")}
                                    />
                                </div>
                                <div>
                                    <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: "block", marginBottom: 6 }}>AGE</span>
                                    <input
                                        type="number"
                                        name="age"
                                        value={editData.age}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField("age")}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Age"
                                        style={getInputStyle("age")}
                                    />
                                </div>
                                <div>
                                    <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: "block", marginBottom: 6 }}>EMAIL (Disabled)</span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editData.email}
                                        onChange={handleChange}
                                        placeholder="Email"
                                        disabled
                                        style={{
                                            ...getInputStyle("email"),
                                            background: '#0a0f0d',
                                            cursor: 'not-allowed',
                                            color: '#6b7280'
                                        }}
                                    />
                                </div>
                                <div>
                                    <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: "block", marginBottom: 6 }}>PHONE</span>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={editData.phone}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField("phone")}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Phone"
                                        style={getInputStyle("phone")}
                                    />
                                </div>
                                <div>
                                    <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: "block", marginBottom: 6 }}>BLOOD TYPE</span>
                                    <input
                                        type="text"
                                        name="bloodType"
                                        value={editData.bloodType}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField("bloodType")}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Blood Type"
                                        style={getInputStyle("bloodType")}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Edit Targets Card */}
                        <div style={{
                            background: '#111814',
                            borderRadius: 20,
                            padding: 20,
                            border: '1px solid #1a2e23',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }}>
                            <h3 style={{
                                margin: '0 0 16px',
                                color: '#10b981',
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: 1.5
                            }}>
                                EDIT TARGET VALUES (mg/dL)
                            </h3>
                            <div style={{ display: 'grid', gap: 14 }}>
                                <div>
                                    <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: "block", marginBottom: 6 }}>FASTING TARGET</span>
                                    <input
                                        type="number"
                                        name="targetFasting"
                                        value={editData.targetFasting}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField("targetFasting")}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Fasting Target"
                                        style={getInputStyle("targetFasting")}
                                    />
                                </div>
                                <div>
                                    <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: "block", marginBottom: 6 }}>POST-MEAL TARGET</span>
                                    <input
                                        type="number"
                                        name="targetPostMeal"
                                        value={editData.targetPostMeal}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField("targetPostMeal")}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Post-Meal Target"
                                        style={getInputStyle("targetPostMeal")}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Edit Medical info Card */}
                        <div style={{
                            background: '#111814',
                            borderRadius: 20,
                            padding: 20,
                            border: '1px solid #1a2e23',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }}>
                            <h3 style={{
                                margin: '0 0 16px',
                                color: '#10b981',
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: 1.5
                            }}>
                                EDIT MEDICAL INFORMATION
                            </h3>
                            <div style={{ display: 'grid', gap: 14 }}>
                                <div>
                                    <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: "block", marginBottom: 6 }}>MEDICATIONS</span>
                                    <input
                                        type="text"
                                        name="medications"
                                        value={editData.medications}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField("medications")}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Medications"
                                        style={getInputStyle("medications")}
                                    />
                                </div>
                                <div>
                                    <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: "block", marginBottom: 6 }}>DOCTOR NAME</span>
                                    <input
                                        type="text"
                                        name="doctorName"
                                        value={editData.doctorName}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField("doctorName")}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Doctor Name"
                                        style={getInputStyle("doctorName")}
                                    />
                                </div>
                                <div>
                                    <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: "block", marginBottom: 6 }}>DOCTOR PHONE</span>
                                    <input
                                        type="tel"
                                        name="doctorPhone"
                                        value={editData.doctorPhone}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField("doctorPhone")}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Doctor Phone"
                                        style={getInputStyle("doctorPhone")}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Edit Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <button
                                onClick={handleCancel}
                                onMouseEnter={() => setBtnHover('cancel')}
                                onMouseLeave={() => setBtnHover(null)}
                                style={{
                                    padding: 14,
                                    background: '#0d1611',
                                    color: '#6b7280',
                                    border: '1.5px solid #1a2e23',
                                    borderRadius: 14,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    transition: 'all 0.2s ease',
                                    background: btnHover === 'cancel' ? '#162218' : '#0d1611'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                onMouseEnter={() => setBtnHover('save')}
                                onMouseLeave={() => setBtnHover(null)}
                                style={{
                                    padding: 14,
                                    background: loading ? '#1a2e23' : 'linear-gradient(135deg, #10b981, #059669)',
                                    color: loading ? '#6b7280' : '#fff',
                                    border: 'none',
                                    borderRadius: 14,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontFamily: 'inherit',
                                    boxShadow: loading ? 'none' : (btnHover === 'save' ? '0 4px 20px rgba(16,185,129,0.5)' : '0 4px 12px rgba(16,185,129,0.2)'),
                                    transform: btnHover === 'save' && !loading ? 'scale(1.01)' : 'scale(1)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
};

export default Profile;
