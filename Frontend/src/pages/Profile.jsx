import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ButtomNave from '../components/ButtomNave'

const Profile = () => {
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = useState(false)
    const [profile, setProfile] = useState({
        name: 'John Doe',
        age: 45,
        email: 'john@example.com',
        phone: '+1234567890',
        bloodType: 'O+',
        targetFasting: 120,
        targetPostMeal: 180,
        medications: 'Metformin 1000mg',
        doctorName: 'Dr. Smith',
        doctorPhone: '+1987654321'
    })

    const [editData, setEditData] = useState(profile)

    const handleEdit = () => {
        setIsEditing(true)
        setEditData(profile)
    }

    const handleCancel = () => {
        setIsEditing(false)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setEditData(prev => ({
            ...prev,
            [name]: isNaN(value) ? value : value
        }))
    }

    const handleSave = () => {
        setProfile(editData)
        setIsEditing(false)
    }

    return (
        <div style={{ paddingBottom: 80, background: '#fafaf9', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                padding: '20px',
                textAlign: 'center'
            }}>
                <h1 style={{ margin: '10px 0', fontSize: 28, fontWeight: 700 }}>My Profile</h1>
                <p style={{ margin: 0, opacity: 0.9 }}>Manage your health information</p>
            </div>

            <div style={{ padding: '20px' }}>
                {/* Profile Avatar */}
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 40,
                        margin: '0 auto',
                        color: '#fff'
                    }}>
                        👤
                    </div>
                    <h2 style={{ margin: '15px 0 5px', color: '#1f2937' }}>{profile.name}</h2>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>{profile.email}</p>
                </div>

                {!isEditing ? (
                    <>
                        {/* Personal Information */}
                        <div style={{
                            background: '#fff',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 16,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <h3 style={{ margin: '0 0 12px', color: '#1f2937', fontSize: 16, fontWeight: 600 }}>
                                Personal Information
                            </h3>
                            <div style={{ display: 'grid', gap: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: 10 }}>
                                    <span style={{ color: '#6b7280' }}>Age:</span>
                                    <span style={{ fontWeight: 500, color: '#1f2937' }}>{profile.age} years</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: 10 }}>
                                    <span style={{ color: '#6b7280' }}>Phone:</span>
                                    <span style={{ fontWeight: 500, color: '#1f2937' }}>{profile.phone}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280' }}>Blood Type:</span>
                                    <span style={{ fontWeight: 500, color: '#1f2937' }}>{profile.bloodType}</span>
                                </div>
                            </div>
                        </div>

                        {/* Health Targets */}
                        <div style={{
                            background: '#fff',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 16,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <h3 style={{ margin: '0 0 12px', color: '#1f2937', fontSize: 16, fontWeight: 600 }}>
                                Target Values
                            </h3>
                            <div style={{ display: 'grid', gap: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: 10 }}>
                                    <span style={{ color: '#6b7280' }}>Fasting Target:</span>
                                    <span style={{ fontWeight: 500, color: '#1f2937' }}>{profile.targetFasting} mg/dL</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280' }}>Post-Meal Target:</span>
                                    <span style={{ fontWeight: 500, color: '#1f2937' }}>{profile.targetPostMeal} mg/dL</span>
                                </div>
                            </div>
                        </div>

                        {/* Medical Information */}
                        <div style={{
                            background: '#fff',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 16,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <h3 style={{ margin: '0 0 12px', color: '#1f2937', fontSize: 16, fontWeight: 600 }}>
                                Medical Information
                            </h3>
                            <div style={{ display: 'grid', gap: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: 10 }}>
                                    <span style={{ color: '#6b7280' }}>Medications:</span>
                                    <span style={{ fontWeight: 500, color: '#1f2937' }}>{profile.medications}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: 10 }}>
                                    <span style={{ color: '#6b7280' }}>Doctor Name:</span>
                                    <span style={{ fontWeight: 500, color: '#1f2937' }}>{profile.doctorName}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280' }}>Doctor Phone:</span>
                                    <span style={{ fontWeight: 500, color: '#1f2937' }}>{profile.doctorPhone}</span>
                                </div>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <button onClick={handleEdit} style={{
                            width: '100%',
                            padding: 12,
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background 0.3s'
                        }}
                            onMouseOver={(e) => e.target.style.background = '#059669'}
                            onMouseOut={(e) => e.target.style.background = '#10b981'}
                        >
                            Edit Profile
                        </button>
                    </>
                ) : (
                    <>
                        {/* Edit Form */}
                        <div style={{
                            background: '#fff',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 16,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <h3 style={{ margin: '0 0 16px', color: '#1f2937', fontSize: 16, fontWeight: 600 }}>
                                Edit Personal Information
                            </h3>
                            <div style={{ display: 'grid', gap: 12 }}>
                                <input
                                    type="text"
                                    name="name"
                                    value={editData.name}
                                    onChange={handleChange}
                                    placeholder="Name"
                                    style={{
                                        padding: '10px 12px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <input
                                    type="number"
                                    name="age"
                                    value={editData.age}
                                    onChange={handleChange}
                                    placeholder="Age"
                                    style={{
                                        padding: '10px 12px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={editData.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    style={{
                                        padding: '10px 12px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={editData.phone}
                                    onChange={handleChange}
                                    placeholder="Phone"
                                    style={{
                                        padding: '10px 12px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <input
                                    type="text"
                                    name="bloodType"
                                    value={editData.bloodType}
                                    onChange={handleChange}
                                    placeholder="Blood Type"
                                    style={{
                                        padding: '10px 12px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{
                            background: '#fff',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 16,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <h3 style={{ margin: '0 0 16px', color: '#1f2937', fontSize: 16, fontWeight: 600 }}>
                                Edit Health Targets
                            </h3>
                            <div style={{ display: 'grid', gap: 12 }}>
                                <input
                                    type="number"
                                    name="targetFasting"
                                    value={editData.targetFasting}
                                    onChange={handleChange}
                                    placeholder="Fasting Target (mg/dL)"
                                    style={{
                                        padding: '10px 12px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <input
                                    type="number"
                                    name="targetPostMeal"
                                    value={editData.targetPostMeal}
                                    onChange={handleChange}
                                    placeholder="Post-Meal Target (mg/dL)"
                                    style={{
                                        padding: '10px 12px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{
                            background: '#fff',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 16,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <h3 style={{ margin: '0 0 16px', color: '#1f2937', fontSize: 16, fontWeight: 600 }}>
                                Edit Medical Information
                            </h3>
                            <div style={{ display: 'grid', gap: 12 }}>
                                <input
                                    type="text"
                                    name="medications"
                                    value={editData.medications}
                                    onChange={handleChange}
                                    placeholder="Medications"
                                    style={{
                                        padding: '10px 12px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <input
                                    type="text"
                                    name="doctorName"
                                    value={editData.doctorName}
                                    onChange={handleChange}
                                    placeholder="Doctor Name"
                                    style={{
                                        padding: '10px 12px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <input
                                    type="tel"
                                    name="doctorPhone"
                                    value={editData.doctorPhone}
                                    onChange={handleChange}
                                    placeholder="Doctor Phone"
                                    style={{
                                        padding: '10px 12px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <button onClick={handleCancel} style={{
                                padding: 12,
                                background: '#e5e7eb',
                                color: '#374151',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}>
                                Cancel
                            </button>
                            <button onClick={handleSave} style={{
                                padding: 12,
                                background: '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}>
                                Save Changes
                            </button>
                        </div>
                    </>
                )}
            </div>

            <ButtomNave />
        </div>
    )
}

export default Profile
