import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { PolygonProgress as CorePolygonProgress, PolygonProgressOptions } from '@ldesign/progress-core';

export interface PolygonProgressProps extends Partial<PolygonProgressOptions> {
  onChange?: (value: number) => void;
  onComplete?: () => void;
  onStart?: () => void;
}

export interface PolygonProgressRef {
  setValue: (value: number, animated?: boolean) => void;
  getValue: () => number;
  setSides: (sides: number) => void;
  setRotation: (rotation: number) => void;
  increment: (delta?: number) => void;
  decrement: (delta?: number) => void;
  reset: () => void;
}

export const PolygonProgress = forwardRef<PolygonProgressRef, PolygonProgressProps>(
  (props, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<CorePolygonProgress | null>(null);

    useEffect(() => {
      if (!containerRef.current) return;

      const { onChange, onComplete, onStart, ...coreOptions } = props;

      const options: Partial<PolygonProgressOptions> = {
        ...coreOptions,
        onChange,
        onComplete,
        onStart,
      };

      instanceRef.current = new CorePolygonProgress(containerRef.current, options);

      return () => {
        if (instanceRef.current) {
          instanceRef.current.destroy();
          instanceRef.current = null;
        }
      };
    }, []);

    useEffect(() => {
      if (instanceRef.current && props.value !== undefined) {
        instanceRef.current.setValue(props.value);
      }
    }, [props.value]);

    useEffect(() => {
      if (instanceRef.current) {
        const { value, onChange, onComplete, onStart, ...restProps } = props;
        instanceRef.current.updateOptions(restProps);
      }
    }, [
      props.sides,
      props.radius,
      props.rotation,
      props.strokeWidth,
      props.color,
      props.trackColor,
      props.theme,
      props.showText,
    ]);

    useImperativeHandle(ref, () => ({
      setValue: (value: number, animated?: boolean) => {
        instanceRef.current?.setValue(value, animated);
      },
      getValue: () => {
        return instanceRef.current?.getValue() ?? 0;
      },
      setSides: (sides: number) => {
        instanceRef.current?.setSides(sides);
      },
      setRotation: (rotation: number) => {
        instanceRef.current?.setRotation(rotation);
      },
      increment: (delta?: number) => {
        instanceRef.current?.increment(delta);
      },
      decrement: (delta?: number) => {
        instanceRef.current?.decrement(delta);
      },
      reset: () => {
        instanceRef.current?.reset();
      },
    }));

    return <div ref={containerRef} />;
  }
);

PolygonProgress.displayName = 'PolygonProgress';

