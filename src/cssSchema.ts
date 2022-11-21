/**
 * CSS 方案
 */
export class CSSSchema<T extends Record<string, any>> {
  /**
   * 名称
   */
  name: string;

  /**
   * 代码
   */
  code: string;

  /**
   * 方案映射
   */
  map: T;

  constructor(name: string, code: string, map: T) {
    this.name = name;
    this.code = code;
    this.map = map;
  }

  /**
   * 修改方案映射
   */
  changeMap(map: T) {
    this.map = map;
  }
}
