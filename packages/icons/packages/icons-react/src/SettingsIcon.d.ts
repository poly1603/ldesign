import React from 'react';
export interface SettingsIconProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    spin?: boolean;
}
declare const SettingsIcon: React.ForwardRefExoticComponent<Omit<SettingsIconProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
export default SettingsIcon;
//# sourceMappingURL=SettingsIcon.d.ts.map