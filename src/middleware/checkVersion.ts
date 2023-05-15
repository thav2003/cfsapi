import { CheckVersion } from '@src/common/middleware';
import logger from '@src/logger';



const apiVersionMiddleware:CheckVersion = (req, res, next) => {
  // Trích xuất phiên bản từ URL
  const apiVersion = req.path.split('/')[2];

  // Kiểm tra phiên bản yêu cầu
  if (apiVersion === 'v1') {
    // Xử lý các tính năng của phiên bản 1
    logger.info('Version 1 of the API');
    // Chuyển tiếp đến middleware tiếp theo
    next();
  } else if (apiVersion === 'v2') {
    // Xử lý các tính năng của phiên bản 2
    logger.info('Version 2 of the API');
    return res.status(400).json({ success:false, errors:[], message: 'Unsupported API version' });
  } else {
    // Nếu phiên bản không được hỗ trợ, trả về lỗi
    return res.status(400).json({ success:false, errors:[], message: 'Unsupported API version' });
  }
};

export default apiVersionMiddleware;