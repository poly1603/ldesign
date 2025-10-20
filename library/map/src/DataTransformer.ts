/**
 * DataTransformer - 数据转换器
 * 提供各种数据格式之间的转换功能
 */

import type { FeatureCollection, Feature } from './types';

export class DataTransformer {
  /**
   * 将CSV数据转换为GeoJSON
   */
  static csvToGeoJSON(
    csv: string,
    longitudeField: string = 'longitude',
    latitudeField: string = 'latitude',
    delimiter: string = ','
  ): FeatureCollection {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(delimiter).map(h => h.trim());
    
    const lngIndex = headers.indexOf(longitudeField);
    const latIndex = headers.indexOf(latitudeField);
    
    if (lngIndex === -1 || latIndex === -1) {
      throw new Error(`Could not find ${longitudeField} or ${latitudeField} fields in CSV`);
    }

    const features: Feature[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map(v => v.trim());
      const lng = parseFloat(values[lngIndex]);
      const lat = parseFloat(values[latIndex]);

      if (isNaN(lng) || isNaN(lat)) continue;

      const properties: Record<string, any> = {};
      headers.forEach((header, index) => {
        if (index !== lngIndex && index !== latIndex) {
          const value = values[index];
          // 尝试转换为数字
          const numValue = parseFloat(value);
          properties[header] = isNaN(numValue) ? value : numValue;
        }
      });

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        properties
      });
    }

    return {
      type: 'FeatureCollection',
      features
    };
  }

  /**
   * 将JSON数组转换为GeoJSON
   */
  static arrayToGeoJSON(
    data: Array<Record<string, any>>,
    longitudeField: string = 'longitude',
    latitudeField: string = 'latitude'
  ): FeatureCollection {
    const features: Feature[] = data.map(item => {
      const lng = item[longitudeField];
      const lat = item[latitudeField];

      if (typeof lng !== 'number' || typeof lat !== 'number') {
        throw new Error(`Invalid coordinates in item: ${JSON.stringify(item)}`);
      }

      const { [longitudeField]: _, [latitudeField]: __, ...properties } = item;

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        properties
      };
    });

    return {
      type: 'FeatureCollection',
      features
    };
  }

  /**
   * GeoJSON 转 CSV
   */
  static geoJSONToCSV(geoJSON: FeatureCollection, delimiter: string = ','): string {
    if (!geoJSON.features || geoJSON.features.length === 0) {
      return '';
    }

    // 收集所有属性键
    const allKeys = new Set<string>();
    geoJSON.features.forEach(feature => {
      if (feature.properties) {
        Object.keys(feature.properties).forEach(key => allKeys.add(key));
      }
    });

    // 添加坐标列
    const headers = ['longitude', 'latitude', ...Array.from(allKeys)];
    const rows: string[][] = [headers];

    geoJSON.features.forEach(feature => {
      const geometry = feature.geometry;
      if (geometry.type === 'Point') {
        const [lng, lat] = geometry.coordinates as [number, number];
        const row = [lng.toString(), lat.toString()];
        
        allKeys.forEach(key => {
          const value = feature.properties?.[key];
          row.push(value !== undefined && value !== null ? value.toString() : '');
        });

        rows.push(row);
      }
    });

    return rows.map(row => row.join(delimiter)).join('\n');
  }

  /**
   * 扁平化嵌套的GeoJSON properties
   */
  static flattenProperties(
    geoJSON: FeatureCollection,
    separator: string = '.'
  ): FeatureCollection {
    const features = geoJSON.features.map(feature => {
      const flatProps = this.flattenObject(feature.properties || {}, separator);
      return {
        ...feature,
        properties: flatProps
      };
    });

    return {
      ...geoJSON,
      features
    };
  }

  /**
   * 扁平化对象
   */
  private static flattenObject(
    obj: Record<string, any>,
    separator: string = '.',
    prefix: string = ''
  ): Record<string, any> {
    const flattened: Record<string, any> = {};

    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}${separator}${key}` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, separator, newKey));
      } else {
        flattened[newKey] = value;
      }
    });

    return flattened;
  }

  /**
   * 合并多个GeoJSON
   */
  static mergeGeoJSON(geoJSONs: FeatureCollection[]): FeatureCollection {
    const allFeatures: Feature[] = [];

    geoJSONs.forEach(geoJSON => {
      if (geoJSON.features) {
        allFeatures.push(...geoJSON.features);
      }
    });

    return {
      type: 'FeatureCollection',
      features: allFeatures
    };
  }

  /**
   * 按属性分组GeoJSON
   */
  static groupGeoJSONByProperty(
    geoJSON: FeatureCollection,
    property: string
  ): Map<any, FeatureCollection> {
    const groups = new Map<any, Feature[]>();

    geoJSON.features?.forEach(feature => {
      const value = feature.properties?.[property];
      if (!groups.has(value)) {
        groups.set(value, []);
      }
      groups.get(value)!.push(feature);
    });

    const result = new Map<any, FeatureCollection>();
    groups.forEach((features, key) => {
      result.set(key, {
        type: 'FeatureCollection',
        features
      });
    });

    return result;
  }

  /**
   * 过滤GeoJSON features
   */
  static filterGeoJSON(
    geoJSON: FeatureCollection,
    predicate: (feature: Feature) => boolean
  ): FeatureCollection {
    return {
      ...geoJSON,
      features: geoJSON.features?.filter(predicate) || []
    };
  }

  /**
   * 转换坐标系（简单的坐标变换）
   */
  static transformCoordinates(
    geoJSON: FeatureCollection,
    transformer: (coords: [number, number]) => [number, number]
  ): FeatureCollection {
    const transformFeature = (feature: Feature): Feature => {
      const geometry = feature.geometry;

      if (geometry.type === 'Point') {
        return {
          ...feature,
          geometry: {
            ...geometry,
            coordinates: transformer(geometry.coordinates as [number, number])
          }
        };
      } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
        return {
          ...feature,
          geometry: {
            ...geometry,
            coordinates: (geometry.coordinates as [number, number][]).map(transformer)
          }
        };
      } else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
        return {
          ...feature,
          geometry: {
            ...geometry,
            coordinates: (geometry.coordinates as [number, number][][]).map(ring =>
              ring.map(transformer)
            )
          }
        };
      } else if (geometry.type === 'MultiPolygon') {
        return {
          ...feature,
          geometry: {
            ...geometry,
            coordinates: (geometry.coordinates as [number, number][][][]).map(polygon =>
              polygon.map(ring => ring.map(transformer))
            )
          }
        };
      }

      return feature;
    };

    return {
      ...geoJSON,
      features: geoJSON.features?.map(transformFeature) || []
    };
  }

  /**
   * 添加自定义属性到所有features
   */
  static addProperty(
    geoJSON: FeatureCollection,
    propertyName: string,
    valueOrFunction: any | ((feature: Feature, index: number) => any)
  ): FeatureCollection {
    const features = geoJSON.features?.map((feature, index) => {
      const value =
        typeof valueOrFunction === 'function'
          ? valueOrFunction(feature, index)
          : valueOrFunction;

      return {
        ...feature,
        properties: {
          ...feature.properties,
          [propertyName]: value
        }
      };
    }) || [];

    return {
      ...geoJSON,
      features
    };
  }

  /**
   * 删除属性
   */
  static removeProperty(
    geoJSON: FeatureCollection,
    propertyName: string
  ): FeatureCollection {
    const features = geoJSON.features?.map(feature => {
      const { [propertyName]: _, ...properties } = feature.properties || {};
      return {
        ...feature,
        properties
      };
    }) || [];

    return {
      ...geoJSON,
      features
    };
  }

  /**
   * 重命名属性
   */
  static renameProperty(
    geoJSON: FeatureCollection,
    oldName: string,
    newName: string
  ): FeatureCollection {
    const features = geoJSON.features?.map(feature => {
      if (!feature.properties || !(oldName in feature.properties)) {
        return feature;
      }

      const { [oldName]: value, ...otherProperties } = feature.properties;
      return {
        ...feature,
        properties: {
          ...otherProperties,
          [newName]: value
        }
      };
    }) || [];

    return {
      ...geoJSON,
      features
    };
  }

  /**
   * 统计属性值
   */
  static calculateStatistics(
    geoJSON: FeatureCollection,
    propertyName: string
  ): {
    min: number;
    max: number;
    mean: number;
    median: number;
    sum: number;
    count: number;
  } | null {
    const values: number[] = [];

    geoJSON.features?.forEach(feature => {
      const value = feature.properties?.[propertyName];
      if (typeof value === 'number' && !isNaN(value)) {
        values.push(value);
      }
    });

    if (values.length === 0) return null;

    values.sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const median =
      values.length % 2 === 0
        ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
        : values[Math.floor(values.length / 2)];

    return {
      min: values[0],
      max: values[values.length - 1],
      mean,
      median,
      sum,
      count: values.length
    };
  }
}


