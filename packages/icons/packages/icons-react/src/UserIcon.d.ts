import React from 'react';
export interface UserIconProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    spin?: boolean;
}
declare const UserIcon: React.ForwardRefExoticComponent<Omit<UserIconProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
export default UserIcon;
//# sourceMappingURL=UserIcon.d.ts.map