import React, { forwardRef } from 'react';
const HeartIcon = forwardRef(({ size = '1em', color = 'currentColor', strokeWidth = 2, spin = false, className, ...props }, ref) => {
    const classes = [className, spin && 'ld-icon-spin'].filter(Boolean).join(' ');
    return (<svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={classes} {...props}>
        {/* SVG content will be injected here */}
      </svg>);
});
HeartIcon.displayName = 'HeartIcon';
export default HeartIcon;
//# sourceMappingURL=HeartIcon.jsx.map