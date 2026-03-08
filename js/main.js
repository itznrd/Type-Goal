// Main entry point - loads all modules
(function() {
    function initModules() {
        // All modules are loaded via their own IIFEs
        // This file ensures proper loading order
        if (typeof initSettings === 'function') {
            initSettings();
        }
        if (typeof initStatsOverlay === 'function') {
            initStatsOverlay();
        }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModules);
    } else {
        initModules();
    }
})();
