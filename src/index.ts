import { CSSStyle } from './cssStyle';
import { CSSSchema } from './cssSchema';
import { StyleController } from './styleController';
import { SchemaController } from './schemaController';
import { ThemeConfig } from './types';

export * from './cssStyle';
export * from './cssSchema';
export * from './types';

/**
 * 主题参数
 */
export interface ThemeParameters<StyleMap, SchemaMap> {
  /**
   * 样式配置图
   */
  styleMap?: StyleMap;
  /**
   * 主题配置图
   */
  schemaMap?: SchemaMap;
  /**
   * 模式
   * @default "css"
   */
  mode?: 'css' | 'js';
}

/**
 * 主题
 */
export class Colorfully<
  StyleMap extends Record<string, CSSStyle<any>>,
  SchemaMap extends Record<string, CSSSchema<any>>
> {
  style;
  schema;

  private options: Omit<ThemeParameters<StyleMap, SchemaMap>, 'styleMap' | 'schemaMap'>;

  constructor({ styleMap, schemaMap, ...options }: ThemeParameters<StyleMap, SchemaMap> = {}) {
    this.style = new StyleController<StyleMap>({
      ...(styleMap || {})
    } as StyleMap);

    this.schema = new SchemaController<SchemaMap>({
      ...(schemaMap || {})
    } as SchemaMap);

    this.options = { mode: options.mode || 'css' };
  }

  private createStyleTag(styleList: ReturnType<typeof this.style.toStyleList>) {
    return styleList.map(style => {
      const tag = document.createElement('style');
      tag.setAttribute(`type`, 'text/css');
      tag.setAttribute(`data-theme-style`, style.code);
      tag.innerHTML = style.css;
      return tag;
    });
  }

  private init = false;

  /**
   * 使用主题
   */
  use(themeCode: keyof SchemaMap | (string & Record<never, never>)) {
    /* 添加 html 主题属性 */
    const theme = this.schema.get(themeCode);

    const html = document.querySelector('html');

    html?.getAttributeNames().forEach(name => {
      if (name.includes('data-theme-')) html.removeAttribute(name);
    });

    Object.keys(theme.map).forEach(styleCode => {
      const styleType = theme.map[styleCode];
      html?.setAttribute(`data-theme-${styleCode}`, styleType as string);
    });

    if (this.options.mode === 'css' && this.init) return;
    this.init = true;
    const oldTagList = Array.from(document.querySelectorAll('style[data-theme-style]'));

    if (this.options.mode === 'css') {
      const styleList = this.style.toStyleList();
      const styleTagList = this.createStyleTag(styleList);
      const head = document.querySelector('head');
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      const firstStyleDom = head?.querySelector('style')!;
      styleTagList.forEach(tag => head?.insertBefore(tag, firstStyleDom));
      oldTagList.forEach(e => e.parentElement?.removeChild(e));
      return;
    }

    const styleList = this.style.toStyleListByTheme(theme);
    const styleTagList = this.createStyleTag(styleList);
    const head = document.querySelector('head');
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const firstStyleDom = head?.querySelector('style')!;
    styleTagList.forEach(tag => head?.insertBefore(tag, firstStyleDom));
    oldTagList.forEach(e => e.parentElement?.removeChild(e));
  }

  /**
   * 导入配置
   */
  importConfig(conf: ThemeConfig) {
    const { styles, schemas } = conf;

    for (const style of styles) {
      this.style.create(
        style.name,
        style.code,
        style.types.reduce((map, type) => {
          map[type.code] = {
            name: type.name,
            code: type.code,
            variables: type.variables.reduce((m, c) => {
              m[c.code] = {
                ...c
              };
              return m;
            }, {} as any)
          };
          return map;
        }, {} as any)
      );
    }

    for (const schema of schemas) {
      this.schema.create(schema.name, schema.code, schema.map);
    }
  }

  /**
   * 导出配置
   */
  exportConfig() {
    const conf: ThemeConfig = {
      styles: this.style.getAll().map(style => ({
        name: style.name,
        code: style.code,
        types: style.getAll().map(type => ({ name: type.name, code: type.code, variables: type.getAll() }))
      })),
      schemas: this.schema.getAll().map(i => ({ name: i.name, code: i.code, map: i.map }))
    };

    return conf;
  }
}
