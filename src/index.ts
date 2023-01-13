import { CSSStyle, CSSStyleVariable } from './cssStyle';
import { CSSSchema } from './cssSchema';
import { StyleController } from './styleController';
import { SchemaController } from './schemaController';
import { ColorfullyConfig } from './types';

export * from './cssStyle';
export * from './cssSchema';
export * from './types';

/**
 * 使用参数
 */
export interface UseParams {
  /**
   * 主题根节点
   * @default html
   * @description 也是选择器的挂载点。
   */
  root?: HTMLElement;
  /**
   * 模式
   * @default "css"
   * @description ‘css’ 模式也就是 'all in' 所有 css 都会提前生成挂载，'js' 模式也就是 'Import on demand' 所有的 css 都会被 js 按需导入。
   */
  mode?: 'css' | 'js';
  /**
   * 选择器模式
   * @description 决定挂载器是属性模式还是类名模式。
   */
  selectorMode?: 'attr' | 'class';
  /**
   * 自定义挂载
   * @description 对不支持 dom 操作的情况提供自定义渲染支持。
   */
  customMount?: {
    /**
     * 选择器
     * @param themeMap { groupCode: typeCode }
     */
    selector: (themeMap: Record<string, string>) => void;
    /**
     * 样式
     * @param styleList 样式列表
     */
    style: (
      styleList: {
        code: string;
        css: string;
        /**
         * mode === 'js' 时才会有
         */
        variables?: Array<CSSStyleVariable>;
      }[]
    ) => void;
  };
}

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
   * 默认使用参数
   */
  defaultUseParams?: UseParams;
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

    this.options = {
      defaultUseParams: { mode: 'css', selectorMode: 'attr', ...(options.defaultUseParams || {}) }
    };
  }

  /**
   * 更新默认使用参数
   */
  updateDefaultUseParams(params: UseParams) {
    this.options.defaultUseParams = { ...this.options.defaultUseParams, ...params };
  }

  /**
   * 派生类
   */
  derive(params: Omit<ThemeParameters<StyleMap, SchemaMap>, 'styleMap' | 'schemaMap'>) {
    const colorfully = new Colorfully<StyleMap, SchemaMap>({ ...this.options, ...params });
    colorfully.import(this.export());
    return colorfully;
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
    const params = { ...this.options.defaultUseParams };

    /* 添加 html 主题属性 */
    const theme = this.schema.get(themeCode);

    if (params.customMount?.selector) {
      params.customMount.selector(theme.map);
    } else {
      const html = params.root || document.querySelector('html')!;

      if (params.selectorMode === 'attr')
        html?.getAttributeNames().forEach(name => {
          if (name.includes('data-theme-')) html.removeAttribute(name);
        });
      else
        Array.from(html?.classList).forEach(name => {
          if (name.includes('data-theme-')) html.classList.remove(name);
        });

      Object.keys(theme.map).forEach(styleGroupCode => {
        const styleTypeCode = theme.map[styleGroupCode];
        if (params.selectorMode === 'attr') html?.setAttribute(`data-theme-${styleGroupCode}`, styleTypeCode as string);
        else html?.classList.add(`data-theme-${styleGroupCode}-${styleTypeCode}`);
      });
    }

    if (params.mode === 'css' && this.init) return;
    this.init = true;

    if (params.mode === 'css') {
      const styleList = this.style.toStyleList(params.selectorMode!);
      if (params.customMount?.style) {
        params.customMount.style(styleList);
      } else {
        const oldTagList = Array.from(document.querySelectorAll('style[data-theme-style]'));
        const styleTagList = this.createStyleTag(styleList);
        const head = document.querySelector('head');
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        const firstStyleDom = head?.querySelector('style')!;
        styleTagList.forEach(tag => head?.insertBefore(tag, firstStyleDom));
        oldTagList.forEach(e => e.parentElement?.removeChild(e));
      }
      return;
    }

    const styleList = this.style.toStyleListByTheme(theme, params.selectorMode!);
    if (params.customMount?.style) {
      params.customMount.style(styleList);
    } else {
      const oldTagList = Array.from(document.querySelectorAll('style[data-theme-style]'));
      const styleTagList = this.createStyleTag(styleList);
      const head = document.querySelector('head');
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      const firstStyleDom = head?.querySelector('style')!;
      styleTagList.forEach(tag => head?.insertBefore(tag, firstStyleDom));
      oldTagList.forEach(e => e.parentElement?.removeChild(e));
    }
  }

  /**
   * 导入配置
   */
  import(conf: ColorfullyConfig) {
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
  export() {
    const conf: ColorfullyConfig = {
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
