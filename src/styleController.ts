import { CSSSchema } from './cssSchema';
import { CSSStyle, CSSStyleVariable } from './cssStyle';

export class StyleController<T extends Record<string, CSSStyle<any>>> {
  /**
   * 样式图
   */
  private map: T;

  constructor(map: T) {
    this.map = map;
  }

  /**
   * 获取所有样式
   */
  getAll() {
    return Object.values(this.map) as Array<T extends Record<string, infer M> ? M : void>;
  }

  /**
   * 获取某一样式
   */
  get<K extends keyof T | (string & Record<never, never>)>(code: K): T[K] {
    return this.map[code];
  }

  /**
   * 创建样式
   */
  create(
    name: string,
    code: string,
    map: Record<
      string,
      {
        name: string;
        code: string;
        variables: Record<string, CSSStyleVariable>;
      }
    >
  ) {
    this.map[code as keyof T] = new CSSStyle(name, code, map) as any;
  }

  /**
   * 删除样式
   */
  delete(code: keyof T | (string & Record<never, never>)) {
    delete this.map[code];
  }

  toStyleListByTheme(theme: CSSSchema<any>) {
    return Object.keys(theme.map).map(group => ({
      code: group,
      css: this.map[group].parcel(theme.map[group], this.map[group].toTypeString(theme.map[group]))
    }));
  }

  toStyleList() {
    return Object.values(this.map).map(group => ({
      code: group.code,
      css: group.toString()
    }));
  }
}
