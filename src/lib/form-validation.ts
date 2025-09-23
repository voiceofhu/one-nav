import { z } from 'zod';

/**
 * 通用表单验证工具类
 * 提供常用的验证规则和工具函数
 */
export class FormValidationUtils {
  /**
   * 验证字符串不为空且去除前后空格后仍有内容
   */
  static nonEmptyString(fieldName: string, maxLength?: number) {
    let schema = z
      .string()
      .min(1, `请输入${fieldName}`)
      .refine((val) => val.trim().length > 0, {
        message: `${fieldName}不能只包含空格`,
      });

    if (maxLength) {
      schema = schema.max(maxLength, `${fieldName}不能超过${maxLength}个字符`);
    }

    return schema;
  }

  /**
   * 验证 URL 格式
   */
  static urlValidation() {
    return z
      .string()
      .min(1, '请输入网址')
      .url('请输入有效的网址（包含 http:// 或 https://）')
      .refine(
        (val) => {
          try {
            const urlObj = new URL(val);
            return ['http:', 'https:'].includes(urlObj.protocol);
          } catch {
            return false;
          }
        },
        {
          message: '只支持 HTTP 或 HTTPS 协议的网址',
        },
      );
  }

  /**
   * 验证必选的父级 ID
   */
  static requiredParentId() {
    return z
      .string()
      .min(1, '请选择保存位置')
      .refine((val) => val !== '', {
        message: '必须选择一个有效的保存位置',
      });
  }

  /**
   * 验证 TOTP 密钥格式
   */
  static totpValidation() {
    return z
      .string()
      .optional()
      .default('')
      .refine(
        (val) => {
          if (!val || val.trim() === '') return true;
          // 验证 otpauth:// 格式或简单的 base32 密钥
          return (
            val.startsWith('otpauth://') ||
            /^[A-Z2-7]+=*$/i.test(val.replace(/\s/g, ''))
          );
        },
        {
          message: '请输入有效的 TOTP 密钥或 otpauth:// 链接',
        },
      );
  }

  /**
   * 账号凭据验证模式
   */
  static accountCredentialsSchema() {
    return z.object({
      username: z.string().optional().default(''),
      password: z.string().optional().default(''),
      totp: this.totpValidation(),
    });
  }
}

/**
 * 书签表单验证模式
 */
export const bookmarkFormSchema = z.object({
  title: FormValidationUtils.nonEmptyString('书签名称', 200),
  url: FormValidationUtils.urlValidation(),
  parentId: FormValidationUtils.requiredParentId(),
  accounts: z.array(FormValidationUtils.accountCredentialsSchema()).default([]),
});

/**
 * 文件夹表单验证模式
 */
export const folderFormSchema = z.object({
  name: FormValidationUtils.nonEmptyString('名称', 100),
  parentId: FormValidationUtils.requiredParentId(),
});

/**
 * React Hook Form 配置常量
 */
export const FORM_CONFIG = {
  mode: 'onBlur' as const,
  reValidateMode: 'onChange' as const,
  criteriaMode: 'all' as const,
} as const;

/**
 * 表单错误处理工具
 */
export class FormErrorHandler {
  /**
   * 处理表单提交错误，聚焦到第一个错误字段
   */
  static handleSubmitError<T extends Record<string, unknown>>(
    errors: Partial<T>,
    form: { setFocus: (field: keyof T) => void },
    validFields: (keyof T)[],
  ) {
    console.warn('Form validation errors:', errors);
    const firstError = Object.keys(errors)[0] as keyof T;
    if (firstError && validFields.includes(firstError)) {
      form.setFocus(firstError);
    }
  }

  /**
   * 获取字段错误样式类名
   */
  static getFieldErrorClassName(hasError: boolean) {
    return hasError ? 'border-destructive focus-visible:ring-destructive' : '';
  }

  /**
   * 获取标签错误样式类名
   */
  static getLabelErrorClassName(hasError: boolean) {
    return hasError ? 'text-destructive' : '';
  }
}
