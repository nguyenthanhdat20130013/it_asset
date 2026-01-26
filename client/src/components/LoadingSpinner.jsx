import React from 'react';

/**
 * LoadingSpinner component
 * @param {boolean} fullPage - If true, displays as a full-page overlay with blur
 * @param {string} type - 'simple' or 'dual' (default: 'dual')
 */
const LoadingSpinner = ({ fullPage = false, type = 'dual' }) => {
    const loaderClass = type === 'dual' ? 'loader-dual' : 'loader';

    if (fullPage) {
        return (
            <div className="spinner-overlay">
                <span className={loaderClass}></span>
            </div>
        );
    }

    return (
        <div className="spinner-container">
            <span className={loaderClass}></span>
        </div>
    );
};

export default LoadingSpinner;
