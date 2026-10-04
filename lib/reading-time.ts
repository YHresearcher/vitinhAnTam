/**
 * Tiện ích đo lường thời gian đọc & độ dài bài viết cho Blog Vi Tính An Tâm
 * Hỗ trợ định dạng văn bản Tiếng Việt, đếm ảnh, video và xuất ISO 8601 cho SEO Schema.
 */

export interface ReadingStats {
  words: number;
  minutes: number;
  text: string;
  timeRequiredIso: string;
  imagesCount: number;
}

export function calculateReadingTime(contentOrHtml: string, wordsPerMinute = 220): ReadingStats {
  if (!contentOrHtml || typeof contentOrHtml !== 'string') {
    return {
      words: 0,
      minutes: 1,
      text: '1 phút đọc',
      timeRequiredIso: 'PT1M',
      imagesCount: 0,
    };
  }

  // Đếm số lượng ảnh <img>
  const imgMatches = contentOrHtml.match(/<img[^>]+>/gi) || [];
  const imagesCount = imgMatches.length;

  // Đếm số lượng video/iframe youtube
  const videoMatches = contentOrHtml.match(/<iframe[^>]+>|<video[^>]+>/gi) || [];
  const videosCount = videoMatches.length;

  // Loại bỏ tất cả các thẻ HTML để lấy văn bản thuần
  const plainText = contentOrHtml
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Đếm từ bằng regex hỗ trợ tiếng Việt & ký tự chữ số
  const wordsArray = plainText.match(/[\p{L}\p{N}]+/gu) || [];
  const wordCount = wordsArray.length;

  // Tính thời gian đọc cơ bản (phút)
  const baseMinutes = wordCount / wordsPerMinute;
  
  // Mỗi ảnh cộng thêm 12 giây (0.2 phút), mỗi video cộng 30 giây (0.5 phút)
  const mediaMinutes = imagesCount * 0.2 + videosCount * 0.5;

  const totalMinutes = Math.max(1, Math.ceil(baseMinutes + mediaMinutes));

  return {
    words: wordCount,
    minutes: totalMinutes,
    text: `${totalMinutes} phút đọc`,
    timeRequiredIso: `PT${totalMinutes}M`,
    imagesCount,
  };
}
