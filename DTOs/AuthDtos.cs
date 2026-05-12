using System.ComponentModel.DataAnnotations;

namespace SmartShoppingAssistant.DTOs
{
    // كلاس خاص ببيانات إنشاء حساب جديد
    public class RegisterDto
    {
        [Required(ErrorMessage = "البريد الإلكتروني مطلوب")]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "كلمة المرور مطلوبة")]
        [MinLength(6, ErrorMessage = "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل")]
        public string Password { get; set; } = string.Empty;
    }

    // كلاس خاص ببيانات تسجيل الدخول
    public class LoginDto
    {
        [Required(ErrorMessage = "البريد الإلكتروني مطلوب")]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "كلمة المرور مطلوبة")]
        public string Password { get; set; } = string.Empty;
    }
}