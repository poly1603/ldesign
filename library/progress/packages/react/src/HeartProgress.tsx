import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { HeartProgress as CoreHeartProgress, HeartProgressOptions } from '@ldesign/progress-core';

export interface HeartProgressProps extends Partial<HeartProgressOptions> {
  onChange?: (value: number) => void;
  onComplete?: () => void;
  onStart?: () => void;
}

export interface HeartProgressRef {
  setValue: (value: number, animated?: boolean) => void;
  getValue: () => number;
  setBeatAnimation: (enabled: boolean) => void;
  setFillMode: (mode: 'bottom-up' | 'center-out' | 'pulse') => void;
  increment: (delta?: number) => void;
  decrement: (delta?: number) => void;
  reset: () => void;
}

export const HeartProgress = forwardRef<HeartProgressRef, HeartProgressProps>(
  (props, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<CoreHeartProgress | null>(null);

    useEffect(() => {
      if (!containerRef.current) return;

      const { onChange, onComplete, onStart, ...coreOptions } = props;

      const options: Partial<HeartProgressOptions> = {
        ...coreOptions,
        onChange,
        onComplete,
        onStart,
      };

      instanceRef.current = new CoreHeartProgress(containerRef.current, options);

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
      props.heartSize,
      props.color,
      props.trackColor,
      props.theme,
      props.showText,
      props.fillMode,
      props.beatAnimation,
      props.beatSpeed,
    ]);

    useImperativeHandle(ref, () => ({
      setValue: (value: number, animated?: boolean) => {
        instanceRef.current?.setValue(value, animated);
      },
      getValue: () => {
        return instanceRef.current?.getValue() ?? 0;
      },
      setBeatAnimation: (enabled: boolean) => {
        instanceRef.current?.setBeatAnimation(enabled);
      },
      setFillMode: (mode: 'bottom-up' | 'center-out' | 'pulse') => {
        instanceRef.current?.setFillMode(mode);
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

HeartProgress.displayName = 'HeartProgress';

