import { CSSSchema } from './cssSchema';
import { CSSStyle, CSSStyleVariable } from './cssStyle';

export class StyleController<T extends Record<string, CSSStyle<any, any, any>>> {
  /**
   * 样式图
   */
  map: T;

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

  toStyleListByTheme(theme: CSSSchema<any>, selectorMode: 'attr' | 'class') {
    return Object.keys(theme.map).map(code => ({
      code: code,
      css: (selectorMode === 'attr' ? this.map[code].parcelToAttr : this.map[code].parcelToClass).call(
        this.map[code],
        theme.map[code],
        this.map[code].toString(theme.map[code])
      ),
      variables: this.map[code].get(theme.map[code]).getAll()
    }));
  }

  toStyleList(selectorMode: 'attr' | 'class') {
    return Object.values(this.map).map(group => ({
      code: group.code,
      css: group
        .toAllString()
        .map(type =>
          (selectorMode === 'attr' ? group.parcelToAttr : group.parcelToClass).call(group, type.code, type.css)
        )
        .join('\n\n')
    }));
  }
}
