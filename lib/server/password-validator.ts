/**
 * Password Security Validator
 * 
 * Nguyên tắc bảo mật mật khẩu:
 * - Độ dài: 8-15 ký tự
 * - Bắt buộc có: chữ cái, số, kí hiệu đặc biệt
 * - Không được trùng mật khẩu mặc định (Antam@2026)
 */

export const DEFAULT_TEMPORARY_PASSWORD = 'Antam@2026';

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate mật khẩu theo nguyên tắc bảo mật
 * @param password - Mật khẩu cần kiểm tra
 * @param forbiddenPasswords - Danh sách mật khẩu bị cấm (vd: mật khẩu cũ, mật khẩu mặc định)
 * @returns PasswordValidationResult
 */
export function validatePassword(
  password: string,
  forbiddenPasswords: string[] = []
): PasswordValidationResult {
  const errors: string[] = [];

  // Kiểm tra rỗng
  if (!password || password.trim().length === 0) {
    errors.push('Mật khẩu không được để trống.');
    return { valid: false, errors };
  }

  const trimmedPassword = password.trim();

  // Kiểm tra độ dài
  if (trimmedPassword.length < 8) {
    errors.push('Mật khẩu phải có tối thiểu 8 ký tự.');
  }
  if (trimmedPassword.length > 15) {
    errors.push('Mật khẩu không được vượt quá 15 ký tự.');
  }

  // Kiểm tra ký tự chữ (a-z, A-Z)
  if (!/[a-zA-Z]/.test(trimmedPassword)) {
    errors.push('Mật khẩu phải chứa ít nhất một ký tự chữ (a-z hoặc A-Z).');
  }

  // Kiểm tra ký tự số (0-9)
  if (!/\d/.test(trimmedPassword)) {
    errors.push('Mật khẩu phải chứa ít nhất một ký tự số (0-9).');
  }

  // Kiểm tra kí hiệu đặc biệt
  // Các ký tự đặc biệt được phép: !@#$%^&*()_+-=[]{}|;:,.<>?
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(trimmedPassword)) {
    errors.push(
      'Mật khẩu phải chứa ít nhất một ký tự đặc biệt (!@#$%^&*()_+-=[]{}|;:,.<>?).'
    );
  }

  // Kiểm tra mật khẩu bị cấm
  const defaultList = [DEFAULT_TEMPORARY_PASSWORD, ...forbiddenPasswords];
  for (const forbidden of defaultList) {
    if (trimmedPassword === forbidden) {
      if (forbidden === DEFAULT_TEMPORARY_PASSWORD) {
        errors.push(`Mật khẩu mới không được trùng mật khẩu mặc định (${DEFAULT_TEMPORARY_PASSWORD}).`);
      } else {
        errors.push(`Mật khẩu mới không được trùng với mật khẩu cũ.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Lấy thông báo hướng dẫn yêu cầu mật khẩu
 * @returns Chuỗi hướng dẫn
 */
export function getPasswordRequirements(): string {
  return 'Mật khẩu phải: 8-15 ký tự, bao gồm chữ, số, và ký tự đặc biệt (!@#$%^&*...)';
}
