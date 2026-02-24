'use client';

export default function GlobalSocials() {
    return (
        <div className="social-links">
            <a href="https://www.instagram.com/floatingfourteen/" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
            </a>
            <a href="https://www.tiktok.com/@floatingfourteen" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                </svg>
            </a>
            <style jsx>{`
                .social-links {
                    position: fixed;
                    top: 25px; /* Aligned with cart trigger */
                    right: 80px; /* Left of cart trigger */
                    display: flex;
                    gap: 15px;
                    z-index: 2000;
                    mix-blend-mode: difference; /* Matching global header style */
                }
                .social-icon {
                    color: white;
                    transition: all 0.3s;
                    opacity: 0.7;
                }
                .social-icon:hover {
                    opacity: 1;
                    transform: scale(1.1);
                    color: #dc2626;
                }
            `}</style>
        </div>
    );
}
