import React from 'react';
export interface SearchIconProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    spin?: boolean;
}
declare const SearchIcon: React.ForwardRefExoticComponent<Omit<SearchIconProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
export default SearchIcon;
//# sourceMappingURL=SearchIcon.d.ts.map