export enum StaticStringKeys {
  INVALID_REQUEST = 'Invalid request',
  INVALID_CREDENTIAL = 'Invalid credential',
  INVALID_ACCESS_TOKEN = 'Invalid access token',
  INVALID_REFRESH_TOKEN = 'Invalid refresh token',
  INVALID_EMAIL = 'Invalid email',
  INVALID_PASSWORD = 'Invalid password',
  INVALID_USERNAME = 'Invalid username',
  EMAIL_NOT_VERIFIED = 'Email not verified !!!',
  USER_NOT_FOUND = 'User not found',
  USERNAME_NOT_AVAILABLE = 'Try another username',
  EMAIL_NOT_AVAILABLE = 'Try another email',
  EMAIL_ALREADY_EXIST = 'Email already exist',
  REQUIRED_REFRESH_TOKEN = 'Require refesh token',
  EXPIRED_TOKEN = 'Refresh token is expired',
  UNKNOWN_ERROR_TRY_AGAIN = 'Unknown error occured. Please try again.',

  REPOSITORY_ERROR_INVALID_ID = 'Invalid id',
  REPOSITORY_ERROR_INVALID_DATE = 'Invalid date',
}

export enum StaticMessage {
  LOGIN_SUCCESS = 'Đăng nhập thành công',
  REGISTER_SUCCESS = 'Đăng kí thành công',
  ACCESS_TOKEN_SUCCESS = 'Refresh access token thành công',

  EMAIL_EXIST = 'Email đã tồn tại',

  ACTION_FAILD = 'Đã xảy ra lỗi',

  EXPIRED_R_TOKEN = 'Refresh token đã hết hạn',
  EXPIRED_VERIFY = 'Link xác thực đã quá hạn',

  LOGIN_FAILD = 'Đăng nhập thất bại',
  REGISTER_FAILD = 'Đăng kí thất bại',
  ACCESS_TOKEN_FAILD = 'Refresh access token thất bại',
  VERIFY_EMAIL_FAILD = 'Xác thực email thất bại',
}

export enum StaticErrors {
  BadRequestError = 'Lỗi không xác định',
  UnauthorizedError = 'Không sở hữu quyền truy cập',
  TOKEN_ERROR = 'Lỗi token',
  REPO_ERROR = 'Lỗi tầng repository',
  DUPLICATE = 'Dữ liệu đã tồn tại',
  INVALID = 'Dữ liệu không hợp lệ',
  NOT_FOUND = 'Dữ liệu không tồn tại',
  REQUIRED = 'Thiếu trường dữ liệu',
  EMAIL_NOT_VERIFIED = 'Email chưa được xác thực',
  INVALID_PARAMETER = 'Lỗi tham số Url',
}

