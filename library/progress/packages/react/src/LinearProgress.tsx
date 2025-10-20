import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { LinearProgress as CoreLinearProgress, LinearProgressOptions } from '@ldesign/progress-core';

export interface LinearProgressProps extends Partial<LinearProgressOptions> {
  onChange?: (value: number) => void;
  onComplete?: () => void;
  onStart?: () => void;
}

export interface LinearProgressRef {
  setValue: (value: number, animated?: boolean) => void;
  getValue: () => number;
  setBuffer: (buffer: number) => void;
  increment: (delta?: number) => void;
  decrement: (delta?: number) => void;
  reset: () => void;
}

export const LinearProgress = forwardRef<LinearProgressRef, LinearProgressProps>(
  (props, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<CoreLinearProgress | null>(null);

    useEffect(() => {
      if (!containerRef.current) return;

      const { onChange, onComplete, onStart, ...coreOptions } = props;

      const options: Partial<LinearProgressOptions> = {
        ...coreOptions,
        onChange,
        onComplete,
        onStart,
      };

      instanceRef.current = new CoreLinearProgress(containerRef.current, options);

      return () => {
        if (instanceRef.current) {
          instanceRef.current.destroy();
          instanceRef.current = null;
        }
      };
    }, []);

    // 更新值
    useEffect(() => {
      if (instanceRef.current && props.value !== undefined) {
        instanceRef.current.setValue(props.value);
      }
    }, [props.value]);

    // 更新buffer
    useEffect(() => {
      if (instanceRef.current && props.buffer !== undefined) {
        instanceRef.current.setBuffer(props.buffer);
      }
    }, [props.buffer]);

    // 更新其他配置
    useEffect(() => {
      if (instanceRef.current) {
        const { value, buffer, onChange, onComplete, onStart, ...restProps } = props;
        instanceRef.current.updateOptions(restProps);
      }
    }, [
      props.direction,
      props.strokeWidth,
      props.color,
      props.trackColor,
      props.theme,
      props.showText,
      props.textInside,
      props.striped,
      props.active,
      props.indeterminate,
      props.width,
      props.height,
    ]);

    // 暴露方法
    useImperativeHandle(ref, () => ({
      setValue: (value: number, animated?: boolean) => {
        instanceRef.current?.setValue(value, animated);
      },
      getValue: () => {
        return instanceRef.current?.getValue() ?? 0;
      },
      setBuffer: (buffer: number) => {
        instanceRef.current?.setBuffer(buffer);
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

LinearProgress.displayName = 'LinearProgress';


