/**
 * 默认裁剪器模板
 * 定义裁剪器的默认 HTML 结构
 */

export default (
  '<cropper-canvas>'
    + '<cropper-image rotatable scalable skewable translatable></cropper-image>'
    + '<cropper-shade></cropper-shade>'
    + '<cropper-handle action="select" plain></cropper-handle>'
    + '<cropper-selection initial-coverage="0.5" movable resizable outlined>'
      + '<cropper-grid role="grid" bordered></cropper-grid>'
      + '<cropper-crosshair></cropper-crosshair>'
      + '<cropper-handle action="move" plain></cropper-handle>'
      + '<cropper-handle action="n-resize"></cropper-handle>'
      + '<cropper-handle action="e-resize"></cropper-handle>'
      + '<cropper-handle action="s-resize"></cropper-handle>'
      + '<cropper-handle action="w-resize"></cropper-handle>'
      + '<cropper-handle action="ne-resize"></cropper-handle>'
      + '<cropper-handle action="nw-resize"></cropper-handle>'
      + '<cropper-handle action="se-resize"></cropper-handle>'
      + '<cropper-handle action="sw-resize"></cropper-handle>'
    + '</cropper-selection>'
  + '</cropper-canvas>'
);
