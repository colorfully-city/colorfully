import { CSSSchema } from './cssSchema';

/**
 * 方案控制器
 */
export class SchemaController<M extends Record<string, CSSSchema<any>>> {
  /**
   * 方案图
   */
  private map: M;

  constructor(map: M) {
    this.map = map;
  }

  /**
   * 获取所有方案
   */
  getAll() {
    return Object.values(this.map) as Array<M extends Record<string, infer T> ? T : void>;
  }

  /**
   * 获取某一方案
   */
  get<T extends keyof M | (string & Record<never, never>)>(code: T): M[T] {
    return this.map[code];
  }

  /**
   * 创建方案
   */
  create(
    name: string,
    code: string,
    map: (M extends Record<string, CSSSchema<infer MAP>> ? MAP : void) | Record<string, string>
  ) {
    this.map[code as keyof M | (string & Record<never, never>)] = new CSSSchema(name, code as string, map) as any;
  }

  /**
   * 删除方案
   */
  delete(code: keyof M | (string & Record<never, never>)) {
    delete this.map[code];
  }
}
