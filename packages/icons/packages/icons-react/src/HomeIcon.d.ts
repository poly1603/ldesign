import React from 'react';
export interface HomeIconProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    spin?: boolean;
}
declare const HomeIcon: React.ForwardRefExoticComponent<Omit<HomeIconProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
export default HomeIcon;
//# sourceMappingURL=HomeIcon.d.ts.map