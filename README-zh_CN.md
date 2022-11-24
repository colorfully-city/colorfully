# Colorfully

> 使用 Colorfully 来定义你的界面主题吧!



## ✨特性

Colorfully 的核心功能就是使用 `JavaScript` 控制 `CSS Variable` 以及 `HTML Attrbute`，来达到动态主题的效果。

- 强大：**局部主题**
- 灵活：**编程式创建**、**动态导入导出配置**
- 激发：**自定义主题包**
- 友好：**`TypeScript` 类型支持**、**`CSS Variable` 智能提示**
- 迅速：**快速接入主流组件库**、**脚手架快速创建主题包**



## 📦安装

```bash
npm i colorfully
```



## 使用

Colorfully 的使用方式有很多种，这也使得它足以支撑大多数应用场景的原因。



### 初始化

初始化创建主题，具有更好的类型支持。

你可以使用它：**自定义主题包**。



#### 创建样式

首先我们创建一个色彩样式，同时定义其下样式类型以及样式变量。

```typescript
import { CSSStyle } from 'colorfully';

export const color = new CSSStyle('色彩', 'color', {
    light: {
        name: '浅色',
        code: 'light',
        variables: {
            '--color-1': {
                name: '',
                code: '--color-1',
                value: '#e6fffb'
            },
            '--color-2': {
                name: '',
                code: '--color-2',
                value: '#b5f5ec'
            },
            ...{ /* more */}
        }
    },
    dark: {
        name: '深色',
        code: 'dark',
        variables: {
            '--color-1': {
                name: '',
                code: '--color-1',
                value: '#112123'
            },
            '--color-2': {
                name: '',
                code: '--color-2',
                value: '#113536'
            },
            ...{ /* more */}
        }
    }
})
```

你还可以创建更多，如：`shadow` 、`space`、...



统一导出样式

```typescript
import { CSSStyle } from 'colorfully';
import { color } from './color';
import { shadow } from './shadow';
import { space } from './space';

export const defaultStyleMap = { color, space, shadow };
```



如果你想在创建方案时有更友好的提示，你可以这样做：

```typescript
export type DefaultStyleMap<T = typeof defaultStyleMap> = {
  [K in keyof T]: T[K] extends CSSStyle<infer V> ? V : void;
};
```



#### 创建方案

接下来我们创建一个主题方案：

```typescript
import { DefaultStyleMap } from '../style';
import { CSSSchema } from 'colorfully';

export const lightSchema = new CSSSchema<DefaultStyleMap>('浅色主题', 'light', {
  color: 'light',
  shadow: 'default',
  space: 'default'
});
```

你还可以创建更多，如：`darkSchema` 、`defaultSchema`、...



统一导出方案

```typescript
import { defaultSchema } from './default';
import { darkSchema } from './dark';
import { lightSchema } from './light';

export const defaultSchemaMap = { default: defaultSchema, dark: darkSchema, light: lightSchema };
```



#### 实例化

创建好了主题和方案之后，我们就可以去实例化 `Colorfully` 类了。

```typescript
import { Colorfully } from 'colorfully';
import { defaultStyleMap } from './style';
import { defaultSchemaMap } from './schema';

const theme = new Colorfully({ styleMap: defaultStyleMap, schemaMap: defaultSchemaMap });
```



#### 导出实例化类

实例化后便可以导出使用了。

```typescript
export default theme;
```



同时你也可以导出主题类型：

```typescript
export type ThemeType = typeof theme;
```

它可以在你只需要类型提示时使用。



到现在为止，你就拥有了**初始化创建主题**，它具有良好的开发类型提示，这使你在使用 `theme.schema` `API` 时具有良好的类型提示。



### 编程式

使用编程式 `API` 创建主题，具有更好的可编程性。

你可以使用它：**动态创建方案**、**动态创建样式**、**动态修改变量**、...

甚至还可以将主题的控制权交给用户。



#### 实例化

与初始化创建不同的是，编程式创建需要先进行 `Colorfully` 的实例化。

```typescript
const theme = new Colorfully();
```



#### 导出实例化类

将实例化类进行导出。

```typescript
export default theme
```



#### 创建样式

同样的我们以色彩样式示例：

```typescript
import theme from "./theme";

theme.style.create('色彩', 'color', {
  light: {
      name: '浅色',
      code: 'light',
      variables: {
          '--color-1': {
              name: '',
              code: '--color-1',
              value: '#e6fffb'
          },
          '--color-2': {
              name: '',
              code: '--color-2',
              value: '#b5f5ec'
          },
          ...{ /* more */}
      }
  },
  dark: {
      name: '深色',
      code: 'dark',
      variables: {
          '--color-1': {
              name: '',
              code: '--color-1',
              value: '#112123'
          },
          '--color-2': {
              name: '',
              code: '--color-2',
              value: '#113536'
          },
          ...{ /* more */}
      }
  }
})
```

同样的，你还可以创建更多，如：`shadow` 、`space`、...



#### 创建方案

接下来使用 `API` 创建一个方案：

```typescript
import theme from "./theme";

theme.schema.create('浅色主题', 'light', { color: 'light', shadow: 'default', space: 'default' });
```

你还可以创建更多，如：`darkSchema` 、`defaultSchema`、...



### 配置化

与其他使用方案不同的是，在配置化中，你可以很灵活的自由导出导出主题配置。

你可以用它实现：**远程加载主题**、**动态导入主题**、**主题分享**、...



#### 实例化

同样与初始化创建不同的是，配置化创建需要先进行 `Colorfully` 的实例化。

```typescript
const theme = new Colorfully();
```



#### 导出实例化类

将实例化类进行导出。

```typescript
export default theme
```



#### 导入配置（创建样式及方案）

使用 `theme.import` `API` 可以统一导入样式及方案。

```typescript
import theme from "./theme";

const config: ColorfullyConfig = {
  styles: [
    {
      name: '色彩',
      code: 'color',
      types: [
        {
          name: '浅色',
          code: 'light',
          variables: [{ name: '', code: '--color-1', value: '#e6fffb' }]
        }
        /* ... */
      ]
    }
    /* ... */
  ],
  schemas: [
    { name: '浅色主题', code: 'light', map: { color: 'light', shadow: 'default', space: 'default' } }
    /* ... */
  ]
};

theme.import(config);
```



#### 导出配置

使用 `theme.export` `API` 可以统一导出样式及方案。

```typescript
import theme from "./theme";

const config = theme.export()
```



### 引入使用

在使用主题时你可以使用 `theme.use` 方法指定主题方案。

```typescript
import { theme } from "./theme"

theme.use('default')
```



## 场景

接下来给出不同场景下的，解决方案。



### 组件库

**Q**：在我们的日常开发中，避免不了使用各式各样的组件库，那么我们如何快速接入呢？

**A**：因为设计原因，我们的选择器优先级大于大部分组件库的声明选择器，所以我们可以直接对接组件库的变量名，从而达到覆盖的目的。

我们就拿 `antd` 来进行示例。

我们首先在项目调试窗口查看其变量命名，分析过后得出其变量命名的规则。

同时在查阅 `Ant Design` 的[设计语言](https://ant-design.gitee.io/docs/spec/colors-cn)后，分析出其使用 [`@ant-design/colors`](https://www.npmjs.com/package/@ant-design/colors) 快速生成十个色阶，并对各类行为规定了对应的色阶号。

由此可得：

```typescript
import { generate } from "@ant-design/colors"

const getAntdColor = ({ color, name, dark, emitColors }: { color: string, name: string, dark?: boolean, emitColors?: boolean }) => {
  const colors = generate(color, { "theme": dark ? "dark" : "default" })
  const alias = [{ name: '', value: 6 }, { name: 'hover', value: 5 }, { name: 'active', value: 7 }, { name: 'outline', value: 1 }]
  const aliasMap = alias.reduce((map, item) => {
    const code = `--ant-${name}-color${item.name ? `-${item.name}` : ''}`
    const value = colors[item.value - 1]
    map[code] = {
      name: '',
      code,
      value
    }
    return map
  }, {} as Record<string, any>)

  return {
    ...aliasMap, ...(emitColors ? colors.reduce((map, item, index) => {
      const code = `--ant-${name}-${index + 1}`
      const value = item
      map[code] = {
        name: '',
        code,
        value
      }
      return map
    }, {} as Record<string, any>) : {})
  }
}
```

有了这个方法我们就可以快速的创建与其对应的变量。

```typescript
export const color = new CSSStyle('色彩', 'color', {
  light: {
    name: '浅色',
    code: 'light',
    variables: {
      ...getAntdColor({ "color": '#13c2c2', "name": 'primary', "emitColors": true }),
      ...getAntdColor({ "color": '#1890ff', "name": 'info' }),
      ...getAntdColor({ "color": '#52c41a', "name": 'success' }),
      ...getAntdColor({ "color": '#faad14', "name": 'warning' }),
      ...getAntdColor({ "color": '#ff4d4f', "name": 'error' })
    }
  },
  dark: {
    name: '深色',
    code: 'dark',
    variables: {
      ...getAntdColor({ "color": '#13a8a8', "name": 'primary', "emitColors": true, dark: true }),
      ...getAntdColor({ "color": '#177ddc', "name": 'info', dark: true }),
      ...getAntdColor({ "color": '#49aa19', "name": 'success', dark: true }),
      ...getAntdColor({ "color": '#d89614', "name": 'warning', dark: true }),
      ...getAntdColor({ "color": '#a61d24', "name": 'error', dark: true })
    }
  }
});

```

这样在项目中就可以自由的使用 `Colorfully` 的功能了。



### 自适应主题



### 范围主题







## 主题包



## 智能提示



## 智能创建



## 接口
