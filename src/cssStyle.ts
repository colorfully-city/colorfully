/**
 * CSS 样式变量
 */
export interface CSSStyleVariable {
  /**
   * 名称
   */
  name: string;
  /**
   * 代码
   */
  code: string;
  /**
   * 值
   */
  value: string;
}

/**
 * CSS 样式类型
 */
export class CSSStyleType<T extends Record<string, CSSStyleVariable>> {
  /**
   * 名称
   */
  name: string;

  /**
   * 代码
   */
  code: string;

  /**
   * 类型样式映射
   */
  map: T;

  constructor(name: string, code: string, map: T) {
    this.name = name;
    this.code = code;
    this.map = map;
  }

  /**
   * 获取所有类型变量
   */
  getAll() {
    return Object.values(this.map) as Array<CSSStyleVariable>;
  }

  /**
   * 获取某一类型变量
   */
  get(code: keyof T | (string & Record<never, never>)) {
    return this.map[code];
  }

  /**
   * 创建类型变量
   */
  create(name: string, code: string, value: string) {
    this.map[code as keyof T] = { name, code, value } as any;
  }

  /**
   * 删除类型变量
   */
  delete(code: keyof T | (string & Record<never, never>)) {
    delete this.map[code];
  }

  /**
   * 修改类型变量
   */
  change(code: keyof T | (string & Record<never, never>), value: string) {
    this.map[code].value = value;
  }
}

/**
 * CSS 样式
 */
export class CSSStyle<
  T extends Record<string, { name: string; code: string; variables: Record<string, CSSStyleVariable> }>
> {
  /**
   * 名称
   */
  name: string;

  /**
   * 代码
   */
  code: string;

  /**
   * 样式映射
   */
  map: {
    [K in keyof T]: CSSStyleType<
      T extends Record<string, { name: string; code: string; variables: infer K }> ? K : void
    >;
  };

  constructor(name: string, code: string, map: T) {
    this.name = name;
    this.code = code;
    this.map = Object.keys(map).reduce((m, type) => {
      m[type as keyof T] = new CSSStyleType(map[type].name, map[type].code, map[type].variables) as any;
      return m;
    }, {} as typeof this.map);
  }

  /**
   * 获取所有样式类型
   */
  getAll() {
    return Object.values(this.map) as Array<
      CSSStyleType<T extends Record<string, { name: string; code: string; variables: infer K }> ? K : void>
    >;
  }

  /**
   * 获取某一样式类型
   */
  get<K extends keyof T | (string & Record<never, never>)>(type: K): typeof this.map[K] {
    return this.map[type];
  }

  /**
   * 创建样式类型
   */
  create(name: string, code: string, map: Record<string, CSSStyleVariable>) {
    this.map[code as keyof T] = new CSSStyleType(name, code, map) as any;
  }

  /**
   * 删除样式类型
   */
  delete(type: keyof T | (string & Record<never, never>)) {
    delete this.map[type];
  }

  /**
   * 包裹样式类型
   */
  parcel(type: keyof T | (string & Record<never, never>), value: string) {
    return `*[ data-theme-${this.code} = '${String(type)}' ] {
${value}
}`;
  }

  /**
   * 生成样式类型字符串
   */
  toTypeString(type: keyof T | (string & Record<never, never>)) {
    return this.get(type)
      .getAll()
      .map(variable => `${variable.code}: ${variable.value};`)
      .join('\n');
  }

  /**
   * 生成样式字符串
   */
  toString() {
    return this.getAll()
      .map(type => this.parcel(type.code, this.toTypeString(type.code)))
      .join('\n\n');
  }
}
