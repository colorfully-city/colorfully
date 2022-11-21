/**
 * 主题配置
 */
export interface ThemeConfig {
  /**
   * 样式
   */
  styles: Array<{
    /**
     * 名称
     */
    name: string;
    /**
     * 代码
     */
    code: string;
    /**
     * 类型
     */
    types: Array<{
      /**
       * 名称
       */
      name: string;
      /**
       * 代码
       */
      code: string;
      /**
       * 变量
       */
      variables: Array<{
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
      }>;
    }>;
  }>;
  /**
   * 方案
   */
  schemas: Array<{
    /**
     * 名称
     */
    name: string;
    /**
     * 代码
     */
    code: string;
    /**
     * { 样式 : 类型 }
     */
    map: Record<string, string>;
  }>;
}
