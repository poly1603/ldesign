import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { CircleProgress as CoreCircleProgress, CircleProgressOptions } from '@ldesign/progress-core';

export interface CircleProgressProps extends Partial<CircleProgressOptions> {
  onChange?: (value: number) => void;
  onComplete?: () => void;
  onStart?: () => void;
}

export interface CircleProgressRef {
  setValue: (value: number, animated?: boolean) => void;
  getValue: () => number;
  increment: (delta?: number) => void;
  decrement: (delta?: number) => void;
  reset: () => void;
}

export const CircleProgress = forwardRef<CircleProgressRef, CircleProgressProps>(
  (props, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<CoreCircleProgress | null>(null);

    useEffect(() => {
      if (!containerRef.current) return;

      const { onChange, onComplete, onStart, ...coreOptions } = props;

      const options: Partial<CircleProgressOptions> = {
        ...coreOptions,
        onChange,
        onComplete,
        onStart,
      };

      instanceRef.current = new CoreCircleProgress(containerRef.current, options);

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
      props.radius,
      props.strokeWidth,
      props.color,
      props.trackColor,
      props.theme,
      props.showText,
      props.clockwise,
      props.startAngle,
      props.lineCap,
    ]);

    useImperativeHandle(ref, () => ({
      setValue: (value: number, animated?: boolean) => {
        instanceRef.current?.setValue(value, animated);
      },
      getValue: () => {
        return instanceRef.current?.getValue() ?? 0;
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

CircleProgress.displayName = 'CircleProgress';


