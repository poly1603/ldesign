/**
  *  GeoJSON  地图渲染器
  *  支持各种定制化需求的地图渲染引擎
  */

export  interface  MapStyle  {
    fillColor?:  string;
    strokeColor?:  string;
    strokeWidth?:  number;
    pointRadius?:  number;
    pointColor?:  string;
    hoverFillColor?:  string;
    hoverStrokeColor?:  string;
}

export  interface  MapOptions  {
    container:  HTMLCanvasElement;
    width?:  number;
    height?:  number;
    style?:  MapStyle;
    backgroundColor?:  string;
    enableZoom?:  boolean;
    enablePan?:  boolean;
    minZoom?:  number;
    maxZoom?:  number;
}

interface  Point  {
    x:  number;
    y:  number;
}

interface  Bounds  {
    minLon:  number;
    maxLon:  number;
    minLat:  number;
    maxLat:  number;
}

export  class  GeoMapRenderer  {
    private  canvas:  HTMLCanvasElement;
    private  ctx:  CanvasRenderingContext2D;
    private  width:  number;
    private  height:  number;
    private  geoData:  any  =  null;
    private  bounds:  Bounds  =  {  minLon:  0,  maxLon:  0,  minLat:  0,  maxLat:  0  };

    //  交互状态
    private  scale:  number  =  1;
    private  offsetX:  number  =  0;
    private  offsetY:  number  =  0;
    private  isDragging:  boolean  =  false;
    private  lastMouseX:  number  =  0;
    private  lastMouseY:  number  =  0;

    //  配置
    private  style:  Required<MapStyle>;
    private  backgroundColor:  string;
    private  enableZoom:  boolean;
    private  enablePan:  boolean;
    private  minZoom:  number;
    private  maxZoom:  number;

    //  悬停状态
    private  hoveredFeature:  any  =  null;

    constructor(options:  MapOptions)  {
        this.canvas  =  options.container;
        this.ctx  =  this.canvas.getContext('2d')!;
        this.width  =  options.width  ||  this.canvas.width;
        this.height  =  options.height  ||  this.canvas.height;

        //  设置画布大小
        this.canvas.width  =  this.width;
        this.canvas.height  =  this.height;

        //  默认样式
        this.style  =  {
            fillColor:  options.style?.fillColor  ||  '#e0f2fe',
            strokeColor:  options.style?.strokeColor  ||  '#0284c7',
            strokeWidth:  options.style?.strokeWidth  ||  1,
            pointRadius:  options.style?.pointRadius  ||  5,
            pointColor:  options.style?.pointColor  ||  '#dc2626',
            hoverFillColor:  options.style?.hoverFillColor  ||  '#bae6fd',
            hoverStrokeColor:  options.style?.hoverStrokeColor  ||  '#0369a1',
        };

        this.backgroundColor  =  options.backgroundColor  ||  '#f0f9ff';
        this.enableZoom  =  options.enableZoom  ??  true;
        this.enablePan  =  options.enablePan  ??  true;
        this.minZoom  =  options.minZoom  ||  0.5;
        this.maxZoom  =  options.maxZoom  ||  10;

        this.setupEventListeners();
    }

    /**
      *  加载  GeoJSON  数据
      */
    loadGeoJSON(geoData:  any):  void  {
        this.geoData  =  geoData;
        this.calculateBounds();
        this.fitBounds();
        this.render();
    }

    /**
      *  计算地理边界
      */
    private  calculateBounds():  void  {
        if  (!this.geoData)  return;

        let  minLon  =  Infinity;
        let  maxLon  =  -Infinity;
        let  minLat  =  Infinity;
        let  maxLat  =  -Infinity;

        const  processCoordinates  =  (coords:  any)  =>  {
            if  (typeof  coords[0]  ===  'number')  {
                //  单个点
                const  [lon,  lat]  =  coords;
                minLon  =  Math.min(minLon,  lon);
                maxLon  =  Math.max(maxLon,  lon);
                minLat  =  Math.min(minLat,  lat);
                maxLat  =  Math.max(maxLat,  lat);
            }  else  {
                //  嵌套数组
                coords.forEach(processCoordinates);
            }
        };

        const  features  =  this.geoData.type  ===  'FeatureCollection'
            ?  this.geoData.features
            :  [this.geoData];

        features.forEach((feature:  any)  =>  {
            const  geometry  =  feature.geometry  ||  feature;
            if  (geometry.coordinates)  {
                processCoordinates(geometry.coordinates);
            }
        });

        this.bounds  =  {  minLon,  maxLon,  minLat,  maxLat  };
    }

    /**
      *  自动适应边界
      */
    private  fitBounds():  void  {
        const  {  minLon,  maxLon,  minLat,  maxLat  }  =  this.bounds;

        const  geoWidth  =  maxLon  -  minLon;
        const  geoHeight  =  maxLat  -  minLat;

        //  计算缩放比例
        const  scaleX  =  this.width  /  geoWidth;
        const  scaleY  =  this.height  /  geoHeight;
        this.scale  =  Math.min(scaleX,  scaleY)  *  0.9;  //  留  10%  边距

        //  计算居中偏移
        const  centerLon  =  (minLon  +  maxLon)  /  2;
        const  centerLat  =  (minLat  +  maxLat)  /  2;
        const  centerPoint  =  this.projectPoint(centerLon,  centerLat);

        this.offsetX  =  this.width  /  2  -  centerPoint.x;
        this.offsetY  =  this.height  /  2  -  centerPoint.y;
    }

    /**
      *  墨卡托投影：将经纬度转换为屏幕坐标
      */
    private  projectPoint(lon:  number,  lat:  number):  Point  {
        //  简单的等距圆柱投影（可替换为墨卡托或其他投影）
        const  x  =  lon  *  this.scale  +  this.offsetX;
        const  y  =  -lat  *  this.scale  +  this.offsetY;  //  纬度需要反转
        return  {  x,  y  };
    }

    /**
      *  渲染地图
      */
    render():  void  {
        if  (!this.geoData)  return;

        //  清空画布
        this.ctx.fillStyle  =  this.backgroundColor;
        this.ctx.fillRect(0,  0,  this.width,  this.height);

        //  渲染所有要素
        const  features  =  this.geoData.type  ===  'FeatureCollection'
            ?  this.geoData.features
            :  [this.geoData];

        features.forEach((feature:  any)  =>  {
            const  isHovered  =  feature  ===  this.hoveredFeature;
            this.renderFeature(feature,  isHovered);
        });
    }

    /**
      *  渲染单个要素
      */
    private  renderFeature(feature:  any,  isHovered:  boolean):  void  {
        const  geometry  =  feature.geometry  ||  feature;
        const  type  =  geometry.type;

        //  设置样式
        const  fillColor  =  isHovered  ?  this.style.hoverFillColor  :  this.style.fillColor;
        const  strokeColor  =  isHovered  ?  this.style.hoverStrokeColor  :  this.style.strokeColor;

        this.ctx.fillStyle  =  fillColor;
        this.ctx.strokeStyle  =  strokeColor;
        this.ctx.lineWidth  =  this.style.strokeWidth;

        switch  (type)  {
            case  'Point':
                this.renderPoint(geometry.coordinates);
                break;
            case  'MultiPoint':
                geometry.coordinates.forEach((coords:  any)  =>  this.renderPoint(coords));
                break;
            case  'LineString':
                this.renderLineString(geometry.coordinates);
                break;
            case  'MultiLineString':
                geometry.coordinates.forEach((coords:  any)  =>  this.renderLineString(coords));
                break;
            case  'Polygon':
                this.renderPolygon(geometry.coordinates);
                break;
            case  'MultiPolygon':
                geometry.coordinates.forEach((coords:  any)  =>  this.renderPolygon(coords));
                break;
        }
    }

    /**
      *  渲染点
      */
    private  renderPoint(coords:  number[]):  void  {
        const  [lon,  lat]  =  coords;
        const  {  x,  y  }  =  this.projectPoint(lon,  lat);

        this.ctx.fillStyle  =  this.style.pointColor;
        this.ctx.beginPath();
        this.ctx.arc(x,  y,  this.style.pointRadius,  0,  Math.PI  *  2);
        this.ctx.fill();
        this.ctx.stroke();
    }

    /**
      *  渲染线
      */
    private  renderLineString(coords:  number[][]):  void  {
        if  (coords.length  <  2)  return;

        this.ctx.beginPath();
        coords.forEach(([lon,  lat],  index)  =>  {
            const  {  x,  y  }  =  this.projectPoint(lon,  lat);
            if  (index  ===  0)  {
                this.ctx.moveTo(x,  y);
            }  else  {
                this.ctx.lineTo(x,  y);
            }
        });
        this.ctx.stroke();
    }

    /**
      *  渲染多边形
      */
    private  renderPolygon(coords:  number[][][]):  void  {
        coords.forEach((ring,  ringIndex)  =>  {
            this.ctx.beginPath();
            ring.forEach(([lon,  lat],  index)  =>  {
                const  {  x,  y  }  =  this.projectPoint(lon,  lat);
                if  (index  ===  0)  {
                    this.ctx.moveTo(x,  y);
                }  else  {
                    this.ctx.lineTo(x,  y);
                }
            });
            this.ctx.closePath();

            if  (ringIndex  ===  0)  {
                this.ctx.fill();
            }  else  {
                //  内环（孔）
                this.ctx.fillStyle  =  this.backgroundColor;
                this.ctx.fill();
            }
            this.ctx.stroke();
        });
    }

    /**
      *  设置事件监听
      */
    private  setupEventListeners():  void  {
        //  鼠标滚轮缩放
        if  (this.enableZoom)  {
            this.canvas.addEventListener('wheel',  (e)  =>  {
                e.preventDefault();
                const  delta  =  e.deltaY  >  0  ?  0.9  :  1.1;
                const  newScale  =  this.scale  *  delta;

                if  (newScale  >=  this.minZoom  &&  newScale  <=  this.maxZoom)  {
                    const  rect  =  this.canvas.getBoundingClientRect();
                    const  mouseX  =  e.clientX  -  rect.left;
                    const  mouseY  =  e.clientY  -  rect.top;

                    //  以鼠标位置为中心缩放
                    this.offsetX  =  mouseX  -  (mouseX  -  this.offsetX)  *  delta;
                    this.offsetY  =  mouseY  -  (mouseY  -  this.offsetY)  *  delta;
                    this.scale  =  newScale;

                    this.render();
                }
            });
        }

        //  鼠标拖拽平移
        if  (this.enablePan)  {
            this.canvas.addEventListener('mousedown',  (e)  =>  {
                this.isDragging  =  true;
                this.lastMouseX  =  e.clientX;
                this.lastMouseY  =  e.clientY;
                this.canvas.style.cursor  =  'grabbing';
            });

            this.canvas.addEventListener('mousemove',  (e)  =>  {
                if  (this.isDragging)  {
                    const  dx  =  e.clientX  -  this.lastMouseX;
                    const  dy  =  e.clientY  -  this.lastMouseY;

                    this.offsetX  +=  dx;
                    this.offsetY  +=  dy;

                    this.lastMouseX  =  e.clientX;
                    this.lastMouseY  =  e.clientY;

                    this.render();
                }  else  {
                    //  悬停检测
                    this.handleHover(e);
                }
            });

            this.canvas.addEventListener('mouseup',  ()  =>  {
                this.isDragging  =  false;
                this.canvas.style.cursor  =  'grab';
            });

            this.canvas.addEventListener('mouseleave',  ()  =>  {
                this.isDragging  =  false;
                this.canvas.style.cursor  =  'default';
            });

            this.canvas.style.cursor  =  'grab';
        }
    }

    /**
      *  处理鼠标悬停
      */
    private  handleHover(e:  MouseEvent):  void  {
        const  rect  =  this.canvas.getBoundingClientRect();
        const  mouseX  =  e.clientX  -  rect.left;
        const  mouseY  =  e.clientY  -  rect.top;

        //  查找鼠标下的要素
        const  features  =  this.geoData.type  ===  'FeatureCollection'
            ?  this.geoData.features
            :  [this.geoData];

        let  found  =  false;
        for  (const  feature  of  features)  {
            if  (this.isPointInFeature(mouseX,  mouseY,  feature))  {
                if  (this.hoveredFeature  !==  feature)  {
                    this.hoveredFeature  =  feature;
                    this.render();
                }
                found  =  true;
                break;
            }
        }

        if  (!found  &&  this.hoveredFeature)  {
            this.hoveredFeature  =  null;
            this.render();
        }
    }

    /**
      *  检测点是否在要素内
      */
    private  isPointInFeature(x:  number,  y:  number,  feature:  any):  boolean  {
        const  geometry  =  feature.geometry  ||  feature;
        const  type  =  geometry.type;

        switch  (type)  {
            case  'Polygon':
            case  'MultiPolygon':
                const  polygons  =  type  ===  'Polygon'
                    ?  [geometry.coordinates]
                    :  geometry.coordinates;

                return  polygons.some((coords:  any)  =>  {
                    const  ring  =  coords[0];  //  只检查外环
                    return  this.pointInPolygon(x,  y,  ring);
                });
            default:
                return  false;
        }
    }

    /**
      *  点在多边形内判断（射线法）
      */
    private  pointInPolygon(x:  number,  y:  number,  ring:  number[][]):  boolean  {
        let  inside  =  false;
        for  (let  i  =  0,  j  =  ring.length  -  1;  i  <  ring.length;  j  =  i++)  {
            const  [lon1,  lat1]  =  ring[i];
            const  [lon2,  lat2]  =  ring[j];
            const  p1  =  this.projectPoint(lon1,  lat1);
            const  p2  =  this.projectPoint(lon2,  lat2);

            if  (((p1.y  >  y)  !==  (p2.y  >  y))  &&
                    (x  <  (p2.x  -  p1.x)  *  (y  -  p1.y)  /  (p2.y  -  p1.y)  +  p1.x))  {
                inside  =  !inside;
            }
        }
        return  inside;
    }

    /**
      *  更新样式
      */
    updateStyle(style:  Partial<MapStyle>):  void  {
        Object.assign(this.style,  style);
        this.render();
    }

    /**
      *  重置视图
      */
    reset():  void  {
        this.fitBounds();
        this.render();
    }

    /**
      *  销毁
      */
    destroy():  void  {
        //  移除所有事件监听器
        this.canvas.replaceWith(this.canvas.cloneNode(true));
    }
}
