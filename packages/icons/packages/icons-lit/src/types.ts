import { LitElement } from 'lit';

export interface IconProps {
  size?: string;
  color?: string;
}

export type IconElement = LitElement & IconProps;
