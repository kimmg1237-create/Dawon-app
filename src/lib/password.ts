/** 영문(대소문자) + 숫자 포함, 8~20자 */
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/

export function validatePassword(password: string): string | null {
  if (password.length < 8 || password.length > 20) {
    return '비밀번호는 8자 이상 20자 이내로 입력해 주세요.'
  }
  if (!/[A-Za-z]/.test(password)) {
    return '비밀번호에 영문 알파벳을 포함해 주세요.'
  }
  if (!/\d/.test(password)) {
    return '비밀번호에 숫자를 포함해 주세요.'
  }
  if (!PASSWORD_RULE.test(password)) {
    return '비밀번호는 영문과 숫자만 사용하며, 둘 다 포함해야 합니다.'
  }
  return null
}

export const PASSWORD_HINT = '영문+숫자 조합, 8~20자 (특수문자 불가)'
