import {ReportHandler} from 'web-vitals';

// Utility function to measure and report Web Vitals
const reportWebVitals = (onPerfEntry?: ReportHandler) => {
    // Only run if callback is provided and is a function
    if (onPerfEntry && onPerfEntry instanceof Function) {
        // Dynamically import web-vitals library
        import('web-vitals').then(({
            getCLS,  // Cumulative Layout Shift
            getFID,  // First Input Delay
            getFCP,  // First Contentful Paint
            getLCP,  // Largest Contentful Paint
            getTTFB  // Time to First Byte
        }) => {
            // Measure CLS and report to callback
            getCLS(onPerfEntry);
            // Measure FID and report to callback
            getFID(onPerfEntry);
            // Measure FCP and report to callback
            getFCP(onPerfEntry);
            // Measure LCP and report to callback
            getLCP(onPerfEntry);
            // Measure TTFB and report to callback
            getTTFB(onPerfEntry);
        });
    }
};

export default reportWebVitals;
