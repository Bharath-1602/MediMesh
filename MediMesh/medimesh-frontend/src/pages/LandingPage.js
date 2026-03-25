import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <div className="hero">
        <div className="hero-content">
          <div className="hero-icon">🏥</div>
          <h1>Medi<span>Mesh</span></h1>
          <p>Smart Hospital Management System — Connecting Patients, Doctors, and Healthcare Services seamlessly.</p>
          <div className="hero-buttons">
            <Link to="/login" className="btn btn-primary" id="landing-login-btn">Login to Dashboard</Link>
            <Link to="/register" className="btn btn-outline" id="landing-register-btn">Create Account</Link>
          </div>
          <div className="hero-features">
            <div className="hero-feature-card">
              <div className="feature-icon">📅</div>
              <h3>Appointments</h3>
              <p>Book and manage appointments with top specialists</p>
            </div>
            <div className="hero-feature-card">
              <div className="feature-icon">💊</div>
              <h3>Pharmacy</h3>
              <p>Browse medicine inventory and availability</p>
            </div>
            <div className="hero-feature-card">
              <div className="feature-icon">🚑</div>
              <h3>Ambulance</h3>
              <p>Real-time ambulance availability tracking</p>
            </div>
            <div className="hero-feature-card">
              <div className="feature-icon">❤️</div>
              <h3>Vitals</h3>
              <p>Track patient health vitals and records</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
