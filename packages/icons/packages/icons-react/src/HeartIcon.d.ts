import React from 'react';
export interface HeartIconProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    spin?: boolean;
}
declare const HeartIcon: React.ForwardRefExoticComponent<Omit<HeartIconProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
export default HeartIcon;
//# sourceMappingURL=HeartIcon.d.ts.map